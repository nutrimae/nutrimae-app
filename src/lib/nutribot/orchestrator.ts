import type { createAdminClient } from "@/lib/supabase/admin";
import type { NormalizedEvent } from "./normalize";
import { decideRoute, ROUTES, type SessionRow as RouterSessionRow } from "./router";
import {
  claimMessage,
  upsertSessionAfterReply,
  shouldNotifyError,
  markErrorNotified,
  type SessionRow,
} from "./sessionStore";
import { interpretTypebotResult } from "./typebotResponse";
import { MSG_NEED_EMAIL_MEMORY, MSG_INVALID_EMAIL, MSG_WELCOME_NO_SESSION, MSG_TEMPORARY_ERROR } from "./messages";
import { logInfo, logError } from "./logger";
import type { createTypebotClient } from "./typebotClient";
import { resolveBabyContext } from "./babyContext";
import { answerWithFoodAssistant } from "./foodAssistant";
import { logConversationTurn } from "./conversationLog";

type AdminClient = ReturnType<typeof createAdminClient>;
type TypebotClient = ReturnType<typeof createTypebotClient>;

/** Qualquer provedor de envio (Evolution API, WhatsApp Cloud API, ...) — só precisa saber mandar texto. */
export interface WhatsAppSendClient {
  sendText(args: { to: string; message: string }): Promise<unknown>;
}

interface Deps {
  db: AdminClient;
  typebot: TypebotClient;
  evolution: WhatsAppSendClient;
  now?: Date;
  sessionTtlHours?: number;
  errorCooldownMinutes?: number;
}

/**
 * Orquestra UM evento de webhook de ponta a ponta: normalização -> claim
 * (dedup) -> decisão de rota -> chamada ao Typebot quando aplicável ->
 * persistência -> envio via Evolution API.
 *
 * Portado de nutribot-n8n/src/orchestrator.js — mesma lógica de negócio,
 * testada e validada em produção rodando via n8n; só a "cola" de
 * infraestrutura (banco, cliente de envio) mudou.
 */
export async function handleWhatsAppEvent(event: NormalizedEvent, deps: Deps) {
  const now = deps.now ?? new Date();
  const sessionTtlHours = deps.sessionTtlHours ?? 24;
  const errorCooldownMinutes = deps.errorCooldownMinutes ?? 10;

  if (event.fromMe || !event.phone || !event.text || !event.messageId) {
    logInfo("route.rejected", { phone: event.phone, messageId: event.messageId });
    return { route: ROUTES.REJECTED, sent: false };
  }

  const claim = await claimMessage(deps.db, { phone: event.phone, messageId: event.messageId });

  if (!claim.claimed) {
    logInfo("route.duplicate_ignored", { phone: event.phone, messageId: event.messageId });
    return { route: ROUTES.DUPLICATE, sent: false };
  }

  const sessionForRouting: RouterSessionRow | null = claim.isNewRow ? null : claim.session;
  const decision = decideRoute(event, sessionForRouting, { now, sessionTtlHours });

  logInfo("route.decided", {
    phone: event.phone,
    messageId: event.messageId,
    route: decision.route,
    reason: decision.reason,
  });

  switch (decision.route) {
    case ROUTES.EMAIL_INVALID:
      await sendText(deps, event.phone, MSG_INVALID_EMAIL);
      return { route: decision.route, sent: true };

    case ROUTES.INITIAL_NO_SESSION:
      await sendText(deps, event.phone, MSG_WELCOME_NO_SESSION);
      return { route: decision.route, sent: true };

    case ROUTES.FALLBACK_EXPIRED_OR_INVALID: {
      if (!decision.hasEmail) {
        await sendText(deps, event.phone, MSG_NEED_EMAIL_MEMORY);
        return { route: decision.route, sent: true };
      }
      return startOrRestartConversation(deps, event, claim.session, decision.route, now, errorCooldownMinutes);
    }

    case ROUTES.RESET: {
      const hasEmail = Boolean(claim.session?.email_cliente);
      if (!hasEmail) {
        await sendText(deps, event.phone, MSG_NEED_EMAIL_MEMORY);
        return { route: decision.route, sent: true };
      }
      return startOrRestartConversation(deps, event, claim.session, decision.route, now, errorCooldownMinutes);
    }

    case ROUTES.EMAIL_VALID:
      return startOrRestartConversation(
        deps,
        event,
        claim.session,
        decision.route,
        now,
        errorCooldownMinutes,
        event.normalizedEmail,
      );

    case ROUTES.CONTINUATION:
      return continueConversation(deps, event, claim.session!, now, errorCooldownMinutes);

    default:
      logError("route.unhandled", { phone: event.phone, route: decision.route });
      throw new Error(`Rota não tratada: ${decision.route}`);
  }
}

async function startOrRestartConversation(
  deps: Deps,
  event: NormalizedEvent,
  session: SessionRow | null,
  route: string,
  now: Date,
  cooldownMinutes: number,
  emailOverride?: string | null,
) {
  const email = emailOverride ?? session?.email_cliente ?? null;
  const idade = session?.idade_bebe ?? null;

  try {
    const result = await deps.typebot.startChat({
      prefilledVariables: {
        email_cliente: email,
        telefone: event.phone,
        ...(idade ? { idade_bebe: idade } : {}),
      },
    });
    return await persistTypebotReply(deps, event, result, route, email, idade);
  } catch (err) {
    return await handleTypebotError(deps, event, session, now, cooldownMinutes, err);
  }
}

async function continueConversation(deps: Deps, event: NormalizedEvent, session: SessionRow, now: Date, cooldownMinutes: number) {
  // Antes de repassar pro fluxo roteirizado do Typebot, tenta responder com
  // o histórico real do bebê (Diário, alergia conhecida) quando a mensagem
  // for sobre alimentação — ver src/lib/nutribot/foodAssistant.ts. Se a
  // pergunta não for sobre isso, ou o telefone não estiver vinculado a
  // nenhuma conta ainda, cai no Typebot exatamente como antes.
  const babyContext = await resolveBabyContext(deps.db, event.phone).catch((err) => {
    logError("baby_context.resolve_failed", { phone: event.phone, error: (err as Error)?.message });
    return null;
  });

  await logConversationTurn(deps.db, {
    phone: event.phone,
    userId: babyContext?.userId ?? null,
    babyId: babyContext?.babyId ?? null,
    direction: "in",
    message: event.text,
  });

  if (babyContext) {
    const assistant = await answerWithFoodAssistant(babyContext, event.text);
    if (assistant.handled && assistant.reply) {
      await sendText(deps, event.phone, assistant.reply);
      await logConversationTurn(deps.db, {
        phone: event.phone,
        userId: babyContext.userId,
        babyId: babyContext.babyId,
        direction: "out",
        message: assistant.reply,
      });
      // Mantém a sessão do Typebot como está (mesmo session_id) — só
      // atualiza o "último recado processado", pra essa resposta não
      // atrapalhar uma continuação normal do fluxo roteirizado depois.
      await upsertSessionAfterReply(deps.db, {
        phone: event.phone,
        sessionId: session.session_id,
        lastMessageId: event.messageId,
        emailCliente: session.email_cliente,
        idadeBebe: session.idade_bebe,
        keepSession: true,
        route: "food_assistant",
      });
      return { route: "food_assistant", sent: true };
    }
  }

  try {
    const result = await deps.typebot.continueChat({
      sessionId: session.session_id,
      message: event.text,
    });
    return await persistTypebotReply(deps, event, result, ROUTES.CONTINUATION, session.email_cliente, session.idade_bebe);
  } catch (err) {
    return await handleTypebotError(deps, event, session, now, cooldownMinutes, err);
  }
}

async function persistTypebotReply(
  deps: Deps,
  event: NormalizedEvent,
  result: unknown,
  route: string,
  email: string | null,
  idade: string | null,
) {
  const interpreted = interpretTypebotResult(result as never);

  await upsertSessionAfterReply(deps.db, {
    phone: event.phone,
    sessionId: interpreted.sessionId,
    lastMessageId: event.messageId,
    emailCliente: email,
    idadeBebe: idade,
    keepSession: interpreted.shouldKeepSession,
    route,
  });

  if (interpreted.hasReply) {
    await sendText(deps, event.phone, interpreted.replyText);
    await logConversationTurn(deps.db, {
      phone: event.phone,
      userId: null,
      babyId: null,
      direction: "out",
      message: interpreted.replyText,
    });
  }

  return { route, sent: interpreted.hasReply, shouldKeepSession: interpreted.shouldKeepSession };
}

async function handleTypebotError(
  deps: Deps,
  event: NormalizedEvent,
  session: SessionRow | null,
  now: Date,
  cooldownMinutes: number,
  err: unknown,
) {
  const error = err as Error;
  logError("typebot.call_failed", {
    phone: event.phone,
    messageId: event.messageId,
    errorName: error?.name,
    errorMessage: error?.message,
  });

  if (shouldNotifyError(session, now, cooldownMinutes)) {
    await sendText(deps, event.phone, MSG_TEMPORARY_ERROR);
    await markErrorNotified(deps.db, event.phone);
    return { route: "error_temporary", sent: true };
  }

  return { route: "error_temporary_cooldown", sent: false };
}

async function sendText(deps: Deps, phone: string, message: string) {
  await deps.evolution.sendText({ to: phone, message });
}
