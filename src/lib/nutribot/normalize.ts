const RESET_COMMANDS = new Set(["reiniciar", "reiniciar bot", "resetar", "comecar de novo", "menu"]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export interface NormalizedEvent {
  phone: string;
  text: string;
  textLower: string;
  messageId: string;
  senderName: string;
  fromMe: boolean;
  containsAt: boolean;
  isValidEmail: boolean;
  isInvalidEmail: boolean;
  isReset: boolean;
  normalizedEmail: string | null;
}

function buildNormalizedEvent({
  rawPhone,
  rawText,
  rawMessageId,
  rawSenderName,
  rawFromMe,
}: {
  rawPhone: string;
  rawText: string;
  rawMessageId: string;
  rawSenderName: string;
  rawFromMe: boolean | string | undefined;
}): NormalizedEvent {
  const phone = String(rawPhone ?? "").trim();
  const text = String(rawText ?? "").trim();
  const textLower = text.toLowerCase();
  const textLowerNoAccents = stripAccents(textLower);
  const messageId = String(rawMessageId ?? "").trim();
  const senderName = String(rawSenderName ?? "").trim();

  const fromMe = rawFromMe === true || rawFromMe === "true";

  const containsAt = text.includes("@");
  const isValidEmail = EMAIL_REGEX.test(text);
  const isInvalidEmail = containsAt && !isValidEmail;
  const isReset = RESET_COMMANDS.has(textLowerNoAccents);

  const normalizedEmail = isValidEmail ? text.toLowerCase() : null;

  return {
    phone,
    text,
    textLower,
    messageId,
    senderName,
    fromMe,
    containsAt,
    isValidEmail,
    isInvalidEmail,
    isReset,
    normalizedEmail,
  };
}

/**
 * Formato da WhatsApp Cloud API (Meta).
 * Telefone em `entry[0].changes[0].value.messages[0].from` (já vem sem "+"
 * e sem sufixo, ex: "5511999998888"), texto em `.text.body`, id da
 * mensagem em `.id`, nome de quem mandou em `value.contacts[0].profile.name`.
 * `fromMe` não existe nesse formato — mensagens enviadas pelo próprio
 * número do bot nunca chegam como webhook de "messages" (só como
 * confirmação em `statuses`), então sempre é `false` aqui.
 *
 * Webhooks de status (entrega/leitura) e outros campos que não sejam
 * "messages" voltam como `null` — quem chama deve ignorar nesse caso.
 */
export function normalizeMetaEvent(raw: unknown): NormalizedEvent | null {
  const body = raw as {
    entry?: Array<{
      changes?: Array<{
        field?: string;
        value?: {
          contacts?: Array<{ profile?: { name?: string } }>;
          messages?: Array<{
            from?: string;
            id?: string;
            type?: string;
            text?: { body?: string };
          }>;
        };
      }>;
    }>;
  };

  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];
  if (!message) return null; // status update (entregue/lido) ou payload sem mensagem — nada a rotear

  const rawPhone = message.from ?? "";
  const rawText = message.type === "text" ? (message.text?.body ?? "") : "";
  const rawMessageId = message.id ?? "";
  const rawSenderName = value?.contacts?.[0]?.profile?.name ?? "";

  return buildNormalizedEvent({ rawPhone, rawText, rawMessageId, rawSenderName, rawFromMe: false });
}

export { RESET_COMMANDS, EMAIL_REGEX };
