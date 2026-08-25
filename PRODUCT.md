# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mães (majoritariamente de primeira viagem) de bebês entre 6 e 24 meses, no Brasil, em fase de introdução alimentar (incluindo abordagem tipo BLW). Usam o app em contexto de cozinha/refeição, muitas vezes com uma mão só, cansadas, e frequentemente ansiosas sobre segurança alimentar (risco de engasgo, alergia).

## Product Purpose

Guiar a introdução alimentar do bebê com sugestões diárias de cardápio personalizadas pela idade, alergias e histórico real de alimentos já experimentados, mais um conjunto de ferramentas de apoio (Diário do Bebê, Lista de Compras, SOS Desmame Noturno, Livro Ilustrado, calculadora de fraldas, rotina de sono). Sucesso é a mãe sentir segurança e clareza sobre o que oferecer a cada fase, sem precisar caçar informação espalhada.

## Positioning

Conteúdo de segurança alimentar revisado por humano (nunca gerado livremente por IA — ver processo de revisão em `content_reviews`/`revisao: pendente|aprovado`) combinado com personalização baseada no histórico real do Diário do bebê (alimentos já testados, reações, alergias), não recomendações genéricas por idade. Um concorrente sem esse par (revisão humana + dado real do bebê) não pode reivindicar a mesma coisa de verdade.

## Operating Context

Uso mobile-first, frequentemente na cozinha ou na hora da refeição, com uma mão ocupada segurando o bebê. Sessões curtas e frequentes. PWA — precisa parecer app instalado, não site.

## Capabilities and Constraints

- Assinatura paga (Plano Anual, pagamento único via Pagar.me) libera o núcleo do app; alguns módulos são add-ons pagos à parte (VIP: SOS Desmame Noturno, Protocolo Intestino Livre).
- Navegação inferior fixa existente: Início, Cardápio, Lista, Mais, VIP — não pode ser renomeada, removida ou ter itens trocados de posição.
- Nenhuma informação de segurança alimentar (corte de risco de engasgo, tempo de alimento fora da geladeira, alergia) pode ser inventada na interface — todo texto desse tipo já existente passou por um pipeline de revisão humana; novo texto do mesmo tipo precisa seguir o mesmo pipeline, não ser escrito livremente durante o redesign.
- Stack: Next.js (App Router) + Tailwind CSS, já em produção — não é greenfield.

## Brand Commitments

- Nome: NutriMãe.
- Tipografia já adotada: Poppins (títulos e corpo).
- Paleta já em uso (tokens em `src/app/globals.css`): rosa/pink primário `#ff6b9d` (ação/destaque), verde sage `#758f56`, marrom `#33271e` (texto), fundo creme `#fdf9f3`. O projeto já tem um sistema de temas sazonais/regionais que varia esses tokens.
- Tom de voz: acolhedor, tranquilizador, nunca alarmista — mesmo em conteúdo de segurança.

## Evidence on Hand

- Home atual em produção: `src/app/app/page.tsx` — estrutura (header com avatar+saudação+logo, card do bebê, 3 cards de benefício, sugestão do dia com chip de fase, card principal de recomendação, 3 cards de dica, CTA de busca, link de cardápio) já é estruturalmente muito próxima do que o pedido de redesign describe — isto é evolução visual sobre uma estrutura já validada, não invenção de fluxo novo.
- Mockup de referência fornecido pela usuária (imagem anexada ao pedido) — direção "Premium Cozy Maternal 3D", usada como alvo de composição, não como fonte de verdade de produto.
- Sem biblioteca de ícones 3D custom hoje — decisão registrada: construir a aproximação 3D em SVG/CSS (gradiente, sombra suave, luz difusa), não gerar/comprar imagens raster.

## Product Principles

1. Redesenhar a apresentação, nunca a função — toda rota, toda regra de negócio e todo dado dinâmico existente continua exatamente como está.
2. Reduzir carga cognitiva da mãe cansada: hierarquia clara, poucas opções por tela, resposta rápida a "o que eu faço agora".
3. Segurança alimentar é dado revisado, não estética — nenhuma alteração visual pode introduzir ou implicar uma nova afirmação de segurança não revisada.
4. Premium não é excesso: 3D e cor com propósito, a interface ainda precisa "respirar" (regra explícita da usuária).
5. PWA, não site: sem sombra pesada de "página", sem elementos que pareçam link/scroll de desktop.

## Accessibility & Inclusion

Contraste suficiente é requisito explícito (já houve um achado real de texto cinza lavado sobre fundo colorido no checkout, corrigido via auditoria com o Impeccable). Áreas de toque confortáveis (o layout atual já usa `min-h-11`/`min-h-12`+ como padrão). Não depender só de cor pra transmitir estado (ex.: item ativo da navegação).
