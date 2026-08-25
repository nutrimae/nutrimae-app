# Máquina Low Ticket BR — NutriMãe

Diretrizes de design, copy e tráfego pago pro funil de vendas do NutriMãe.
Não é lei física — é o padrão a seguir por padrão; qualquer desvio deve ter
um motivo claro (teste A/B, pedido explícito do produto).

## 1. Design & Conversão (mobile-first)

- **Fonte mínima 16px** em qualquer texto que a compradora precisa ler pra
  decidir (preço, benefício, botão). Abaixo disso, iOS Safari dá zoom
  automático ao focar um campo — quebra o fluxo do formulário.
- **Botões de ação com no mínimo 48px de altura**, alinhados à zona do
  polegar (terço inferior da tela em mobile, não escondidos no topo).
- **Botão de finalizar compra visível sem rolagem** sempre que o conteúdo
  acima permitir — quando não der (produto com order bump, por exemplo),
  ele deve reaparecer fixo ou logo após o primeiro scroll, nunca só no fim
  de uma página longa.
- **PIX Copia e Cola em 1 clique** como método padrão pré-selecionado —
  cartão continua disponível, mas não como default, porque exige mais
  campos e tokenização antes da confirmação.
- **Escassez sutil, nunca fabricada**: contagem regressiva real do PIX
  (ele expira de verdade), nunca um "restam 2 vagas" inventado. Ver
  [design-with-intent] — fricção deliberada só quando ajuda a decisão
  informada, nunca pra empurrar decisão por ansiedade artificial.
- **Velocidade pra 3G brasileira**: meta de carregamento < 3s na primeira
  visita. Preferir imagens `next/image` já otimizadas, evitar fontes
  externas pesadas, medir com `autonomous-growth.js` (seção 4) antes de
  declarar uma página pronta.

Auditoria automatizada dessas regras: `node autonomous-growth.js <url>`
(ver seção 4).

**Anti-padrões de UI**: `npx impeccable detect "src/app/(checkout)"` (já
instalado como devDependency) escaneia contraste, hierarquia visual etc.
Rodei uma vez no checkout/upsell/downsell e achou 8 ocorrências do mesmo
padrão — texto cinza sobre fundo colorido (`text-gray-500`/`700` em cima
de `bg-rose-50`/`bg-red-50`), que fica lavado e reduz legibilidade
justamente nos blocos de aviso/confiança da página de pagamento. Ainda não
corrigi — é troca de classe Tailwind em `checkout-form.tsx`,
`downsell/page.tsx`, `downsell-checkout.tsx` e `upsell-checkout.tsx`.
Não usei `impeccable skills install` (instala skill dentro do harness do
Claude Code, fora do escopo deste projeto) — só o comando `detect`, que é
puramente um linter local.

## 2. Tráfego pago (Meta Ads)

Ao gerar copy de anúncio pra este produto, o Claude deve atuar como gestor
de tráfego, não como redator genérico:

- **Gancho emocional real, não hipérbole vazia**: falar com a mãe exausta
  a partir de uma dor específica e verificável (noites maldormidas,
  primeira papinha, medo de engasgo) — nunca prometer resultado clínico
  ("cura", "elimina o risco de alergia") que o produto não entrega.
- **Framework AIDA** como estrutura padrão:
  - *Atenção*: a dor nomeada em 5 palavras ou menos.
  - *Interesse*: por que essa dor é comum e não é falha da mãe.
  - *Desejo*: o alívio concreto que o NutriMãe entrega (não a fantasia).
  - *Ação*: um único próximo passo, sem ambiguidade.
- **Compliance anti-block obrigatório antes de publicar** qualquer copy:
  - Nunca prometer cura, diagnóstico ou resultado de saúde garantido.
  - Nunca usar "antes/depois" de criança ou insinuar comparação com outras
    mães como inadequadas.
  - Evitar superlativos não comprováveis ("o único", "garantido 100%").
  - Se a copy tocar em alergia/segurança alimentar, ela precisa ser
    factual e neutra — esse é território do conteúdo revisado do app, não
    de gancho de anúncio.

## 3. Automação de criativos (CapCut Web)

**Antes de automatizar isto: `capcut.com` não tem API pública para este
uso — qualquer automação via Playwright/Puppeteer roda por cima da
interface web, o que normalmente viola os Termos de Serviço da plataforma
e pode resultar em suspensão da conta usada. Isto NÃO foi implementado
neste passe. Antes de construir, vale confirmar se a Capcut oferece hoje
alguma API oficial ou modo de automação sancionado (Business/Ads API) —
se não oferecer, o caminho mais seguro é gerar os criativos manualmente a
partir de um template e só automatizar a troca de variáveis de texto
(gancho, público: "mãe de primeira viagem" / "mãe solo" / etc.) dentro do
próprio editor, sem headless.**

Protocolo, caso decida seguir mesmo assim (com conta descartável, nunca a
principal):

1. Template base no CapCut com placeholders de texto nomeados
   (`{{GANCHO}}`, `{{PUBLICO}}`).
2. Script de automação de navegador substitui os placeholders por
   variações vindas de uma lista (ex.: `["Mãe de primeira viagem", "Mãe
   solo", "Mãe que voltou a trabalhar"]`).
3. Renderização em lote, um vídeo por combinação.
4. Toda copy gerada passa pelo checklist de compliance da seção 2 antes de
   subir pro Meta Ads.

## 4. Auditoria visual local (`autonomous-growth.js`)

Script Playwright na raiz do projeto. Roda contra um servidor Next.js já
em execução (`npm run dev` em outro terminal) e mede, com viewport de
iPhone real:

- Tempo de carregamento (`loadTimeMs`).
- Se o botão de finalizar compra aparece sem rolagem (`visibleWithoutScroll`).
- Altura do botão vs. mínimo de 48px (zona do polegar).
- Tamanho de fonte do botão e contagem de textos abaixo de 16px na página.

```bash
node autonomous-growth.js http://localhost:3000/checkout/nutrimae-anual
```

Gera `autonomous-growth-report.json` na raiz e sai com código 1 se achar
algum problema (útil pra travar um pipeline de CI, se um dia existir um).

**Nota sobre o número de carregamento**: a primeira requisição contra o
servidor `next dev` (Turbopack) é sempre lenta porque compila a rota na
hora — isso não é o tempo real de produção. Rode o script duas vezes e
use a segunda leitura, ou meça contra `next build && next start`/produção
pra um número que reflita o que a usuária final vê.

## 5. Rotina assíncrona (recomendação — não automatizado)

**Importante: isto é uma recomendação de processo, não algo que já está
rodando sozinho.** Não configurei nenhum cron nem qualquer coisa que
aplique mudança de código automaticamente sem revisão — abrir mão de
revisão humana em código que mexe no checkout (pagamento, dado de
criança) é um risco desproporcional ao ganho de "rodar sozinho".

Se um dia quiser automatizar a cadência:

1. Rodar `node autonomous-growth.js` contra o ambiente de produção (ou um
   preview do Vercel) a cada 24h — via `ScheduleWakeup`/`/loop` se for o
   Claude Code fazendo isso, ou um cron job comum se for CI.
2. Se o relatório trouxer `pass: false`, abrir uma **branch nova** com a
   correção proposta (nunca commitar direto em `main`).
2.1. A correção sai como **Pull Request**, não como merge automático —
   alguém revisa e aprova antes de ir pro ar, do mesmo jeito que qualquer
   outra mudança neste projeto.
3. Nunca aplicar automaticamente uma mudança em `/checkout`, `/sos`, ou
   qualquer rota que toque em pagamento ou dado de bebê sem revisão
   humana explícita — essas rotas têm o maior custo de erro do produto
   inteiro.

## 6. Rastreamento server-side (Meta Conversions API)

`meta-conversion.js` (raiz do repo) já está plugado no webhook do Pagar.me
([src/app/api/webhooks/pagarme/route.ts](src/app/api/webhooks/pagarme/route.ts),
função `grantAccessForOrder`): todo pedido que vira `order.paid`/`charge.paid`
dispara um evento `Purchase` pro Meta, com e-mail/telefone hasheados
(SHA-256) e `event_id` = id do pedido (pra deduplicar com o Pixel do
navegador, se um dia existir um). Testado de verdade contra o webhook e o
Supabase remoto — com `META_ACCESS_TOKEN`/`META_PIXEL_ID` ausentes, o
disparo é um no-op silencioso e não afeta em nada a liberação de acesso;
se a chamada ao Meta falhar por qualquer motivo, o erro só vai pro log,
nunca derruba o webhook (a venda já foi processada, rastreamento é
best-effort).

Falta configurar `META_ACCESS_TOKEN`, `META_PIXEL_ID` e, opcionalmente,
`META_TEST_EVENT_CODE` pra ver eventos de verdade chegando no Eventos
Manager — ver o topo do `meta-conversion.js` pra onde gerar cada um.

[design-with-intent]: https://designwithintent.ai/
