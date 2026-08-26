# Eventos financeiros e fonte de verdade

## Hierarquia

1. Pagar.me confirma o estado financeiro.
2. Webhook idempotente atualiza `orders`, `payments`, `subscriptions` e acesso.
3. Outbox gera evento analítico financeiro idempotente.
4. Views e cache alimentam o painel.

Browser e Pixel nunca são fonte de receita.

## Mudanças aditivas propostas

- `orders`: `visitor_id`, `session_id`, `first_attribution_id`, `last_attribution_id`, `currency`.
- `subscriptions`: mesmos vínculos de atribuição da aquisição inicial.
- `analytics_outbox`: `id`, `event_key unique`, `event_name`, `aggregate_id`, `payload`, `status`, `attempts`, `available_at`, timestamps.

Exemplo de `event_key`: `purchase_confirmed:<order_id>`.

## Receita

- Bruta: valor confirmado do pedido.
- Reembolsada/chargeback: eventos confirmados do gateway.
- Líquida estimada: bruta - reembolsos - chargebacks - taxas importadas/conhecidas.
- Se taxa do gateway/imposto não estiver disponível, rotular como “líquida parcial”, não “líquida”.

## Reconciliação

Job diário e acionável manualmente verifica:

- pedido pago sem `purchase_confirmed`
- evento de compra sem pedido pago
- soma de compras diferente da soma de pedidos pagos
- reembolso sem evento reverso
- webhook com status `error`
- pedido sem atribuição apesar de sessão presente

Diferenças geram alerta; não são corrigidas silenciosamente sem trilha de auditoria.
