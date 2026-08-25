import { buildContinueChatUrl, buildStartChatUrl } from "../src/urls.js";
import { HttpStatusError, HttpTimeoutError } from "../src/httpRetry.js";

/**
 * Duplos de teste para typebotClient/zapiClient com a MESMA superfície
 * (`startChat`/`continueChat`/`sendText`), mas sem rede. Usados só em
 * tests/acceptance.test.mjs para exercitar o orchestrator de ponta a ponta.
 */
export function createFakeTypebotClient({ nextResponse, throwError } = {}) {
  const calls = { startChat: [], continueChat: [] };

  return {
    calls,
    async startChat(args) {
      calls.startChat.push(args);
      buildStartChatUrl("https://typebot.io", "my-typebot-1slh1qn");
      if (throwError) throw throwError;
      return nextResponse;
    },
    async continueChat(args) {
      calls.continueChat.push(args);
      buildContinueChatUrl("https://typebot.io", args.sessionId); // valida/lança se vazio
      if (throwError) throw throwError;
      return nextResponse;
    },
  };
}

export function createFakeZapiClient({ throwError } = {}) {
  const sent = [];
  return {
    sent,
    async sendText({ to, message }) {
      if (throwError) throw throwError;
      sent.push({ to, message });
      return { zaapId: "fake" };
    },
  };
}

export { HttpStatusError, HttpTimeoutError };
