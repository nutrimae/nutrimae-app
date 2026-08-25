/**
 * Interpreta a resposta do Typebot (startChat/continueChat) seguindo as
 * regras da spec seção 15/16:
 *
 * - só mensagens type=text contam;
 * - conteúdo vem de content.markdown OU content.richText;
 * - mensagens vazias são descartadas, o resto é unido com "\n";
 * - a decisão de manter/encerrar sessão depende SOMENTE da presença de
 *   `input` na resposta — nunca do array `messages` estar vazio.
 *   ("messages vazio sozinho nunca deve apagar memória / pedir e-mail de novo")
 */

function richTextToString(richText) {
  if (!Array.isArray(richText)) return "";
  return richText.map(flattenRichTextNode).filter(Boolean).join("\n");
}

function flattenRichTextNode(node) {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(flattenRichTextNode).join("");
  }
  return "";
}

export function extractMessageText(message) {
  if (!message || message.type !== "text") return "";
  const content = message.content ?? {};
  const raw = content.markdown ?? content.richText ?? "";
  if (raw == null) return "";
  const text = typeof raw === "string" ? raw : richTextToString(raw);
  return text.trim();
}

export function composeReplyText(typebotMessages) {
  const list = Array.isArray(typebotMessages) ? typebotMessages : [];
  return list
    .map(extractMessageText)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .join("\n");
}

/**
 * @param {{sessionId?: string, messages?: unknown[], input?: unknown}} result
 */
export function interpretTypebotResult(result) {
  const messages = Array.isArray(result?.messages) ? result.messages : [];
  const hasInput = Boolean(result?.input);
  const replyText = composeReplyText(messages);

  return {
    sessionId: result?.sessionId ?? null,
    replyText,
    hasReply: replyText.length > 0,
    hasInput,
    // Regra central da seção 15/16 — nunca derivar isto de messages.length.
    shouldKeepSession: hasInput,
  };
}
