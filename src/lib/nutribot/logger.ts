import { redact } from "./redact";

/**
 * Logger estruturado (JSON por linha, stdout). Sempre passa pelo redact()
 * antes de serializar. Portado de nutribot-n8n/src/logger.js.
 */
export function logEvent(level: "info" | "warn" | "error", event: string, fields: Record<string, unknown> = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(redact(fields) as Record<string, unknown>),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
  return entry;
}

export const logInfo = (event: string, fields?: Record<string, unknown>) => logEvent("info", event, fields);
export const logError = (event: string, fields?: Record<string, unknown>) => logEvent("error", event, fields);
export const logWarn = (event: string, fields?: Record<string, unknown>) => logEvent("warn", event, fields);
