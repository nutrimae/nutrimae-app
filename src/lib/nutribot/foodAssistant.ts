import { searchFoods } from "@/lib/foods";
import { getFoodPrepGuide } from "@/lib/food-prep";
import { AGE_BAND_LABEL, ageBandForMonths } from "@/lib/menu";
import { ALLERGEN_LABEL } from "@/lib/recipes";
import type { BabyContext } from "./babyContext";
import { logError } from "./logger";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_NUTRIBOT_MODEL || "gpt-4o-mini";

const FALLBACK_NOT_FOUND =
  "Não encontrei esse alimento na nossa base revisada ainda. Pra não arriscar te passar uma informação errada, dá uma olhada na Busca de Corte Seguro dentro do app — lá está tudo o que já foi revisado.";

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "buscar_alimento",
      description:
        "Busca um alimento na base revisada de segurança alimentar (corte por idade, alerta de risco, modo de preparo). Use SEMPRE que a pergunta envolver um alimento específico — nunca responda sobre corte, idade mínima ou risco de engasgo sem antes chamar esta função.",
      parameters: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Nome do alimento perguntado, em português, como a mãe escreveu (ex: 'manga', 'uva', 'peixe')." },
        },
        required: ["nome"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "fora_do_escopo",
      description:
        "Chame esta função (sem responder nada de conteúdo) quando a mensagem NÃO for uma pergunta sobre alimentação/introdução alimentar do bebê — por exemplo dúvida de cobrança, reclamação, problema técnico do app, ou pedido de diagnóstico médico. Isso encaminha a conversa pro fluxo normal de atendimento.",
      parameters: { type: "object", properties: {} },
    },
  },
];

interface FoodLookupResult {
  name: string;
  corteParaFase: string;
  alerta: string | null;
  alergenicos: string[];
  modoPreparo: string[] | null;
}

function lookupFood(nome: string, ctx: BabyContext): FoodLookupResult | null {
  const [match] = searchFoods(nome, ctx.region);
  if (!match) return null;
  const band = ageBandForMonths(ctx.ageMonths);
  const guide = getFoodPrepGuide(match.id);
  return {
    name: match.name,
    corteParaFase: `${AGE_BAND_LABEL[band]}: ${match.cuts[band]}`,
    alerta: match.warning ?? null,
    alergenicos: match.alergenico_declarado ?? [],
    modoPreparo: guide ? guide.steps.map((s) => s.action) : null,
  };
}

function knownAllergenOverlap(ctx: BabyContext, alergenicos: string[]): string[] {
  return alergenicos.filter((a) => ctx.allergens.includes(a as (typeof ctx.allergens)[number]));
}

function buildSystemPrompt(ctx: BabyContext): string {
  const allergenLine = ctx.allergens.length
    ? `Alergênicos com reação conhecida marcados pela família: ${ctx.allergens.map((a) => ALLERGEN_LABEL[a] ?? a).join(", ")}.`
    : "Nenhum alergênico marcado com reação conhecida.";

  const diaryLine = ctx.recentFoodLog.length
    ? `Últimos alimentos registrados no Diário (mais recente primeiro): ${ctx.recentFoodLog
        .slice(0, 15)
        .map((e) => `${e.foodKey} (${e.reaction})`)
        .join(", ")}.`
    : "Nenhum alimento registrado no Diário ainda.";

  return [
    "Você é o NutriBot, assistente do app NutriMãe, respondendo pelo WhatsApp. Tom: mãe experiente falando com mãe cansada — respostas curtas (é WhatsApp, não e-mail), sem emoji em excesso, sem tom de vendedor.",
    `Bebê: ${ctx.babyName}, ${ctx.ageMonths} meses.`,
    allergenLine,
    diaryLine,
    "REGRA MAIS IMPORTANTE: você NUNCA inventa corte, idade mínima ou risco de engasgo de um alimento. Toda vez que a pergunta envolver um alimento específico, chame a função buscar_alimento antes de responder qualquer coisa sobre segurança daquele alimento. Se a função não encontrar o alimento, diga isso claramente e sugira abrir a Busca de Corte Seguro no app — nunca responda de memória.",
    "Se o alimento buscado tiver um alergênico que bate com algum já marcado como reação conhecida da família, avise isso PRIMEIRO, antes de qualquer outra informação, com destaque.",
    "Se a pergunta não for sobre alimentação/introdução alimentar do bebê (cobrança, reclamação, bug do app, diagnóstico médico específico), chame a função fora_do_escopo em vez de tentar responder.",
    "Nunca decodifica ou responde como se fosse diagnóstico médico. Nunca promete resultado de saúde. Nunca oferece upsell ou expansão paga na mesma conversa em que respondeu dúvida de segurança alimentar ou alergia.",
  ].join("\n");
}

export interface FoodAssistantResult {
  /** false = não era pergunta de alimentação; quem chamou deve cair no fluxo normal (Typebot). */
  handled: boolean;
  reply?: string;
}

/**
 * Responde uma mensagem usando o histórico real do bebê (Diário, alergia
 * conhecida) e a base de alimentos já revisada — nunca gera informação de
 * segurança alimentar livremente (ver system prompt). Se a pergunta não for
 * sobre alimentação, retorna handled:false pro chamador seguir pro Typebot.
 */
export async function answerWithFoodAssistant(ctx: BabyContext, userMessage: string): Promise<FoodAssistantResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logError("food_assistant.missing_api_key", {});
    return { handled: false };
  }

  const messages: Array<Record<string, unknown>> = [
    { role: "system", content: buildSystemPrompt(ctx) },
    { role: "user", content: userMessage },
  ];

  try {
    // Primeira chamada: o modelo decide se chama uma função ou responde direto.
    const first = await callChat(apiKey, messages);
    const firstMessage = first.choices?.[0]?.message;
    const toolCalls = firstMessage?.tool_calls as Array<{ id: string; function: { name: string; arguments: string } }> | undefined;

    if (!toolCalls || toolCalls.length === 0) {
      // Sem chamada de função nenhuma pra uma pergunta que devia usar
      // buscar_alimento é sinal de que não é pergunta de alimento — mas o
      // modelo também pode responder direto pra saudação/agradecimento.
      return { handled: true, reply: firstMessage?.content ?? undefined };
    }

    const call = toolCalls[0];
    if (call.function.name === "fora_do_escopo") {
      return { handled: false };
    }

    if (call.function.name === "buscar_alimento") {
      let nome = "";
      try {
        nome = (JSON.parse(call.function.arguments) as { nome?: string }).nome ?? "";
      } catch {
        // arguments malformados — trata como não encontrado
      }
      const found = lookupFood(nome, ctx);
      const overlap = found ? knownAllergenOverlap(ctx, found.alergenicos) : [];

      messages.push(firstMessage as Record<string, unknown>);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(found ?? { encontrado: false }),
      });

      const second = await callChat(apiKey, messages);
      let reply = second.choices?.[0]?.message?.content ?? FALLBACK_NOT_FOUND;

      if (!found) reply = FALLBACK_NOT_FOUND;
      if (overlap.length > 0) {
        const labels = overlap.map((a) => ALLERGEN_LABEL[a as keyof typeof ALLERGEN_LABEL] ?? a).join(", ");
        reply = `⚠️ Atenção: ${found!.name} contém ${labels}, que já está marcado como alergênico conhecido de ${ctx.babyName}. Fale com o pediatra antes de oferecer.\n\n${reply}`;
      }

      return { handled: true, reply };
    }

    return { handled: false };
  } catch (err) {
    logError("food_assistant.call_failed", { error: (err as Error)?.message });
    return { handled: false };
  }
}

async function callChat(apiKey: string, messages: Array<Record<string, unknown>>) {
  const res = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.4,
      max_tokens: 400,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI chat error (${res.status}): ${text}`);
  }
  return res.json() as Promise<{ choices?: Array<{ message?: { content?: string | null; tool_calls?: unknown } }> }>;
}
