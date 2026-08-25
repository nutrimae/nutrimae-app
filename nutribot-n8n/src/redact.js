/**
 * Redação de dados sensíveis antes de qualquer log estruturado
 * (spec seção 20: "redaction de tokens, e-mails e credenciais";
 * seção 19 bug #10: "credenciais expostas nos logs").
 */

const SECRET_KEY_PATTERN = /token|secret|password|senha|authorization|api[_-]?key/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function maskEmail(email) {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) return email;
  const [user, domain] = email.split("@");
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

export function maskToken(value) {
  if (typeof value !== "string" || value.length === 0) return value;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}...${value.slice(-2)}`;
}

/**
 * Percorre um objeto recursivamente e:
 * - mascara qualquer chave que pareça token/senha/credencial;
 * - mascara qualquer valor de string que pareça e-mail.
 * Não muta o objeto original.
 */
export function redact(value, depth = 0) {
  if (depth > 6 || value == null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (SECRET_KEY_PATTERN.test(key)) {
        out[key] = maskToken(String(val));
      } else if (typeof val === "string" && EMAIL_PATTERN.test(val)) {
        out[key] = maskEmail(val);
      } else {
        out[key] = redact(val, depth + 1);
      }
    }
    return out;
  }

  if (typeof value === "string" && EMAIL_PATTERN.test(value)) {
    return maskEmail(value);
  }

  return value;
}
