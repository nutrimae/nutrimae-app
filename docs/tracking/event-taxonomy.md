# Taxonomia de eventos V1

## Convenção

- Nome: `dominio_acao`, minúsculo, sem versão no nome.
- Versão: coluna `event_version`, iniciando em `1`.
- Identidade: `event_id`, `visitor_id`, `session_id`, `user_id` opcional no servidor.
- Contexto: `occurred_at`, `received_at`, URL, referrer, produto/oferta, atribuição e `properties` validado.
- Nenhum evento aceita PII ou dados do bebê em `properties`.

## Eventos canônicos

| Evento | Emissor | Quando | Propriedades permitidas |
|---|---|---|---|
| `page_viewed` | browser | rota pública carregada | `page_type`, `path` |
| `landing_viewed` | browser | `/oferta` visível | `variant_id` |
| `age_selected` | browser | fase escolhida | `age_key` |
| `quiz_started` | browser | primeira resposta | `quiz_version` |
| `quiz_answered` | browser | resposta válida | `question_key`, `answer_key` |
| `quiz_completed` | browser | última resposta | `quiz_version` |
| `vsl_started` | browser | playback real iniciado | `video_id`, `duration_seconds` |
| `vsl_progressed` | browser | 25/50/75% uma vez | `video_id`, `percent` |
| `vsl_completed` | browser | 90% ou ended | `video_id` |
| `cta_clicked` | browser | CTA acionado | `cta_id`, `destination` |
| `checkout_viewed` | browser | checkout renderizado | `offer_slug` |
| `bump_toggled` | browser | bump marcado/desmarcado | `bump_slug`, `selected` |
| `checkout_submitted` | browser | submissão válida iniciada | `offer_slug`, `payment_method`, `bump_slugs` |
| `order_created` | servidor | pedido local persistido | `order_id`, `offer_id`, `amount_cents`, `currency` |
| `payment_pending` | servidor | pagamento aguardando | `order_id`, `method` |
| `payment_refused` | webhook | falha confirmada | `order_id`, `provider_event_id` |
| `purchase_confirmed` | webhook/outbox | compra confirmada | `order_id`, `amount_cents`, `currency`, `product_keys` |
| `refund_confirmed` | webhook/outbox | reembolso confirmado | `order_id`, `amount_cents` |
| `chargeback_confirmed` | webhook/outbox | chargeback confirmado | `order_id`, `amount_cents` |
| `subscription_activated` | webhook/outbox | assinatura ativa | `subscription_id`, `offer_id` |
| `subscription_canceled` | webhook/outbox | cancelamento confirmado | `subscription_id`, `offer_id` |

## Regras

- `purchase_confirmed`, refund e chargeback são proibidos na rota pública de ingestão.
- `vsl_progressed` aceita apenas 25, 50 ou 75.
- `quiz_answered` guarda chaves controladas, não texto livre.
- Eventos financeiros usam IDs internos e nunca payload bruto do gateway.
- Mudança incompatível cria nova versão e mantém leitor da versão anterior durante migração.
