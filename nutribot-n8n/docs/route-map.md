# Mapa de rotas

Ordem de prioridade — cada mensagem cai em exatamente UMA destas rotas,
nesta ordem, sem exceção (implementado em [`src/router.js`](../src/router.js)
`decideRoute()` e espelhado no Code node "Decide Route & Build Action" do
workflow):

| # | Rota | Condição | Ação | Chama Typebot? |
|---|------|----------|------|-----------------|
| 0 | `rejected` | `fromMe` true/"true", ou falta `phone`/`text`/`messageId` | nada é enviado | não |
| 0.5 | `duplicate_ignored` | `messageId` igual ao já processado para este telefone | nada é enviado | não |
| 1 | `reset` | texto é comando de reinício (`reiniciar`, `reiniciar bot`, `resetar`, `começar de novo`, `menu`) | se há e-mail salvo: `startChat` com o e-mail salvo. Senão: pede e-mail | condicional |
| 2 | `email_valid` | texto bate com `^[^\s@]+@[^\s@]+\.[^\s@]+$` | `startChat` com o e-mail normalizado | sim |
| 3 | `email_invalid` | texto contém `@` mas não passa na regex | mensagem de erro amigável | não |
| 4 | `continuation` | sessão ativa (session_id não vazio, status active, `updated_at` < 24h), texto sem `@`, não é reset | `continueChat` com o `session_id` existente | sim |
| 5 | `fallback_expired_or_invalid` | existe registro para o telefone mas não qualifica para continuação (session_id vazio/null, status ≠ active, ou `updated_at` ≥ 24h) | se há e-mail salvo: `startChat` com o e-mail salvo (a mãe NÃO precisa reinformar). Senão: pede e-mail | condicional |
| 6 | `initial_no_session` | nenhum registro existe para o telefone | mensagem de boas-vindas pedindo e-mail | não |

**Por que a ordem importa:** como as condições são checadas em sequência com
`if/else if`, a MERA POSIÇÃO na lista garante os invariantes da spec (seção
23) sem precisar de checagens redundantes:

- um texto com `@` nunca alcança `continuation` (rotas 2/3 são checadas antes da 4);
- um comando de reinício nunca alcança `email_valid`/`email_invalid`/`continuation` (rota 1 é a primeira depois de reject/duplicate).

## Deduplicação — por que não é um node IF simples

A primeira versão deste design tentava usar "a query de claim retornou 0
linhas" como sinal de duplicata, checado por um node IF logo após o
Postgres. Isso **não funciona no n8n**: um node que recebe zero itens de
entrada não "cai no ramo false" — ele simplesmente não produz nenhuma saída
em nenhum dos dois ramos, porque não há item para avaliar.

Por isso `CLAIM_MESSAGE_SQL` (ver [`tools/generate-workflow.mjs`](../tools/generate-workflow.mjs))
é uma CTE que **sempre devolve exatamente 1 linha**, com uma coluna
`claimed` (true/false) explícita. O Code node "Decide Route & Build Action"
lê esse campo e decide normalmente — nenhum node do grafo depende de
contar itens.

(A versão usada pelo orchestrator Node.js testável, [`src/sql.js`](../src/sql.js),
não tem essa restrição — `rowCount === 0` funciona perfeitamente num client
`pg` comum — por isso as duas versões de SQL são levemente diferentes na
forma, mas idênticas na garantia: cada `messageId` só é processado uma vez
por telefone.)

## Serialização por telefone

Não existe um "lock" explícito (mutex) por telefone em lugar nenhum do
grafo. A serialização vem de graça do próprio Postgres: `phone` é chave
primária, e duas transações concorrentes tentando `INSERT ... ON CONFLICT
DO UPDATE` na mesma linha são serializadas pelo lock de linha do Postgres —
a segunda espera a primeira commitar antes de aplicar seu próprio `WHERE
last_message_id IS DISTINCT FROM ...`. Isso é testado em
`tests/sessionStore.test.mjs` (mensagens diferentes, mesmo telefone) e
`tests/acceptance.test.mjs` (cenário 27).

## Campos técnicos vs. campos de conversa

- `n8n` só sabe sobre: `phone`, `text`, `messageId`, `fromMe`, `senderName`
  (payload da Z-API) e as colunas de `nutribot_whatsapp_sessions`.
- A **validação de idade (6–24 meses)** é feita inteiramente dentro do
  Typebot (spec seção 17) — por isso as mensagens "6", "24", "5", "25" da
  spec seção 22 caem todas na mesma rota `continuation` no n8n; é o Typebot
  que decide se a idade é válida e o que responder.
- `idade_bebe` só chega ao Postgres via o webhook de sync
  (`nutribot-typebot-sync.workflow.json`) — ver
  [`docs/typebot-flow-changes.md`](./typebot-flow-changes.md).
