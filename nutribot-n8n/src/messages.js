/**
 * Textos fixos enviados pelo n8n (fora do Typebot). O conteúdo da conversa
 * em si (boas-vindas pós-idade, perguntas, etc.) pertence ao fluxo do
 * Typebot, não a este arquivo — ver docs/typebot-flow-changes.md.
 */

export const MSG_NEED_EMAIL_MEMORY =
  "Mamãe, para eu continuar te ajudando, preciso confirmar seu e-mail de compra. 💛";

export const MSG_INVALID_EMAIL =
  "Ops, mamãe! Esse e-mail parece incompleto. 💛 Confira e envie novamente o mesmo e-mail usado na compra. Exemplo: seumail@gmail.com";

export const MSG_WELCOME_NO_SESSION =
  "Oi, mamãe! 🥰 Seja muito bem-vinda ao NutriBot.\n\n" +
  "Para localizar sua assinatura e liberar seu acesso, digite aqui o mesmo e-mail que você utilizou no momento da compra.\n\n" +
  "Exemplo: seumail@gmail.com";

export const MSG_TEMPORARY_ERROR =
  "Não consegui continuar sua conversa neste momento. Por favor, aguarde alguns instantes e envie sua mensagem novamente.\n\n" +
  'Se precisar reiniciar, digite "reiniciar" para eu continuar te ajudando. 💛';

/**
 * Referência apenas — este texto deve estar configurado como bubble dentro
 * do próprio Typebot (bloco "após a idade"), não é enviado pelo n8n.
 */
export const MSG_AFTER_AGE_CONFIRMED_REFERENCE =
  "Oi, mamãe! 🤗✨\n\n" +
  "Você está fazendo um trabalho incrível. Essa fase pode ser cansativa e é normal se sentir sobrecarregada.\n\n" +
  "Qual é o maior desafio ou dúvida hoje? Posso te ajudar com uma receita rápida, dicas de sono, organização ou apenas sendo seu ombro amigo agora? 🌷";
