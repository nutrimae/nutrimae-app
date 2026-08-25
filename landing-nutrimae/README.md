# NutriMãe — Landing Page (`/oferta`)

Landing page de vendas isolada (HTML, CSS e JavaScript vanilla, sem dependências externas) para captação de tráfego pago do Meta Ads. Porta estática da experiência gamificada de 13 blocos que também existe como rota React em `src/app/oferta` no app principal — mesma copy, mesma lógica, mesmo preço, escritas do zero em vanilla para poder ser hospedada num domínio separado.

## Arquivos

- `quiz.html` + `quiz.js` — **página de destino do anúncio.** Ponte ultraleve de 3 perguntas (sem vídeo, fundo branco) que qualifica a visitante e redireciona para `index.html` já com a fase do bebê pré-selecionada. Ver seção própria abaixo.
- `index.html` — a landing page completa (13 blocos, ver abaixo).
- `styles.css` — todas as variáveis de cor/tipografia e estilos, mobile-first, 480px também no desktop.
- `script.js` — toda a interatividade: seletor de fase, busca de alimentos, assistente, FAQ, barra de CTA fixa, checkout e hooks de rastreamento.
- `faq.html` — central de ajuda com busca, filtros por categoria e perguntas expansíveis.
- `sobre.html` — página institucional com proposta, princípios e limites do produto.
- `institutional.css` + `institutional.js` — visual e interatividade das páginas FAQ/Sobre.
- `support-widget.css` + `support-widget.js` — atendimento compartilhado entre a landing e as páginas institucionais. Clientes são direcionados à central real do app; visitantes podem preparar uma mensagem por e-mail.
- `README.md` — este arquivo.

Nenhum arquivo depende do código do app NutriMäe (Next.js). É seguro fazer deploy desta pasta separadamente, inclusive em domínio diferente.

## Quiz Rápido (`quiz.html`) — a ponte de conversão

**É esta página, não `index.html`, que deve receber o clique do anúncio no Meta Ads.** Ela é propositalmente mínima (sem vídeo, sem CSS/JS pesado) para carregar rápido e reduzir CPC. Fluxo:

1. 3 perguntas (idade do bebê → maior prioridade → como prefere organizar as refeições), cada uma com botões grandes, uma por vez.
2. Tela de transição com barra de progresso e mensagens trocando (efeito de personalização, sem estatística inventada — só reforça que as respostas estão sendo usadas).
3. Redireciona para `index.html`, já com a fase do bebê pré-selecionada no seletor de fase (mesmo card de corte, mesmo texto de CTA que apareceriam se ela tivesse clicado manualmente).

**A fase escolhida viaja por dois canais ao mesmo tempo** (query string `?fase=` **e** `sessionStorage`): alguns hosts estáticos fazem redirect de `/index.html?query` para `/` e derrubam a query string no caminho (confirmado testando com o servidor `serve` local) — o `sessionStorage` garante que a continuidade funcione mesmo nesse cenário. Ver `applyFaseFromQuery()` em `script.js` e `finishQuiz()` em `quiz.js`.

### A regra de ouro dos botões

Todo botão da página se encaixa em uma de duas categorias, e isso é deliberado:

- **Âncoras** (Hero, nav, barra fixa, CTA final, botões dentro do seletor de fase/assistente) — rolam suavemente até a seção de oferta. Nunca tiram a visitante da página. A mãe só vê o preço quando já entendeu o produto.
- **Checkout** (o único botão dentro da seção de oferta, `#cta-checkout-dynamic`) — é o único que sai da página, indo para o link de checkout real.

Ao adicionar qualquer novo botão "Quero começar"/"Ver mais", siga essa regra: se ele está fora da seção de oferta, é âncora (`scrollToSection('bloco-6')`), nunca checkout direto.

## Estrutura da página (13 blocos)

1. **Hero** — headline de ação, vídeo VSL (placeholder), CTA que rola até o seletor de fase.
2. **Seletor de fase** (`#fase`) — funcional: ao trocar a idade, o card do Bloco 5 e o texto do CTA logo abaixo mudam.
3. **Problema** — situação do mundo ("a rotina de mãe é corrida"), nunca diagnóstico da leitora.
4. **Quebra de crença** — 3 colunas comparando por categoria (PDF parado / grupo de WhatsApp / NutriMãe), nunca por concorrente nomeado.
5. **Demonstração buscável** (`#bloco-demo`) — campo de busca **real**, com 3 alimentos funcionais (banana, abacate, morango). Sem correspondência, mostra um aviso honesto em vez de fingir resultado.
6. **Assistente NutriMãe** — widget de 2 perguntas reais (método + alergênico), identificado como "respostas automáticas · não é uma pessoa real". Não é chat simulado com mensagens fake.
7. **Tudo o que está incluso** (`#bloco-inclusos`) — checklist de valor real, sem preços fictícios riscados.
8. **Manual S.O.S.** — bloco de tranquilidade (não de medo) com link para `/sos` no app.
9. **Prova social** — carrossel contínuo com os relatos fornecidos pela marca, sem fotos, notas ou estatísticas inventadas.
10. **Sobre o NutriMãe** (`#bloco-autoridade`).
11. **Oferta** (`#bloco-6`) — só o Plano Anual. O Mensal recorrente existe no backend (Pagar.me) mas fica atrás de feature flag até passar por sandbox e produção controlada — não mostrar aqui enquanto isso.
12. **FAQ** (`#bloco-faq`) — inclui "quanto pago depois do 1º mês" com o valor exato.
13. **Rodapé** — navegação institucional, CNPJ confirmado, disclaimer e Instagram.

Mais uma **barra de CTA fixa** no mobile (fora da numeração), que aparece após o Hero e some perto da oferta.

## ⚠️ Bloqueadores de lançamento — não suba tráfego sem resolver

- **Razão social** — o CNPJ `68.580.891/0001-36` já está publicado no rodapé. A razão social não foi exibida porque ainda não foi confirmada em texto pelo responsável da marca.
- **Depoimentos** — o carrossel usa somente os 10 relatos fornecidos pela marca. Não acrescente foto, nota, data ou resultado que não tenha autorização e comprovação.
- **Instagram** — o botão do rodapé está centralizado no link `https://www.instagram.com/nutrimae.app/` nos arquivos `index.html`, `faq.html` e `sobre.html`. Confirme o perfil oficial antes do deploy e, se necessário, substitua a URL nos três arquivos.
- **Vídeo VSL** e **Facebook Pixel** — ver seções abaixo.

## Preço — fonte da verdade

Só o **Plano Anual, R$97 à vista (ou 12x de R$9,70 no cartão)**, é vendido publicamente. Esse valor aparece em 3 lugares desta página (oferta, FAQ, barra de CTA fixa) e deve ser **idêntico** ao do checkout/app principal (`src/lib/products.ts`, campo `nutrimae_assinatura.annual`, e `supabase/schema.sql` seção 12, oferta `nutrimae-anual`). Se o preço mudar, atualize os três lugares — divergência entre landing, checkout e banco é o motivo clássico de chargeback e reprovação de conta de anúncios.

O Plano Mensal recorrente já existe no backend (Pagar.me, ver `src/lib/payments/`), mas fica com `active=false` em `offers` até passar por sandbox e produção controlada — não reintroduzir na landing antes disso.

## Checkout

`APP_URL` (topo de `script.js`) aponta pro app Next.js publicado (`https://app.nutrimae.app`, domínio próprio migrado em 2026-08-24). O botão de oferta (`goToCheckout()` em `script.js`) manda direto pro checkout interno, `APP_URL + '/checkout/nutrimae-' + selectedPlan` (segue o toggle Mensal/Anual) — não é mais CartPanda.

## Vídeo VSL

Já está integrado: [youtu.be/n_zXKnnfUuM](https://youtu.be/n_zXKnnfUuM). Implementado como *facade* — a thumbnail real do YouTube (`https://img.youtube.com/vi/n_zXKnnfUuM/maxresdefault.jpg`) fica como imagem de fundo do `#video-placeholder`, e o `<iframe>` do player só é criado no clique (ver `playVideo()` em `script.js`). Isso evita carregar o player pesado do YouTube antes da hora, que prejudicaria o LCP em 4G.

Para trocar o vídeo no futuro: atualize `data-youtube-id` em `#video-wrapper` (`index.html`) e a URL da thumbnail no `style` inline do `#video-placeholder`.

## Como adicionar o Facebook Pixel

No `index.html`, há um comentário logo após a abertura do `<body>` indicando onde inserir o código base do Meta Pixel. Mova esse `<script>` para dentro do `<head>` e substitua `SEU_PIXEL_ID` pelo ID real da conta.

Os eventos já são disparados automaticamente pelo `script.js` nos seguintes pontos (todos verificam se `fbq` existe antes de chamar, então a página não quebra sem o Pixel instalado):

- `ViewContent` — carregamento da página.
- `HeroCtaClick` / `VideoPlay` — interações do Hero.
- `AgeSelected` — troca de fase no seletor.
- `FoodSearchUsed` — busca usada na demonstração.
- `AssistantAnswer` / `AssistantComplete` / `AssistantFinish` — respostas do assistente.
- `OfferView` — chegada ao bloco de oferta.
- `InitiateCheckout` — clique no botão de checkout do Plano Anual.
- `FaqOpen` / `StickyCtaClick`.

## Compatibilidade com navegadores in-app (Instagram / Facebook / TikTok)

A maior parte do tráfego pago chega pelo navegador embutido dos apps, que é mais restrito que Chrome/Safari. O `script.js` foi escrito com isso em mente: nunca usa `'IntersectionObserver' in window` (a propriedade pode existir sem ser um construtor válido, e o `new` lançaria um erro que abortaria todo o resto do script) — a checagem é `typeof window.IntersectionObserver === 'function'`, e toda criação de observer passa por um helper com `try/catch`. A barra de CTA fixa também é calculada por geometria (`getBoundingClientRect`), funcionando com ou sem IntersectionObserver.

## Como customizar cores e fontes

Todas as cores e fontes estão centralizadas no topo do `styles.css`, dentro de `:root`. Alterar essas variáveis atualiza a página inteira automaticamente.

## Deploy

### Vercel
1. Crie um novo projeto no [Vercel](https://vercel.com), apontando para esta pasta (`landing-nutrimae`).
2. Framework preset: **Other** (site estático).
3. Build command: nenhum. Output directory: raiz da pasta.
4. Deploy.

### Netlify
1. Arraste a pasta `landing-nutrimae` para o [Netlify Drop](https://app.netlify.com/drop), ou
2. Conecte o repositório e configure o "Base directory" como `landing-nutrimae`, sem build command.

Qualquer outro host de arquivos estáticos (GitHub Pages, Cloudflare Pages, S3, etc.) também funciona, já que não há build nem servidor.

## Compliance com as políticas do Meta Ads (nicho Saúde/Bebês)

Todo o texto desta página segue estas regras, obrigatórias para qualquer edição futura de copy:

1. **Nunca atribuir estado emocional/pessoal ao visitante.** Não usar frases como "você está com medo", "você se sente perdida". Descreva a situação do mundo, nunca diagnostique quem lê (ex.: "a rotina de mãe é corrida", não "você está sobrecarregada").
2. **Nunca usar linguagem de pânico ou risco de saúde de forma agressiva.** Evitar "risco", "perigo", "engasgo" (fora de contexto educativo dentro do produto), "desespero", "pânico", "pesadelo", "emergência". O Manual S.O.S. é enquadrado como tranquilidade, nunca como ameaça.
3. **Nunca prometer resultado de saúde do bebê.** Sem antes/depois, sem alusão a peso, desenvolvimento, cura de seletividade alimentar ou prevenção de alergia. O foco é sempre organização e rotina.
4. **Nunca criar escassez ou urgência falsa.** Sem contadores de tempo fictícios, vouchers ou sorteios simulados, "vagas limitadas" ou "acesso vitalício" quando é assinatura recorrente.
5. **Recorrência e cancelamento sempre visíveis.** O valor pós-primeiro-mês nunca fica escondido, e o texto de cancelamento sempre aponta onde ("direto no perfil, dentro do app, em 2 toques").
6. **Consistência total anúncio → LP → checkout.** Todo texto de oferta aqui precisa ser copiável para o criativo do anúncio sem contradizer nada, e bater exatamente com o que o checkout cobra.

Ao editar qualquer texto da página no futuro, revise-o contra essas 6 regras antes de publicar.
