/**
 * Redação de dados sensíveis antes de qualquer log estruturado — nenhuma
 * chamada externa deveria logar token/e-mail em claro. Portado de
 * nutribot-n8n/src/redact.js sem mudança de lógica.
 */

const SECRET_KEY_PATTERN = /token|secret|password|senha|authorization|api[_-]?key/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function maskEmail(email: unknown): unknown {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) return email;
  const [user, domain] = email.split("@");
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

export function maskToken(value: unknown): unknown {
  if (typeof value !== "string" || value.length === 0) return value;
  if (value.length <= 6) return "***";
  return `${value.slice(0, 3)}...${value.slice(-2)}`;
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value == null) return value;

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
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
