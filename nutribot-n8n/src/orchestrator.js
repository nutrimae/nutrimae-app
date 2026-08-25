import { normalizeEvent } from "./normalize.js";
import { decideRoute, ROUTES } from "./router.js";
import { claimMessage, upsertSessionAfterReply, shouldNotifyError, markErrorNotified } from "./sessionStore.js";
import { interpretTypebotResult } from "./typebotResponse.js";
import {
  MSG_NEED_EMAIL_MEMORY,
  MSG_INVALID_EMAIL,
  MSG_WELCOME_NO_SESSION,
  MSG_TEMPORARY_ERROR,
} from "./messages.js";
import { logInfo, logError } from "./logger.js";

/**
 * Orquestra UM evento de webhook de ponta a ponta: normalização -> claim
 * (dedup) -> decisão de rota -> chamada ao Typebot quando aplicável ->
 * persistência -> envio via Z-API.
 *
 * Este arquivo é a fonte da verdade da lógica de negócio. O workflow n8n
 * (workflow/nutribot.workflow.json) implementa os MESMOS passos como nodes
 * nativos (Postgres/HTTP Request/Switch) em vez de chamar este arquivo
 * diretamente — Code nodes do n8n não importam módulos locais. Por isso
 * este arquivo é coberto por tests/acceptance.test.mjs: é o jeito de
 * validar as regras de negócio sem precisar de uma instância n8n rodando.
 *
 * @param {unknown} rawEvent payload cru do webhook da Z-API
 * @param {{
 *   db: import('./sessionStore.js').QueryClient,
 *   typebot: ReturnType<typeof import('./typebotClient.js').createTypebotClient>,
 *   zapi: ReturnType<typeof import('./zapiClient.js').createZapiClient>,
 *   now?: Date,
 *   sessionTtlHours?: number,
 *   errorCooldownMinutes?: number,
 * }} deps
 */
export async function handleWhatsAppEvent(rawEvent, deps) {
  const now = deps.now ?? new Date();
  const sessionTtlHours = deps.sessionTtlHours ?? 24;
  const errorCooldownMinutes = deps.errorCooldownMinutes ?? 10;

  const event = normalizeEvent(rawEvent);

  // Rota 1 (spec seção 5/8): fromMe ou payload inválido nunca chega a
  // tocar banco, Typebot ou Z-API.
  if (event.fromMe || !event.phone || !event.text || !event.messageId) {
    logInfo("route.rejected", { phone: event.phone, messageId: event.messageId });
    return { route: ROUTES.REJECTED, sent: false };
  }

  const claim = await claimMessage(deps.db, { phone: event.phone, messageId: event.messageId });

  if (!claim.claimed) {
    logInfo("route.duplicate_ignored", { phone: event.phone, messageId: event.messageId });
    return { route: ROUTES.DUPLICATE, sent: false };
  }

  // Se o claim acabou de CRIAR a linha (telefone nunca visto antes), não
  // existia sessão alguma até este exato momento — a linha física já
  // existe no banco (para o dedup funcionar), mas semanticamente, para
  // fins de roteamento, é como se não houvesse sessão (rota 7, não rota 6).
  const sessionForRouting = claim.isNewRow ? null : claim.session;
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
      return continueConversation(deps, event, claim.session, now, errorCooldownMinutes);

    default:
      // REJECTED/DUPLICATE já tratados acima antes do claim; chegar aqui
      // indicaria uma rota nova não mapeada — falha alto e visível.
      logError("route.unhandled", { phone: event.phone, route: decision.route });
      throw new Error(`Rota não tratada: ${decision.route}`);
  }
}

async function startOrRestartConversation(deps, event, session, route, now, cooldownMinutes, emailOverride) {
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

async function continueConversation(deps, event, session, now, cooldownMinutes) {
  try {
    const result = await deps.typebot.continueChat({
      sessionId: session.session_id,
      message: event.text,
    });
    return await persistTypebotReply(
      deps,
      event,
      result,
      ROUTES.CONTINUATION,
      session.email_cliente,
      session.idade_bebe,
    );
  } catch (err) {
    return await handleTypebotError(deps, event, session, now, cooldownMinutes, err);
  }
}

async function persistTypebotReply(deps, event, result, route, email, idade) {
  const interpreted = interpretTypebotResult(result);

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
  }

  return { route, sent: interpreted.hasReply, shouldKeepSession: interpreted.shouldKeepSession };
}

async function handleTypebotError(deps, event, session, now, cooldownMinutes, err) {
  logError("typebot.call_failed", {
    phone: event.phone,
    messageId: event.messageId,
    errorName: err?.name,
    errorMessage: err?.message,
  });

  // Erro temporário: NUNCA apaga session_id/email/idade (spec seção 16/19).
  if (shouldNotifyError(session, now, cooldownMinutes)) {
    await sendText(deps, event.phone, MSG_TEMPORARY_ERROR);
    await markErrorNotified(deps.db, event.phone);
    return { route: "error_temporary", sent: true };
  }

  return { route: "error_temporary_cooldown", sent: false };
}

async function sendText(deps, phone, message) {
  await deps.zapi.sendText({ to: phone, message });
}
