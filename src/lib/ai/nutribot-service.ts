/**
 * Serviço de IA da NutriBot — nutricionista materno-infantil via WhatsApp.
 *
 * Variáveis de ambiente necessárias:
 * - OPENAI_API_KEY: chave da API da OpenAI usada tanto para o chat quanto,
 *   futuramente, para transcrição de áudio (Whisper).
 */

const SYSTEM_PROMPT = `Você é a NutriBot, uma nutricionista materno-infantil empática, acolhedora e direta. Você fala com mães exaustas que estão na fase de introdução alimentar dos seus bebês (6 a 24 meses). Responda sempre de forma curta (máximo 2 parágrafos no WhatsApp), use emojis moderadamente. Se houver suspeita de engasgo real (bebê sem ar, roxo), mande imediatamente procurar o pronto-socorro e aplique a manobra de Heimlich. Baseie-se no método BLW e na introdução tradicional.`;

const FALLBACK_REPLY =
  "Desculpa, tive um probleminha aqui para te responder agora 😕 Pode tentar mandar sua mensagem de novo em um minuto?";

/**
 * Transcreve um áudio (já baixado via whatsapp-client.downloadMedia) usando
 * a Whisper API da OpenAI.
 */
export async function transcribeAudio(mediaBlob: Blob): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada — necessária para transcrever áudio.");
  }

  const audioFile = new File([mediaBlob], "audio.ogg", {
    type: mediaBlob.type || "audio/ogg",
  });

  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(
      `Falha ao transcrever áudio na OpenAI Whisper (status ${res.status}): ${errorBody}`,
    );
  }

  const data: { text?: string } = await res.json();
  if (!data.text) {
    throw new Error("Resposta da Whisper API não trouxe um texto transcrito.");
  }

  return data.text;
}

/**
 * Gera a resposta da NutriBot para uma mensagem de texto (já transcrita, se
 * originalmente for áudio).
 */
export async function getAiResponse(userMessage: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("[nutribot-service] OPENAI_API_KEY não configurada.");
    return FALLBACK_REPLY;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "");
      console.error(
        `[nutribot-service] OpenAI respondeu com status ${res.status}: ${errorBody}`,
      );
      return FALLBACK_REPLY;
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || reply.trim().length === 0) {
      console.error("[nutribot-service] Resposta da OpenAI sem conteúdo utilizável.", data);
      return FALLBACK_REPLY;
    }

    return reply.trim();
  } catch (err) {
    console.error("[nutribot-service] Falha ao chamar a OpenAI.", err);
    return FALLBACK_REPLY;
  }
}
