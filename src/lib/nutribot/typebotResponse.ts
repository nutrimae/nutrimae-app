/**
 * Interpreta a resposta do Typebot (startChat/continueChat). Portado de
 * nutribot-n8n/src/typebotResponse.js.
 *
 * - só mensagens type=text contam;
 * - conteúdo vem de content.markdown OU content.richText;
 * - a decisão de manter/encerrar sessão depende SOMENTE da presença de
 *   `input` na resposta — nunca do array `messages` estar vazio.
 */

interface RichTextNode {
  text?: string;
  children?: RichTextNode[];
}

interface TypebotMessage {
  type?: string;
  content?: { markdown?: string; richText?: RichTextNode[] };
}

interface TypebotResult {
  sessionId?: string;
  messages?: TypebotMessage[];
  input?: unknown;
}

function flattenRichTextNode(node: RichTextNode | null | undefined): string {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) {
    return node.children.map(flattenRichTextNode).join("");
  }
  return "";
}

function richTextToString(richText: RichTextNode[] | undefined): string {
  if (!Array.isArray(richText)) return "";
  return richText.map(flattenRichTextNode).filter(Boolean).join("\n");
}

export function extractMessageText(message: TypebotMessage | null | undefined): string {
  if (!message || message.type !== "text") return "";
  const content = message.content ?? {};
  const raw = content.markdown ?? content.richText ?? "";
  if (raw == null) return "";
  const text = typeof raw === "string" ? raw : richTextToString(raw);
  return text.trim();
}

export function composeReplyText(typebotMessages: TypebotMessage[] | undefined): string {
  const list = Array.isArray(typebotMessages) ? typebotMessages : [];
  return list
    .map(extractMessageText)
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .join("\n");
}

export interface InterpretedTypebotResult {
  sessionId: string | null;
  replyText: string;
  hasReply: boolean;
  hasInput: boolean;
  shouldKeepSession: boolean;
}

export function interpretTypebotResult(result: TypebotResult | null | undefined): InterpretedTypebotResult {
  const messages = Array.isArray(result?.messages) ? result!.messages : [];
  const hasInput = Boolean(result?.input);
  const replyText = composeReplyText(messages);

  return {
    sessionId: result?.sessionId ?? null,
    replyText,
    hasReply: replyText.length > 0,
    hasInput,
    shouldKeepSession: hasInput,
  };
}
