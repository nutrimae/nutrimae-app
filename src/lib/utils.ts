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

  // Nem 10/11 dígitos (local) nem 12/13 com "55" — não é um telefone
  // brasileiro reconhecível. Devolver os dígitos crus aqui (como o código
  // fazia antes) guardava lixo tipo "123" como se fosse um número válido,
  // e isso falhava calado só na hora de mandar mensagem de verdade.
  return null;
}

/**
 * Valida CPF de verdade (dígitos verificadores), não só o tamanho. Usado no
 * checkout para avisar na hora se o CPF está errado, em vez de descobrir só
 * depois na resposta da Pagar.me (e perder a venda por confusão).
 */
export function isValidCpf(value: string): boolean {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos os dígitos iguais (000..., 111..., etc.)

  const digits = cpf.split("").map(Number);

  function checkDigit(length: number): number {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += digits[i] * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  }

  return checkDigit(9) === digits[9] && checkDigit(10) === digits[10];
}
