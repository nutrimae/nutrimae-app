# Credenciais

Nenhuma credencial vive no workflow nem em código-fonte. Duas formas
aceitas, conforme o tipo de credencial:

## 1. n8n Credentials (recomendado para Postgres)

O node Postgres (`Claim Message (dedup)`, `Upsert Session After Reply`,
`Mark Error Notified`, `Sync idade_bebe`) referencia uma credencial do tipo
**Postgres** cadastrada no n8n (Settings → Credentials → Postgres). No JSON
exportado ela aparece como:

```json
"credentials": { "postgres": { "id": "POSTGRES_CREDENTIAL_ID", "name": "Postgres — NutriBot" } }
```

Depois de importar o workflow, abra cada node Postgres e selecione (ou
recrie) a credencial real no seu n8n — o `id` do JSON exportado é só um
placeholder, o n8n sempre pede para religar a credencial num ambiente novo.

## 2. Variáveis de ambiente (Typebot, cooldowns)

Os demais segredos são lidos via `$env.NOME_DA_VARIAVEL` dentro das
expressões dos nodes HTTP Request e Code — isso mapeia para as variáveis de
ambiente do processo n8n (`N8N_*` ou as suas próprias, conforme
`.env.example`):

| Variável | Usada em | Node(s) |
|---|---|---|
| `TYPEBOT_BASE_URL` | URL do Typebot | `Typebot: startChat` / `continueChat` |
| `TYPEBOT_PUBLIC_ID` | URL de `startChat` | `Typebot: startChat` |
| `TYPEBOT_API_TOKEN` | Header `Authorization` (opcional — só se sua instalação do Typebot exigir) | `Typebot: startChat` / `continueChat` |
| `TYPEBOT_TIMEOUT_MS` | Timeout do HTTP Request | `Typebot: startChat` / `continueChat` |
| `SESSION_TTL_HOURS` | Janela de expiração (default 24) | `Decide Route & Build Action` |
| `ERROR_MESSAGE_COOLDOWN_MINUTES` | Cooldown do aviso de erro (default 10) | `Handle Typebot Error` |
| `CARTPANDA_CHECKOUT_URL` | Link de compra — usado **dentro do Typebot**, não no n8n | ver `typebot-flow-changes.md` |

Configure essas variáveis no ambiente do próprio processo n8n (ex.:
`docker-compose.yml` → `environment:`, ou no painel do seu provedor de
n8n gerenciado). Nunca as escreva dentro do JSON do workflow.

## 3. Evolution API — exceção deliberada, e por quê ela é uma exceção

Os 3 nodes `Evolution API: Send *` **não** seguem a regra acima: a URL
(`http://evolution-api:8080/message/sendText/Nutribot`) e o header `apikey`
estão gravados como **valor fixo, direto no JSON do workflow**
(`tools/generate-workflow.mjs`, constantes `EVOLUTION_SEND_TEXT_URL` e
`EVOLUTION_API_KEY_HEADER`), a pedido explícito de quem está operando o
servidor.

Isso é uma exceção real ao princípio "nenhuma credencial no workflow" do
resto deste projeto — qualquer pessoa com acesso ao arquivo
`workflow/nutribot.workflow.json` (ou a um export/backup dele) tem a chave
da Evolution API em texto puro. Aceitável como atalho enquanto o fluxo
ainda está sendo validado; antes de considerar isto "produção", troque para
`$env.EVOLUTION_API_KEY` (mesmo padrão do Typebot acima) e recadastre a
variável no ambiente do n8n — e, se o token atual ficou exposto (ex.:
compartilhado em texto puro em algum lugar), gere um novo na Evolution API
e revogue o antigo.

O nome da instância (`Nutribot`) também está fixo na URL — se você
renomear a instância na Evolution API, precisa regenerar o workflow
(`npm run generate:workflow`) com o nome novo.

## Por que isso importa (spec seção 19, bug #10 / seção 20)

Todo log estruturado (Code nodes de erro, `src/logger.js`) passa por
`redact()`/`maskToken()`/`maskEmail()` antes de qualquer `console.log`.
Isso cobre logs escritos pelo NOSSO código — mas lembre-se de também
desativar/journal-filtrar logs nativos do n8n que podem imprimir corpo de
request/response completo em modo debug (`N8N_LOG_LEVEL`), especialmente em
produção.
