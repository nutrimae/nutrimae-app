# NutriBot — n8n + Z-API + Typebot + PostgreSQL

Reconstrução do orquestrador do NutriBot em n8n, substituindo o Make. O
bot é **100% reativo**: nunca inicia conversas, nunca dispara campanhas —
só responde a mensagens recebidas via webhook da Z-API.

Este pacote é autocontido (`nutribot-n8n/`) e não depende do resto do
repositório NutriMãe (app Next.js). É um sistema separado.

## O que tem aqui

```
nutribot-n8n/
  src/               lógica de negócio testável (normalização, roteamento,
                      sessão, clientes HTTP) — fonte da verdade
  tests/             95 testes automatizados (node --test), fixtures/, fakes/
  fixtures/           payloads dos 30 cenários obrigatórios da spec
  tools/              gerador do workflow n8n + smoke test do código embutido
  workflow/           JSON exportável/importável do n8n (gerado por tools/)
  migrations/          SQL do Postgres (up + down)
  docs/               mapa de rotas, credenciais, rollback, checklist, Typebot
  .env.example
```

## Por que existe `src/` além do `workflow/`

Code nodes do n8n não importam arquivos locais — cada um precisa ser um
script autocontido. Para não duplicar lógica de negócio sem controle,
`src/` é a única fonte testada (95 testes cobrindo os 30 cenários da spec +
os módulos individuais); `workflow/nutribot.workflow.json` é **gerado** por
`tools/generate-workflow.mjs`, que embute nos Code nodes a MESMA lógica
reescrita como script autocontido. `tools/smoke-test-workflow-code.mjs`
executa de fato esses scripts embutidos (com `$input`/`$env`/`$()`
mockados) e compara o resultado com `src/normalize.js` e `src/router.js` —
não substitui testar dentro do n8n de verdade, mas pega a maioria dos erros
de lógica/sintaxe antes de importar.

Qualquer mudança de regra de negócio precisa ser feita em `src/` (e coberta
por um teste) e depois propagada para dentro de
`tools/generate-workflow.mjs` — os comentários em cada Code node gerado
apontam de volta para o arquivo `src/*.js` correspondente.

## Instalação

### 1. Banco de dados

```bash
psql "$POSTGRES_URL" -f migrations/001_create_nutribot_whatsapp_sessions.sql
psql "$POSTGRES_URL" -f migrations/002_add_observability_columns.sql
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
# preencha .env com os valores reais (nunca commite este arquivo)
```

Configure as mesmas variáveis no ambiente do processo n8n (Docker/PaaS —
ver `docs/credentials.md`).

### 3. Gerar e importar o workflow

```bash
npm install    # sem dependências externas hoje, mas deixa o projeto pronto para crescer
npm run verify # gera o workflow, roda o smoke test nele, roda os 95 testes
```

No n8n: **Import from File** →
- `workflow/nutribot.workflow.json` (principal)
- `workflow/nutribot-error.workflow.json` (error workflow — depois, no
  workflow principal, Settings → Error Workflow → selecione este)
- `workflow/nutribot-typebot-sync.workflow.json` (sync de `idade_bebe`)

Depois de importar, abra cada node **Postgres** e religue a credencial (o
`id` do JSON é só um placeholder — ver `docs/credentials.md`).

### 4. Ajustar o Typebot

Duas mudanças pequenas e obrigatórias — ver
[`docs/typebot-flow-changes.md`](docs/typebot-flow-changes.md) (link do
CartPanda sem placeholder + chamada de sync de `idade_bebe`).

### 5. Configurar os webhooks externos

- Z-API → `{N8N_WEBHOOK_URL}/webhook/nutribot/whatsapp`
- Typebot (bloco HTTP de sync) → `{N8N_WEBHOOK_URL}/webhook/nutribot/typebot-sync`

## Testes

```bash
npm test              # 95 testes (src/, incluindo os 30 cenários obrigatórios)
npm run smoke:workflow  # executa de fato os Code nodes gerados, compara com src/
npm run verify         # os dois acima + regenera o workflow
```

Todos os 30 cenários da spec (seção 22) têm teste correspondente — ver
`tests/acceptance.test.mjs` (cada `test()` está comentado com o número do
cenário) e `fixtures/events.js`.

## Mapa de rotas, credenciais, rollback, checklist

- [`docs/route-map.md`](docs/route-map.md) — as 7 rotas, por que a ordem
  garante os invariantes da spec, e por que a deduplicação usa uma CTE em
  vez de um IF simples
- [`docs/credentials.md`](docs/credentials.md) — o que é n8n Credential vs.
  variável de ambiente, e onde cada uma é usada
- [`docs/rollback.md`](docs/rollback.md) — como reverter workflow e/ou banco
- [`docs/production-checklist.md`](docs/production-checklist.md) — checklist
  antes de ativar em produção
- [`docs/typebot-flow-changes.md`](docs/typebot-flow-changes.md) — as duas
  mudanças necessárias dentro do Typebot

## Desvios deliberados em relação aos exemplos literais da spec

A spec pediu explicitamente para não reaproveitar cegamente os módulos do
Make. Dois pontos onde o código diverge do exemplo literal dado, por
correção:

1. **Upsert de sessão** (spec seção 7): o exemplo dado sempre grava
   `status = 'active', ended_at = NULL`, o que contradiz a própria seção 16
   ("se Typebot não retornar input, marcar status como ended/expired").
   `UPSERT_SESSION_AFTER_REPLY_SQL` deixa status/ended_at a cargo de quem
   chama, e usa `COALESCE(NULLIF(x,''), ...)` em vez de só `COALESCE(x,
   ...)`, porque a spec pede explicitamente "não sobrescrever com vazio,
   null ou string inexistente" — o exemplo original só protegia contra
   `NULL`, não contra string vazia.
2. **Deduplicação** (spec seção 6): em vez de um `SELECT ... FOR UPDATE`
   separado (que dependeria de reaproveitar a mesma conexão/transação
   entre nodes do n8n — não garantido pela UI padrão), usamos um único
   `INSERT ... ON CONFLICT ... WHERE ...` atômico que já serializa
   concorrência por telefone e resolve dedup numa side de rede só. Ver
   `docs/route-map.md`.

## Troubleshooting

| Sintoma | Causa provável | Onde olhar |
|---|---|---|
| Mãe recebe pedido de e-mail de novo mesmo já tendo cadastrado | `email_cliente` não foi persistido, ou `NULLIF` não está aplicado no upsert | `src/sql.js` / `Upsert Session After Reply` |
| `continueChat` falhando com 404/erro genérico | `session_id` desatualizado ou trocado pelo Typebot | confira se `Interpret Typebot Reply` está gravando `sessionId` da resposta mais recente |
| Duas respostas para a mesma mensagem | dedup não está funcionando — confira se `Claim Message (dedup)` está rodando ANTES de qualquer chamada a Typebot/Z-API | `docs/route-map.md` |
| Idade nunca é reaproveitada num reinício | bloco de sync não está configurado no Typebot | `docs/typebot-flow-changes.md` |
| Mensagem de erro "não consegui continuar" chegando toda hora | Typebot sem créditos/fora do ar — cooldown deveria segurar reenvios | confira `ERROR_MESSAGE_COOLDOWN_MINUTES` e a coluna `last_error_notified_at` |
| Workflow importado mas nodes IF/Switch aparecem com erro de parâmetro | versão do n8n instalada é mais nova/antiga que a usada para gerar o JSON — abra o node uma vez na UI, o n8n geralmente auto-migra o formato | — |
