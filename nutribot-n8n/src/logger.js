import { redact } from "./redact.js";

/**
 * Logger estruturado (JSON por linha, stdout). Sempre passa pelo redact()
 * antes de serializar — nenhuma chamada externa deveria logar token/e-mail
 * em claro. Usado tanto pelos módulos testáveis quanto (em espírito) pelos
 * Code nodes do workflow n8n.
 */
export function logEvent(level, event, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...redact(fields),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
  return entry;
}

export const logInfo = (event, fields) => logEvent("info", event, fields);
export const logError = (event, fields) => logEvent("error", event, fields);
export const logWarn = (event, fields) => logEvent("warn", event, fields);
