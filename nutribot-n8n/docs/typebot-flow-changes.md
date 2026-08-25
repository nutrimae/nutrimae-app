# Mudanças necessárias no fluxo do Typebot

O n8n **não** mexe no Google Sheets nem na lógica de conversa — isso
continua 100% dentro do Typebot (spec seção 2 e 17). Só duas mudanças são
necessárias no builder do Typebot para a integração com o n8n funcionar
por completo:

## 1. Link do CartPanda: parar de usar placeholder

O bloco "assinatura não encontrada" hoje tem `[SEU LINK DO CARTPANDA]`
escrito literalmente. Troque por uma variável do próprio Typebot (Settings
→ Variables → crie `checkout_url`, ou equivalente) e configure o valor real
lá — nunca deixe o placeholder em produção (spec seção 17 e critério de
aceite da seção 23).

Se preferir manter isso centralizado com o resto da configuração deste
pacote, o valor de referência vive em `.env.example` como
`CARTPANDA_CHECKOUT_URL` — copie o mesmo valor para a variável do Typebot.

## 2. Sincronizar `idade_bebe` de volta para o n8n

O Postgres (`nutribot_whatsapp_sessions.idade_bebe`) só existe para o n8n
saber, num reinício ou numa sessão expirada, que já pode pular a pergunta
da idade (`prefilledVariables.idade_bebe` no `startChat`). Mas quem CAPTURA
a idade é o Typebot — o n8n nunca vê essa variável a menos que o Typebot
avise.

**Ação**: logo depois do bloco que valida/captura `idade_bebe` (spec seção
17, item 9 — "idade permitida: somente 6 a 24"), adicione um bloco
**HTTP Request** dentro do próprio Typebot chamando:

```
POST {N8N_WEBHOOK_URL}/webhook/nutribot/typebot-sync
Content-Type: application/json

{
  "telefone": "{{telefone}}",
  "idade_bebe": "{{idade_bebe}}"
}
```

- `telefone` precisa ser uma variável prefillable do Typebot — o n8n já
  manda isso em TODO `startChat` (`prefilledVariables.telefone`, ver
  `src/orchestrator.js` / Code node "Decide Route & Build Action").
- Esse workflow (`workflow/nutribot-typebot-sync.workflow.json`) só grava
  `idade_bebe` — nunca toca `session_id`/`status`, então não interfere em
  nada do que o resto do sistema está fazendo.
- Se o `HTTP Request` do Typebot falhar (n8n fora do ar, por exemplo), o
  pior caso é a mãe ter que reinformar a idade numa próxima sessão — não é
  um erro fatal, é uma degradação aceitável, então não é necessário
  bloquear a conversa esperando essa chamada responder.

## 3. Mensagem "após a idade confirmada"

O texto de boas-vindas pós-idade (spec seção 18) deve estar configurado
como bubble de texto dentro do próprio Typebot, não em nenhum lugar do
n8n. Referência exata do texto em
[`src/messages.js`](../src/messages.js) → `MSG_AFTER_AGE_CONFIRMED_REFERENCE`.
