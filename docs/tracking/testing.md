# Estratégia de testes V1

## Contrato

- allowlist de eventos e propriedades
- rejeição de PII e payload grande
- versões suportadas
- eventos financeiros proibidos no endpoint público

## Identidade e atribuição

- visitor persistente após consentimento
- sessão renova após 30 minutos
- nova campanha abre atribuição
- acesso direto não sobrescreve last non-direct
- first touch permanece imutável
- acento, encoding e parâmetros malformados não quebram página

## Checkout e pagamento

- checkout recebe contexto válido sem confiar no preço ou atribuição do browser
- tracking indisponível não impede pedido
- webhook duplicado não duplica acesso, crédito, compra ou receita
- pagamento pendente não gera compra
- reembolso e chargeback revertem métricas
- assinatura recorrente mantém atribuição inicial

## Funil

- quiz inicia/completa uma vez por sessão
- VSL 25/50/75 dispara uma vez cada
- navegação rápida não perde CTA/checkout via keepalive

## Dashboard

- fórmulas com fixtures conhecidas
- zero diferente de null/indisponível
- filtros não alteram total fora do escopo
- timezone São Paulo em bordas de dia
- stale cache e falha de refresh visíveis

## E2E mínimo

1. URL com UTM/creative_id.
2. Responder quiz e assistir VSL até 50%.
3. Abrir checkout e criar Pix.
4. Simular webhook pago duas vezes.
5. Confirmar uma compra, uma receita e uma atribuição.
6. Confirmar dados no painel.

Também executar a suíte atual para impedir regressões no acesso, S.O.S., checkout, assinaturas, reembolso e Livro Ilustrado.
