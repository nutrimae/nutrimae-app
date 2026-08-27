# Operação do tracking V1

## Rotina diária

- verificar última atualização do painel
- verificar webhooks em `error`
- verificar compras sem evento e eventos sem compra
- verificar cobertura de atribuição
- importar gasto de mídia por CSV enquanto não houver integração direta

## Alertas

- ingestão rejeitada acima do limite
- atraso da fila/outbox
- divergência financeira
- queda súbita de cobertura
- eventos órfãos
- cache vencido

## Runbook de incidente

1. Não interromper checkout nem webhook financeiro.
2. Desativar apenas o emissor/ingestão por feature flag.
3. Preservar pedidos e logs.
4. Reconciliar a partir de orders/payments/webhooks.
5. Reprocessar outbox idempotentemente.
6. Documentar janela afetada e cobertura perdida.

## Rollback

- Tracking client e painel ficam sob flags independentes.
- Colunas/tabelas aditivas permanecem durante rollback; não executar drop emergencial.
- Voltar UI não apaga eventos.
- Compra e acesso continuam operando sem analytics.

## Retenção sugerida para decisão

- eventos brutos: 13 meses, sujeito à validação LGPD
- sessões/atribuições: 13 meses
- agregados financeiros: conforme obrigação contábil
- payload bruto de webhook: menor período operacional possível
- logs de erro: 90 dias

Prazos finais dependem de validação jurídica e necessidade operacional.

## Responsabilidades

- Produto: taxonomia, definições e mudanças de funil.
- Engenharia: contratos, confiabilidade, segurança e reconciliação.
- Marketing: IDs de criativo e importação de gasto.
- Financeiro: taxas, reembolsos e conferência com Pagar.me.
- Privacidade: consentimento, retenção, opt-out e exclusão.
