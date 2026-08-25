/**
 * Construtores de URL do Typebot. Existem só para tornar IMPOSSÍVEL, por
 * construção, gerar `/sessions//continueChat` (erro #2 e #8 da lista de
 * bugs do Make, spec seção 19) — em vez de confiar em validação solta em
 * algum lugar do fluxo, a própria função lança erro se faltar o id.
 */

function trimTrailingSlash(url) {
  return String(url ?? "").replace(/\/+$/, "");
}

export function buildStartChatUrl(baseUrl, publicId) {
  const id = String(publicId ?? "").trim();
  if (!id) {
    throw new Error("TYPEBOT_PUBLIC_ID ausente — não é possível montar a URL de startChat.");
  }
  return `${trimTrailingSlash(baseUrl)}/api/v1/typebots/${encodeURIComponent(id)}/startChat`;
}

export function buildContinueChatUrl(baseUrl, sessionId) {
  const id = sessionId == null ? "" : String(sessionId).trim();
  if (!id) {
    throw new Error(
      "session_id ausente/vazio — chamada a continueChat bloqueada antes de sair para a rede.",
    );
  }
  return `${trimTrailingSlash(baseUrl)}/api/v1/sessions/${encodeURIComponent(id)}/continueChat`;
}
