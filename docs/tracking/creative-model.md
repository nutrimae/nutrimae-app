# Modelo de criativos V1

## Objetivo

Comparar conceitos e peças sem depender do nome livre digitado no gerenciador de anúncios.

## `marketing_creatives`

Campos propostos:

- `id uuid`
- `product_key text`
- `name text`
- `platform text`
- `status draft|active|paused|archived`
- `parent_creative_id uuid null` para variações
- `concept text`
- `angle text`
- `hook text`
- `format text`
- `persona text`
- `promise_type text null`
- `asset_url text null`
- `landing_variant text null`
- `metadata jsonb`
- timestamps e `created_by`

## Identificação no tráfego

Cada anúncio usa `creative_id=<uuid>`; `utm_content` continua legível para humanos. Nomes nunca são chave primária.

## Gasto

`ad_spend_daily`:

- data, plataforma, conta, campaign/adset/ad IDs, creative_id opcional
- moeda, gasto em centavos, impressões, cliques
- fonte (`manual_csv` na V1), hash do arquivo e timestamp de importação
- chave única por data/plataforma/ad/creative para importação idempotente

## Métricas

- impressões e cliques importados
- visitantes e sessões first-party
- avanço em quiz/VSL/checkout
- pedidos, compras, receita bruta e líquida estimada
- CPA e ROAS quando gasto existe
- cobertura: percentual de compras com criativo identificado

Sem gasto, mostrar conversão e receita atribuída; não fabricar CPA ou ROAS.
