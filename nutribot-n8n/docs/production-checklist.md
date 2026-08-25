# Checklist de ativação em produção

Não ative o workflow em produção até marcar TODOS os itens abaixo.

## Banco de dados

- [ ] `migrations/001_create_nutribot_whatsapp_sessions.sql` rodada no Postgres de produção
- [ ] `migrations/002_add_observability_columns.sql` rodada no Postgres de produção
- [ ] `idx_nutribot_sessions_updated_at` existe (`\d nutribot_whatsapp_sessions` no psql)
- [ ] backup automático do Postgres de produção confirmado e testado (restore de verdade, não só "existe backup")

## Credenciais

- [ ] Credencial Postgres do n8n aponta para o banco de PRODUÇÃO (não o de teste)
- [ ] `ZAPI_INSTANCE_ID` / `ZAPI_INSTANCE_TOKEN` / `ZAPI_CLIENT_TOKEN` são os de produção
- [ ] `TYPEBOT_PUBLIC_ID=my-typebot-1slh1qn` confirmado (ou o ID real de produção do Typebot)
- [ ] `CARTPANDA_CHECKOUT_URL` configurada — **nenhum `[SEU LINK DO CARTPANDA]` sobrevive em produção** (ver `docs/typebot-flow-changes.md`)
- [ ] nenhuma credencial aparece em `git log`/histórico deste repositório

## Typebot

- [ ] Typebot ganhou `telefone` como variável prefillable (usada pelo n8n em todo `startChat`)
- [ ] bloco de sync de `idade_bebe` (HTTP request de volta para `nutribot/typebot-sync`) está no fluxo, logo após a idade ser capturada
- [ ] mensagem "após a idade" (spec seção 18) confere com o texto de referência em `src/messages.js`

## Webhooks

- [ ] `WA` / Z-API apontando para a URL de produção do n8n (`N8N_WEBHOOK_URL` + `/webhook/nutribot/whatsapp`)
- [ ] endpoint de sync do Typebot apontando para `.../webhook/nutribot/typebot-sync`
- [ ] workflow **NutriBot — Error Workflow** importado E selecionado como "Error Workflow" nas settings do workflow principal
- [ ] node "Alert (configure Slack/Email aqui)" do Error Workflow trocado pelo canal de alerta real da equipe (ele vem como NoOp de propósito — ver nota no próprio node)

## Testes

- [ ] `npm run verify` passa localmente (95 testes + smoke test do workflow gerado)
- [ ] smoke test manual: enviar "Oi" de um número de teste sem cadastro → recebe a mensagem de boas-vindas
- [ ] smoke test manual: enviar o e-mail de uma assinatura de teste ativa → recebe a saudação do Typebot
- [ ] smoke test manual: enviar "reiniciar" no meio de uma conversa → reinicia sem pedir e-mail de novo
- [ ] smoke test manual: mandar a MESMA mensagem duas vezes rápido (reenviar no WhatsApp) → só uma resposta chega

## Segurança e confiabilidade

- [ ] revisão final de roteamento: reler `docs/route-map.md` e confirmar contra o workflow importado
- [ ] revisão final de persistência: `email_cliente`/`idade_bebe` nunca somem depois de uma sessão expirar ou dar erro
- [ ] revisão final de deduplicação: `messageId` repetido nunca gera segunda resposta
- [ ] revisão final de tratamento de erro: Typebot fora do ar não trava o webhook (sempre responde 200 rápido pra Meta/Z-API)
- [ ] health check configurado (endpoint de vida do próprio n8n, monitorado externamente)
- [ ] alerta configurado para: falhas repetidas do Typebot, HTTP 402/429 (créditos esgotados), Z-API fora do ar

## Ativação

- [ ] workflow principal marcado como **Active** no n8n
- [ ] primeira hora após ativação: acompanhar `docs/route-map.md` + logs ao vivo, não só confiar e sair
