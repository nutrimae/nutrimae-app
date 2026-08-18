# PLANO.md — Auditoria de conformidade: spec vs. app atual

Este documento compara a especificação recebida com o estado real do código em
`C:\NUTRIMAE` (branch `master`, commit `a5929a7`). Não foi feita nenhuma alteração de
código nesta etapa — só leitura e comparação.

O app **não é greenfield**: já tem autenticação, onboarding, dashboard, cardápio, lista de
compras, busca de corte, S.O.S., alergia, diário, marcos, comunidade, suporte, downloads,
extras e painéis admin implementados e funcionando. A spec recebida descreve um projeto do
zero — por isso o formato abaixo é "o que já existe / o que diverge / o que falta",
não uma ordem de implementação nova.

---

## 🔴 R1 — VIOLADA (a regra que a spec chama de inegociável)

> "O MANUAL S.O.S. É GRATUITO, PÚBLICO E SEM LOGIN... sem paywall, sem modal, sem upsell...
> em NENHUMA tela do fluxo."

Estado real:

- A única página de S.O.S. do projeto é [`src/app/app/(paid)/sos/page.tsx`](src/app/app/(paid)/sos/page.tsx:1) —
  dentro do route group `(paid)`.
- [`src/app/app/(paid)/layout.tsx`](<src/app/app/(paid)/layout.tsx>:10) exige login (`redirect("/login")` se não
  houver usuária) e assinatura ativa (`UpgradeScreen` se `status !== "active"`) para
  **qualquer** rota do grupo, S.O.S. incluso.
- Não existe rota pública `/sos` em lugar nenhum do projeto (busquei em todo `src/app`).
- Em [`src/lib/products.ts`](src/lib/products.ts:51), o Manual S.O.S. está listado dentro de
  `bundled` do produto pago `nutrimae_assinatura`, com um preço riscado de "R$29,90" — ou
  seja, o S.O.S. é usado explicitamente como **item de empilhamento de valor na tela de
  upsell**, o oposto exato do que a regra pede.
- O botão flutuante global [`SosButton`](src/components/sos-button.tsx:14) e o middleware
  ([`PUBLIC_PATHS`](src/lib/supabase/middleware.ts:4)) também não têm nenhuma exceção pública
  para S.O.S.

**Isso não é um detalhe — é a regra que a spec chama de "prova de caráter da marca" e
principal motor de aquisição orgânica.** Hoje, uma mãe sem conta batendo em `/sos` cai na
tela de login, e uma mãe logada sem assinatura cai na tela de upgrade. Nenhum dos dois é
aceitável pela regra.

**Correção necessária (não feita ainda, aguardando aprovação):**
1. Criar rota pública `src/app/sos/page.tsx` (fora de `/app`, fora de qualquer layout que
   exija auth), com o mesmo conteúdo do manual atual.
2. Adicionar `/sos` a `PUBLIC_PATHS` no middleware.
3. Remover "Manual S.O.S." da lista `bundled` de `nutrimae_assinatura` em `products.ts`.
4. Decidir o que fazer com `src/app/app/(paid)/sos/page.tsx`: manter como atalho interno
   (redirecionando para `/sos`) ou apagar e apontar `SosButton`/bottom nav para `/sos`.
5. Confirmar que `/sos` carrega e funciona 100% sem JS de auth/Supabase bloqueando o
   primeiro paint (hoje ele importa `useActiveBaby()` conforme o resto do app pago — precisa
   ser reescrito para não depender de contexto autenticado).

---

## Outras regras inegociáveis

| Regra | Status | Nota |
|---|---|---|
| R2 — nada prometido no checkout pode ser bloqueado depois | ⚠️ não verificável sem ver o checkout externo (Cartpanda) | `bundled` em `products.ts` promete S.O.S. e Alergia como bônus do plano pago; combinado com o R1 acima, o S.O.S. está sendo prometido como conteúdo pago quando deveria ser gratuito por regra — inconsistência a resolver junto com o item R1. |
| R3 — aviso médico em todo conteúdo de saúde | ✅ presente | `MedicalDisclaimerFooter` aparece nas páginas de conteúdo de saúde já verificadas (Busca, Downloads, Alergia, etc.) |
| R4 — zero promessa de saúde | ⚠️ não auditado nesta rodada | Pedido explícito da spec foi "não escreva copy de venda nesta etapa" — recomendo uma auditoria de copy separada (grep por "previne", "garante", "vai comer de tudo" etc.) antes do lançamento. |
| R5 — LGPD / dados de menor | ⚠️ parcial | RLS restringe leitura por `user_id` em todas as tabelas (bom). Não encontrei rota de **exclusão total de conta** (delete de `auth.users` + cascata) exposta para a usuária — hoje só a Política de Privacidade é linkada no Perfil. Falta confirmar se existe um fluxo de "excluir minha conta" ou se isso só é feito manualmente via suporte. |

---

## Modelo de dados — divergência estrutural do schema proposto

A spec propõe tabelas `users`, `foods`, `recipes`, `menu_plans`, `diary_entries`,
`milestones`, `sos_content`, `expansions`, `purchases`. O schema real
([`supabase/schema.sql`](supabase/schema.sql:1), 531 linhas) é bem diferente:

| Proposto na spec | Existe no app? | Real |
|---|---|---|
| `users` (plan, credito_expansao, etc.) | ❌ | Usa `auth.users` (Supabase) + `profiles` (só `display_name`, `is_admin`) + `user_products` (permissões por produto, preenchida via webhook Cartpanda) |
| `babies` (nome, sexo, **metodo**, alergenicos_marcados) | ⚠️ parcial | `babies` existe, mas **sem coluna `metodo`** (papinha/BLW/misto) — ver [`src/lib/types.ts`](src/lib/types.ts:3). Tem `gender`, `diet_filter`, não tem `alergenicos_marcados` (o checklist de alergia parece salvo em outro lugar — confirmar) |
| `foods` (60+ itens, cortes por 4 faixas, por_que, alerta, congelamento, descongelamento) | ⚠️ parcial, menor | [`src/lib/foods.ts`](src/lib/foods.ts:1) é um array estático em código (não tabela no banco), com **25 alimentos** (spec pede mínimo 60) e cada `cuts` é só uma string por faixa — sem campos estruturados `por_que`, `congelamento`, `descongelamento` separados (isso existe em outro arquivo, [`src/lib/food-prep.ts`](src/lib/food-prep.ts:1), 218 linhas, mas é um guia de preparo separado, não amarrado 1:1 a cada alimento da busca) |
| `recipes` (68+, com passos + timer) | ✅ provavelmente ok em volume | [`src/lib/recipes.ts`](src/lib/recipes.ts:1) tem 1126 linhas / ~136 ocorrências de campos — volume parece bater ou superar 68, mas é array estático, não tabela |
| `menu_plans` | ⚠️ diferente | Cardápio é gerado em runtime por [`src/lib/menu.ts`](src/lib/menu.ts:1) (778 linhas) a partir de regras + faixa etária, não persistido por bebê/semana em tabela própria |
| `diary_entries` / `milestones` | ✅ equivalente | `food_log` e `food_milestones` cobrem a mesma função com nomes diferentes |
| `sos_content` (cacheado offline, público) | ❌ | Conteúdo do S.O.S. está hardcoded no componente da página paga — sem tabela, sem cache offline dedicado |
| `expansions` / `purchases` | ❌ | Substituído por `user_products` + `webhook_logs` (grava permissão por produto direto do webhook Cartpanda, sem tabela de catálogo de expansões nem histórico de compra próprio) |

**Isto não é necessariamente errado** — usar arrays TypeScript estáticos para conteúdo que
muda pouco (receitas, cortes) é uma escolha razoável e mais simples que um CMS completo, e
o schema real claramente evoluiu de forma incremental e pragmática. Mas duas
consequências da spec ficam sem sustentação nesse modelo:

- **"Toda ficha de alimento precisa passar por revisão de profissional... crie a flag e um
  painel `/admin/revisao`"** — não existe flag `revisao_pendente` em lugar nenhum do código,
  nem painel `/admin/revisao`. Como o conteúdo é estático em TS (não em banco), não há hoje
  nenhum mecanismo de aprovação/revisão antes de um alimento ou receita "ir ao ar" — um PR
  mergeado já é publicado.
- **Método (papinha/BLW/misto)** é central na spec (corte muda por método) mas não existe
  como atributo do bebê hoje. `foods.ts` guarda só um corte por faixa etária, sem
  diferenciar por método.

---

## Módulos — status por item da spec

### Núcleo (incluso na assinatura)

| # | Módulo | Status | Observação |
|---|---|---|---|
| 1 | Onboarding (≤4 telas, time-to-value <60s) | ✅ existe | Fluxo de boas-vindas → bebê → foto → tour já implementado. Não cronometrei o time-to-value real; a spec pede "mostrar já o cardápio de amanhã" ao final — confirmar se o redirect pós-onboarding cai direto no cardápio (tarefa #14 da lista interna sugere que sim). |
| 2 | Home | ✅ existe | Saudação por horário, sugestão "para agora", atalho de busca, S.O.S. Confirmar se há card de "próxima virada de fase com contagem em dias" — não vi explicitamente no dashboard revisado antes. |
| 3 | Buscar corte seguro | ⚠️ parcial | Busca com `searchFoods()` existe e é rápida; não confirmei tolerância a erro de digitação/acentuação ("cenora" → "cenoura") — `aliases: []` está vazio em todo item de `foods.ts`, o que sugere que a busca fuzzy pedida pela spec **não está implementada** (é provavelmente match exato ou substring). Corte por **método** não existe (ver seção de dados acima). |
| 4 | Cardápio da semana | ✅ existe, com extra | 7 dias, filtragem por alergênicos, "Prato Balanceado" interativo (item #55 da lista interna) — parece superar a spec em polish. Botão "trocar refeição" — confirmar se existe. |
| 5 | Lista de compras | ✅ existe | Agrupamento e compartilhar via WhatsApp confirmados (itens #12, #57 da lista interna). |
| 6 | Receitas + Modo Cozinha | ⚠️ parcial | Receitas com filtros existem. **Modo Cozinha (tela cheia, passo a passo, timers, wake-lock) não encontrado** — busquei por `wakeLock`/`fullscreen`/"modo cozinha" em `receitas/[id]/page.tsx` e não achei nada. A spec chama isso explicitamente de diferencial vs. PDF — é o gap mais visível depois do S.O.S. |
| 7 | Alergia + checklist | ✅ existe | Checklist com filtro automático de receitas/cardápio, aviso de confirmação (funcionalidade testada e confirmada em sessão de QA anterior). |
| 8 | Diário do Bebê | ✅ existe | `food_log` + marcos alimentares + foto. |
| 9 | Marcos do desenvolvimento | ✅ existe | Trava por data (não por pagamento) — confirmar se a trava é realmente temporal e não de assinatura, já que este módulo vive fora do route group `(paid)` (`src/app/app/desenvolvimento/page.tsx`, sem sufixo pago) — isso é bom sinal de que já segue a regra "trava temporal, não trava de pagamento". |
| 10 | Comunidade | ⚠️ confirmar seed | Tabelas `community_posts`/`community_replies`/`community_faqs` existem com painel admin completo (pin/ocultar/denúncia). Spec exige 20+ posts de seed ou, na ausência de moderação garantida, entregar como FAQ curado em vez de feed aberto. Há um painel admin (bom sinal de moderação), mas não confirmei quantos posts reais existem em produção hoje — checar antes do lançamento. |
| 11 | Downloads | ✅ existe, com extra | PDFs reais gerados do conteúdo do app (não estáticos), histórico de download, avaliação, compartilhamento — cobre e supera a intenção da spec. |
| 12 | Extras (BLW, Mordedores, Pratinhos, Rotina do Sono, Calculadora de Fraldas, Utensílios) | ✅ todos existem | Utensílios já usa link de afiliado — confirmar `rel="sponsored"` e divulgação clara na própria tela (não auditado nesta rodada). |

### Grátis e público

| # | Item | Status |
|---|---|---|
| 13 | Manual S.O.S. público, sem login, offline, <1s em 3G | ❌ **é o item R1 acima — hoje é pago e exige login** |

---

## PWA / Offline

- Não encontrei `manifest.json` em `public/`.
- Não encontrei service worker (`sw.js` ou equivalente next-pwa/workbox).
- Ou seja: **o app hoje não é instalável como PWA e não tem cache offline** — nem para o
  S.O.S. (que a spec exige funcionar 100% offline), nem para o resto. Isso é esperado dado
  que o S.O.S. nem é público ainda, mas é um gap de infraestrutura separado a planejar.

## Painel /admin

- Existem painéis admin point-a-ponto (`/app/(paid)/club/admin`, `/app/(paid)/suporte/admin`),
  gateados por `profiles.is_admin`, mas não há um painel `/admin` unificado nem o
  `/admin/revisao` de conteúdo de alimentos que a spec pede — porque, como já dito, o
  conteúdo de alimentos não vive em tabela, vive em código.

---

## Resumo priorizado — o que eu recomendo atacar primeiro

1. **R1 (S.O.S. público)** — é a única regra chamada de inegociável na spec e hoje está
   violada da forma mais direta possível (paywall + login + uso como bônus de venda).
   Prioridade máxima antes de qualquer lançamento ou campanha de aquisição.
2. **Modo Cozinha em Receitas** — segundo maior gap de diferenciação vs. concorrente
   (a spec chama isso explicitamente de "o que diferencia de PDF").
3. **Busca fuzzy + corte por método** — hoje a busca não tolera erro de digitação
   (`aliases` vazio) e não existe conceito de "método" no bebê — dois pilares do módulo
   mais importante do app segundo a spec ("a feature mais importante do app").
4. **Exclusão de conta (LGPD)** — confirmar se existe fluxo de exclusão total; se não
   existir, é obrigação legal, não só boa prática.
5. **PWA/offline** — necessário para a promessa de "funciona offline" do S.O.S. e para o
   app ser instalável como PWA (mencionado no stack da spec).
6. **Expandir base de alimentos** de 25 para 60+, com estrutura completa (por_que, alerta,
   congelamento, descongelamento) por item, e criar a flag `revisao_pendente` +
   painel de revisão, já que hoje não há gate de qualidade antes da publicação de conteúdo
   de segurança alimentar.
7. **Confirmar seed/moderação da Comunidade** antes de expor a feed publicamente.
8. Auditoria de copy (R4) separada, quando chegar a etapa de copy — não fiz isso aqui a
   pedido explícito da spec ("não escreva copy de venda nesta etapa").

Nenhuma dessas correções foi aplicada ainda — este documento é só o diagnóstico. Me diga
por qual item começar (ou se quer todos, em que ordem).
