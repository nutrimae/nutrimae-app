# Atribuição V1

## Campos capturados

- UTM: source, medium, campaign, content, term, id.
- IDs: `fbclid`, `gclid`, `ttclid` quando presentes.
- IDs internos: `creative_id`, `ad_id`, `adset_id`, `campaign_id`.
- Referrer, landing path e timestamp.
- Valor raw sanitizado e versão normalizada.

## Regras

### First touch

Primeira aquisição não direta conhecida do visitante. É imutável durante a retenção, salvo correção administrativa auditada.

### Last non-direct

Atualiza quando uma nova sessão começa com campanha/referrer não direto. Acesso direto não sobrescreve uma origem conhecida.

### Compra

No checkout, o servidor resolve `session_id` e copia `first_attribution_id` e `last_attribution_id` para pedido/assinatura. O cliente não escolhe a atribuição financeira.

## Normalização

- Valores em minúsculas, espaços aparados, tamanho limitado.
- Mapeamento explícito de source/medium; valor desconhecido fica preservado, não “adivinhado”.
- `utm_content` pode localizar criativo por alias, mas o ID estável recomendado é `creative_id`.
- Tráfego sem origem identificável = `direct`, nunca `organic` por suposição.

## Limitações honestas

- V1 é first-party e majoritariamente click-through.
- Sem identidade autenticada anterior, não une dispositivos.
- Bloqueadores e ausência de consentimento reduzem cobertura.
- View-through do Meta não será misturado ao last-touch interno sem fonte verificável.
- O painel deve mostrar “cobertura de atribuição” junto das métricas.
