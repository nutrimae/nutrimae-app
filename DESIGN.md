---
name: NutriMãe
description: A alimentação do bebê, com o carinho e o acabamento de um brinquedo de pelúcia premium.
colors:
  primary: "#ff6b9d"
  primary-deep: "#e0538a"
  primary-pale: "#ffe4e9"
  sage: "#758f56"
  sage-deep: "#47582f"
  sage-pale: "#e3ebd9"
  cream: "#fdf9f3"
  cream-deep: "#f6ecdf"
  brown-ink: "#33271e"
  brown-body: "#453529"
  brown-quiet: "#5b4636"
  peach: "#e8874b"
  terracotta: "#a75f3b"
  midnight-bg: "#121a2f"
  midnight-accent: "#c084fc"
  midnight-accent-2: "#f472b6"
typography:
  display:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  meta:
    fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "22px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
components:
  button-brand:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-primary:
    backgroundColor: "{colors.sage}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.brown-body}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.brown-ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: NutriMãe

## Overview

**Creative North Star: "The Plush Nursery Console"**

NutriMãe não se parece com um site que vende assinatura — parece um objeto físico que alguém desenhou com carinho pra ficar no criado-mudo do quarto do bebê. Cada superfície é macia, arredondada, levemente insuflada; cada ícone recente é um render 3D com o acabamento fosco-brilhante de brinquedo de pelúcia ou cerâmica de bebê (o coração, a folha, a estrelinha sorridente, a gotinha), não um pictograma plano. A app inteira se comporta como um console instalado — nunca como uma página que rola: densidade alta, navegação inferior fixa, cards que respondem ao toque com uma mola suave (`cubic-bezier(0.34, 1.56, 0.64, 1)`), nunca um `ease-linear` seco.

O sistema já rejeita, na prática, dois caminhos que combinariam mal com o produto: cantos retos/duros (nada no app usa `rounded-none` ou `rounded-sm` abaixo de 12px em superfície tocável) e paletas neutras cinza-frias (todo neutro aqui é um marrom quente, nunca `gray-*`). A app também já demonstra adaptação de identidade sem perder a alma: o tema muda de rosa pra azul conforme o gênero do bebê, e vira um "Modo Madrugada" quase preto-arroxeado às 3h da manhã — mas a mola no toque e o arredondamento generoso atravessam todos os três.

**Key Characteristics:**
- Superfícies brancas ou creme flutuando sobre um fundo creme quente, nunca cinza.
- Ícones autorais em render 3D fosco-brilhante (heart/leaf/star/droplet), tratados como "bichinhos de pelúcia", não como iconografia de sistema.
- Toque = mola. Todo elemento interativo escala (`scale-[0.96]` a `[0.99]`) com easing bounce, nunca linear.
- Identidade que se adapta (rosa/azul por gênero, escuro-arroxeado à noite) sem trocar de personalidade.

## Colors

A paleta é uma "doceria quente": rosa-chiclete como assinatura, verde-sálvia como contraponto orgânico, e um creme amanteigado no lugar de qualquer branco ou cinza puro.

### Primary
- **Rosa NutriMãe** (`#ff6b9d`): a cor de ação — CTAs, ícone ativo da navegação, badges de destaque ("Mais escolhido"). Usada com moderação: quando aparece, é para dizer "toque aqui" ou "isto é especial".
- **Rosa Profundo** (`#e0538a`): hover/active do rosa primário, e a metade escura dos gradientes de botão `brand`.
- **Rosa Pálido** (`#ffe4e9`): fundo de chip/badge quando o texto por cima já é escuro o bastante — nunca carrega texto claro sozinho.

### Secondary
- **Sálvia** (`#758f56`): o botão de ação primária de formulários (`Button variant="primary"`) e o selo de "Fase: X meses" — é o verde que diz "isso é seguro e natural", em contraste deliberado com o rosa que diz "toque aqui".
- **Sálvia Profunda** (`#47582f`): texto sobre fundos sálvia claros.

### Tertiary
- **Pêssego** (`#e8874b`) e **Terracota** (`#a75f3b`): acento quente reservado pra ícones de "atenção positiva" (estrelinha de conquista, badge de fase) — nunca vira cor de botão.

### Neutral
- **Creme** (`#fdf9f3`): o fundo padrão do app inteiro. Nunca `#ffffff` puro nem `#f5f5f5` cinza — é sempre este creme levemente amarelado.
- **Marrom Tinta** (`#33271e`): texto de maior peso (títulos, valores).
- **Marrom Corpo** (`#453529`): texto de parágrafo padrão.
- **Marrom Quieto** (`#5b4636`): texto secundário — usado só em opacidade ≥78% sobre branco (ver Regra abaixo), nunca abaixo disso.

### Named Rules
**The No-Gray Rule.** Nenhum neutro do sistema é cinza puro (`gray-*`/`slate-*`). Todo "cinza" visual do app é, na verdade, marrom quente com opacidade reduzida — mesmo à meia-noite (o Modo Madrugada usa um azul-tinta `#121a2f`, não preto neutro).
**The Legible-Quiet Rule.** Texto secundário em marrom com opacidade nunca fica abaixo de 78% sobre fundo claro — o piso empírico pra 4.5:1 de contraste (auditado e corrigido nesta mesma sessão; era uma falha real recorrente antes desta regra existir).

## Typography

**Display/Body Font:** Poppins (com fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) — uma única família pra tudo, do H1 ao rótulo de navegação.

**Character:** Geométrica, arredondada nos terminais, peso confiante (600-700 nos títulos) sem nunca ficar condensada — o mesmo caráter "macio e firme" dos cantos arredondados se repete na letra.

### Hierarchy
- **Display** (700, 32px, 1.2, -0.5px): título de tela cheia, raro — reservado pra telas de conquista/onboarding.
- **Headline** (600, 24px, 1.3): título de seção grande.
- **Title** (600, 18px, 1.4): título de card (nome da receita, nome da seção dentro da Home).
- **Body** (400, 16px, 1.6): parágrafo padrão, formulários.
- **Label** (500, 12px, 1.4, uppercase opcional): badges, timestamps, legendas de card.
- **Meta** (600, 11px, 1.3): o piso do sistema — chip/pílula, item de navegação inferior, badge minúsculo. Nunca use algo menor que isto para texto funcional.

### Named Rules
**The 11px Floor Rule.** Nenhum texto funcional (rótulo, badge, item de navegação, legenda) fica abaixo de 11px, mesmo em telas muito pequenas — abaixo disso deixa de ser estética e vira falha de leitura (achado real corrigido nesta sessão: navegação inferior, badges e chips estavam a 9-10px).

## Layout

Mobile-first estrito: o app inteiro vive num shell de largura máxima `max-w-md` centralizado, com sombra suave nas bordas simulando um cartão flutuando sobre o fundo creme — mesmo em telas largas, o produto nunca vira um layout de desktop com colunas. Densidade alta: `gap-2` a `gap-3.5` entre blocos, cards com `p-3`/`px-4` — o suficiente pra respirar sem parecer um site de marketing com muito espaço vazio. Navegação inferior fixa (`sticky bottom-0`) com 4-5 itens, mais um botão flutuante de S.O.S. sempre visível por cima.

## Elevation & Depth

Sistema de sombra suave e âmbar, nunca cinza-fria — toda sombra do projeto é tingida de marrom (`rgba(69, 53, 41, ...)`), reforçando o "creme quente" mesmo na profundidade.

### Shadow Vocabulary
- **Subtle** (`0 1px 4px rgba(69, 53, 41, 0.05)`): repouso — todo card branco sobre o fundo creme usa este nível por padrão.
- **Medium** (`0 4px 16px rgba(69, 53, 41, 0.08)`): hover/lift (`.lift-on-hover`).
- **Strong** (`0 8px 32px rgba(69, 53, 41, 0.12)`): modais, folhas flutuantes, o shell do app inteiro.
- **Glow** (`0 4px 20px rgba(255, 107, 157, 0.2)`): exclusivo dos elementos "chiclete" — o CTA de busca, o botão `brand`. Nunca usado em elementos neutros.

### Named Rules
**The Warm Shadow Rule.** Toda sombra do sistema carrega tingimento marrom ou rosa — `rgba(0,0,0,...)` neutro nunca aparece; até a profundidade tem a temperatura da marca.

## Shapes

Arredondamento generoso e crescente com a importância do elemento: chips e badges são pílula (`999px`), cards de conteúdo ficam entre 16-22px, botões grandes 16-20px, avatares e ícones autorais são círculo perfeito. Nada no app usa canto reto — a superfície mais "quadrada" do sistema ainda tem 12px de raio.

### Named Rules
**The No-Sharp-Corner Rule.** Todo elemento tocável tem no mínimo 12px de raio; elementos decorativos (chips, avatares, ícones) são sempre pílula ou círculo perfeito.

## Components

### Buttons
- **Shape:** `rounded-xl` (12px) em sm/md, `rounded-2xl` (16px) em lg — nunca canto reto.
- **Primary** (`variant="primary"`): fundo sálvia sólido (`#758f56`), texto branco — a ação "segura" de formulários e fluxos internos.
- **Brand** (`variant="brand"`): gradiente rosa (`#ff6b9d` → `#e0538a`) com sombra rosa-glow — reservado pra CTAs de conversão/destaque, nunca pra ação neutra.
- **Secondary/Ghost:** transparente com borda ou fundo sálvia/rosa muito claro no hover — usados como ação secundária ao lado de um primary/brand.
- **Hover/Focus:** todo botão escala (`hover:scale-[1.02]`, `active:scale-[0.98]`) com `duration-200 ease-out` — o toque sempre responde com movimento, nunca só com mudança de cor.

### Cards / Containers
- **Corner Style:** 16-22px de raio, nunca reto.
- **Background:** branco puro (`#ffffff`) flutuando sobre o creme de fundo — o contraste entre os dois cremes (fundo vs. card) é o que dá profundidade, mais do que a sombra em si.
- **Shadow Strategy:** `shadow-subtle` em repouso; sobe pra `shadow-medium` só em resposta a hover/toque.
- **Internal Padding:** 12-16px.

### Inputs / Fields
- **Style:** borda dupla (`border-2`) sálvia clara, fundo branco 80% opaco, `rounded-2xl`.
- **Focus:** a borda vira rosa e ganha um halo de glow (`shadow-[0_0_0_4px_var(--color-primary-glow)]`) — o mesmo rosa-glow dos botões `brand`, unificando "isto está ativo/em foco" em um único vocabulário visual.
- **Error:** borda vermelha (`border-red-400`) + legenda vermelha abaixo, sem mudar o raio ou a estrutura.

### Navigation
- Barra inferior fixa, 4-5 itens com ícone + rótulo (label ≥11px, nunca só ícone), item ativo destacado por cor (rosa) — nunca só por peso de fonte, pra não depender só de cor pra indicar estado. Botão de S.O.S. flutua por cima como FAB circular, sempre alcançável com o polegar.

### Ícones Autorais 3D (Signature Component)
O elemento mais distintivo do sistema: ícones de conceito (coração, folha, estrelinha, gotinha) não são pictogramas de biblioteca, são renders 3D próprios com luz suave e brilho especular — o mesmo acabamento de brinquedo de pelúcia/cerâmica de bebê. Usados sempre em círculo (`rounded-full object-cover`), nunca menores que ~40px (abaixo disso a textura 3D não se sustenta — nesse caso, cai pra um ícone de linha simples, nunca pra uma versão borrada do render). É o elemento que mais separa NutriMãe de qualquer concorrente com iconografia de biblioteca genérica.

## Do's and Don'ts

### Do:
- **Do** usar creme (`#fdf9f3`) como fundo padrão — nunca branco ou cinza puro.
- **Do** dar a todo elemento tocável no mínimo 12px de raio.
- **Do** responder a todo toque com uma mola (`scale` + easing bounce), não só mudança de cor.
- **Do** manter texto funcional (rótulos, badges, navegação) em 11px ou mais.
- **Do** reservar o rosa-glow (`--color-primary-glow`) só pra elementos de conversão/destaque (CTA de busca, botão brand, foco de input).
- **Do** usar os renders 3D autorais em ≥40px, sempre em círculo.

### Don't:
- **Don't** usar `gray-*`/`slate-*` — todo neutro é marrom quente, mesmo no Modo Madrugada.
- **Don't** usar sombra cinza-fria neutra — toda sombra do sistema é tingida de marrom ou rosa.
- **Don't** deixar texto secundário abaixo de 78% de opacidade de marrom sobre fundo claro (falha de contraste real, já corrigida uma vez).
- **Don't** usar os ícones 3D autorais abaixo de ~40px — nesse tamanho a textura vira ruído; prefira um ícone de linha simples.
- **Don't** misturar `ease-linear` em elementos tocáveis — a mola bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)`) é a assinatura de movimento do produto.
