/**
 * Construtores de URL do Typebot — impossibilita, por construção, gerar
 * `/sessions//continueChat`. Portado de nutribot-n8n/src/urls.js.
 */

function trimTrailingSlash(url: string): string {
  return String(url ?? "").replace(/\/+$/, "");
}

export function buildStartChatUrl(baseUrl: string, publicId: string | undefined): string {
  const id = String(publicId ?? "").trim();
  if (!id) {
    throw new Error("TYPEBOT_PUBLIC_ID ausente — não é possível montar a URL de startChat.");
  }
  return `${trimTrailingSlash(baseUrl)}/api/v1/typebots/${encodeURIComponent(id)}/startChat`;
}

export function buildContinueChatUrl(baseUrl: string, sessionId: string | null | undefined): string {
  const id = sessionId == null ? "" : String(sessionId).trim();
  if (!id) {
    throw new Error("session_id ausente/vazio — chamada a continueChat bloqueada antes de sair para a rede.");
  }
  return `${trimTrailingSlash(baseUrl)}/api/v1/sessions/${encodeURIComponent(id)}/continueChat`;
}
