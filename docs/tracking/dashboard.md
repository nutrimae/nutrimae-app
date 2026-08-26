# Dashboard administrativo V1

## Estrutura

1. **Resumo financeiro**: receita, compras, ticket, reembolsos, chargebacks, MRR.
2. **Funil**: visitante → quiz → VSL → checkout → pedido → compra.
3. **Aquisição**: source/medium/campaign/adset/ad.
4. **Criativos**: conceito, ângulo, hook, peça e variação.
5. **Produtos/planos**: anual, mensal, bumps e OTOs.
6. **Saúde dos dados**: atraso, cobertura, rejeições, órfãos e última atualização.

## Filtros

- período e timezone
- produto/oferta/plano
- source/medium/campaign
- creative_id/conceito/ângulo/hook
- novo x recorrente

## Estados obrigatórios

- carregando com skeleton
- vazio real (“nenhum evento no período”)
- dado indisponível (“gasto ainda não importado”)
- stale com horário da última atualização
- erro com último snapshot válido, quando existir

## Mudança no painel atual

- Reutilizar rota, autorização, cache e refresh.
- Renomear “Sugestão da IA” para “Alerta de variação”, pois as regras são determinísticas.
- Priorizar layout desktop sem remover responsividade mobile.
- Exibir fórmulas/definições em tooltips.
- Toda métrica deve ter fonte, janela e timestamp.
