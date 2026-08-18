/**
 * Normaliza um telefone brasileiro para o formato salvo em
 * "profiles.phone_number" (internacional, só dígitos, sem "+" — ex.:
 * "5511999999999"). Usado para casar o número que a cliente usa no WhatsApp
 * com o telefone enviado pela plataforma de pagamento.
 */
export function sanitizePhoneNumber(phone: string | undefined): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  return digits;
}
