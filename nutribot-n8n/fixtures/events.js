/**
 * Fixtures para os 30 cenários obrigatórios da spec (seção 22). Usadas por
 * tests/acceptance.test.mjs e pelos testes unitários de cada módulo.
 *
 * `whatsappEvents`: payloads crus, no formato real da Z-API (seção 3).
 * `typebotResponses`: respostas simuladas do Typebot (startChat/continueChat).
 */

const PHONE = "553182686499";

function zapiEvent(overrides = {}) {
  return {
    phone: PHONE,
    fromMe: false,
    text: { message: "Oi" },
    messageId: "3EB06008D33CBB1626441B",
    senderName: "Victor",
    ...overrides,
  };
}

export const whatsappEvents = {
  // 1. "Oi" sem sessão
  oiSemSessao: zapiEvent({ text: { message: "Oi" }, messageId: "MSG-001" }),

  // 2. e-mail válido de assinatura ativa (a existência real é papel do Typebot)
  emailValidoAssinaturaAtiva: zapiEvent({ text: { message: "maria@gmail.com" }, messageId: "MSG-002" }),

  // 3. e-mail inexistente — mesmo formato válido; quem decide "não encontrada" é o Typebot/Sheets
  emailInexistente: zapiEvent({ text: { message: "naoexiste@gmail.com" }, messageId: "MSG-003" }),

  // 4. e-mail inválido "teste@"
  emailInvalidoTesteArroba: zapiEvent({ text: { message: "teste@" }, messageId: "MSG-004" }),

  // 5. fromMe boolean true
  fromMeBooleanTrue: zapiEvent({ fromMe: true, text: { message: "Oi" }, messageId: "MSG-005" }),

  // 6. fromMe string "true"
  fromMeStringTrue: zapiEvent({ fromMe: "true", text: { message: "Oi" }, messageId: "MSG-006" }),

  // 7. messageId duplicado — mesmo messageId chega duas vezes
  messageIdDuplicadoPrimeiraVez: zapiEvent({ text: { message: "Oi" }, messageId: "MSG-007-DUP" }),
  messageIdDuplicadoSegundaVez: zapiEvent({ text: { message: "Oi" }, messageId: "MSG-007-DUP" }),

  // 8/9. sessão ativa respondendo a pergunta de idade do Typebot
  sessaoAtivaMensagem6: zapiEvent({ text: { message: "6" }, messageId: "MSG-008" }),
  sessaoAtivaMensagem24: zapiEvent({ text: { message: "24" }, messageId: "MSG-009" }),

  // 10/11. idade fora do intervalo — a VALIDAÇÃO é do Typebot; no n8n é só continuation
  idade5: zapiEvent({ text: { message: "5" }, messageId: "MSG-010" }),
  idade25: zapiEvent({ text: { message: "25" }, messageId: "MSG-011" }),

  // 12. texto contendo @ durante uma sessão ativa — deve interceptar ANTES de continuation
  textoComArrobaDuranteSessao: zapiEvent({ text: { message: "outromail@gmail.com" }, messageId: "MSG-012" }),

  // 16-20. comandos de reinício
  comandoReiniciar: zapiEvent({ text: { message: "reiniciar" }, messageId: "MSG-016" }),
  comandoReiniciarBot: zapiEvent({ text: { message: "Reiniciar Bot" }, messageId: "MSG-017" }),
  comandoResetar: zapiEvent({ text: { message: "RESETAR" }, messageId: "MSG-018" }),
  comandoComecarDeNovo: zapiEvent({ text: { message: "Começar de novo" }, messageId: "MSG-019" }),
  comandoMenu: zapiEvent({ text: { message: "menu" }, messageId: "MSG-020" }),

  // 27. duas mensagens simultâneas para o mesmo telefone (messageIds diferentes)
  concorrenteA: zapiEvent({ text: { message: "Oi" }, messageId: "MSG-027-A" }),
  concorrenteB: zapiEvent({ text: { message: "Tudo bem?" }, messageId: "MSG-027-B" }),

  // 28. ausência de telefone
  ausenciaDeTelefone: { fromMe: false, text: { message: "Oi" }, messageId: "MSG-028" },

  // 29. ausência de texto
  ausenciaDeTexto: { phone: PHONE, fromMe: false, messageId: "MSG-029" },
};

/** Linhas de sessão pré-existentes usadas nos testes (spec seção 13/14). */
export const sessionFixtures = {
  // 13. session_id vazio
  sessionIdVazio: {
    phone: PHONE,
    session_id: "",
    updated_at: new Date(),
    last_message_id: "MSG-OLD",
    email_cliente: "maria@gmail.com",
    idade_bebe: "10",
    status: "active",
    ended_at: null,
  },

  // 14. session_id null
  sessionIdNull: {
    phone: PHONE,
    session_id: null,
    updated_at: new Date(),
    last_message_id: "MSG-OLD",
    email_cliente: "maria@gmail.com",
    idade_bebe: "10",
    status: "active",
    ended_at: null,
  },

  // 15. sessão expirada (updated_at > 24h atrás)
  sessaoExpirada: {
    phone: PHONE,
    session_id: "session-antiga-123",
    updated_at: new Date(Date.now() - 25 * 60 * 60 * 1000),
    last_message_id: "MSG-OLD",
    email_cliente: "maria@gmail.com",
    idade_bebe: "10",
    status: "active",
    ended_at: null,
  },

  // sessão ativa "normal", usada nos cenários 8/9/10/11/12
  sessaoAtiva: {
    phone: PHONE,
    session_id: "session-ativa-456",
    updated_at: new Date(),
    last_message_id: "MSG-PREVIA",
    email_cliente: "maria@gmail.com",
    idade_bebe: null,
    status: "active",
    ended_at: null,
  },
};

export const typebotResponses = {
  // 21. messages: [] com input presente — não deve encerrar nem apagar sessão
  messagesVazioComInput: {
    sessionId: "session-novo-1",
    messages: [],
    input: { type: "text input" },
  },

  // 22. Typebot com input presente
  comInput: {
    sessionId: "session-novo-2",
    messages: [{ type: "text", content: { markdown: "Qual é a idade do bebê? 👶" } }],
    input: { type: "text input" },
  },

  // 23. Typebot sem input -> conversa encerrada
  semInput: {
    sessionId: "session-novo-3",
    messages: [{ type: "text", content: { markdown: "Até logo, mamãe! 💛" } }],
  },

  // 30. resposta composta por várias mensagens markdown
  respostaComposta: {
    sessionId: "session-novo-4",
    messages: [
      { type: "text", content: { markdown: "Oi, mamãe! 🤗" } },
      { type: "text", content: { markdown: "" } },
      { type: "text", content: { markdown: "Como posso te ajudar hoje?" } },
      { type: "text", content: { richText: [{ children: [{ text: "Estou aqui 🌷" }] }] } },
    ],
    input: { type: "text input" },
  },
};

/**
 * Payload REAL da Evolution API (evento messages.upsert), já embrulhado
 * como o node Webhook do n8n entrega (`{ headers, params, query, body }`).
 * Usado para provar que normalizeEvent lida com o formato de verdade, não
 * só com o formato "achatado" usado nas fixtures acima (que já existiam
 * antes de trocar de Z-API para Evolution API).
 */
export const evolutionWebhookEvents = {
  textoSimples: {
    headers: { "content-type": "application/json" },
    params: {},
    query: {},
    body: {
      event: "messages.upsert",
      instance: "Nutribot",
      data: {
        key: {
          remoteJid: `${PHONE}@s.whatsapp.net`,
          fromMe: false,
          id: "3EB06008D33CBB1626441B",
        },
        pushName: "Victor",
        message: { conversation: "Oi" },
        messageType: "conversation",
      },
    },
  },
  textoEstendido: {
    headers: {},
    params: {},
    query: {},
    body: {
      event: "messages.upsert",
      instance: "Nutribot",
      data: {
        key: { remoteJid: `${PHONE}@s.whatsapp.net`, fromMe: false, id: "MSG-EXT-1" },
        pushName: "Victor",
        message: { extendedTextMessage: { text: "maria@gmail.com" } },
        messageType: "extendedTextMessage",
      },
    },
  },
  fromMeTrue: {
    headers: {},
    params: {},
    query: {},
    body: {
      event: "messages.upsert",
      instance: "Nutribot",
      data: {
        key: { remoteJid: `${PHONE}@s.whatsapp.net`, fromMe: true, id: "MSG-FROMME-1" },
        pushName: "NutriBot",
        message: { conversation: "Oi, mamãe!" },
        messageType: "conversation",
      },
    },
  },
};

export default { whatsappEvents, sessionFixtures, typebotResponses, evolutionWebhookEvents };
