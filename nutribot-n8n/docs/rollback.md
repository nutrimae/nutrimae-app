# Rollback

## Workflow n8n

1. No n8n, abra o workflow **NutriBot — WhatsApp Orchestrator** e clique em
   **Deactivate** — isso interrompe o webhook imediatamente, sem apagar
   nada. É a ação de rollback mais rápida e mais segura.
2. Se precisar voltar a uma versão anterior do fluxo: reimporte o JSON da
   versão anterior (guarde cada `workflow/nutribot.workflow.json` publicado
   sob controle de versão git — é exatamente para isso que ele está neste
   repositório).
3. O antigo cenário do Make pode ficar pausado (não excluído) até o n8n
   rodar em produção por tempo suficiente para dar confiança — assim, se o
   n8n precisar ser desativado, o Make pode ser reativado manualmente como
   plano B, sem perda de dados (ambos leem/escrevem em sistemas
   diferentes — o Make usa seu próprio Data Store, o n8n usa
   `nutribot_whatsapp_sessions`; eles NÃO compartilham estado).

## Banco de dados

As migrations são aditivas e reversíveis:

```bash
# desfazer 002 (colunas de observabilidade — seguro, não perde dados de negócio)
psql "$POSTGRES_URL" -f migrations/002_add_observability_columns.down.sql

# desfazer 001 (APAGA a tabela inteira — só em último caso)
psql "$POSTGRES_URL" -f migrations/001_create_nutribot_whatsapp_sessions.down.sql
```

`001.down.sql` é destrutivo (`DROP TABLE`) — só rode se tiver certeza de
que quer perder toda a memória de conversa registrada. Prefira, em caso de
dúvida, apenas desativar o workflow (seção acima) e deixar os dados como
estão; eles não atrapalham nada estando parados.

## Typebot

Nenhuma mudança de rollback é necessária no lado do Typebot só por causa do
n8n — o fluxo interno dele (seção 17 da spec) não muda. As duas únicas
mudanças pedidas nele (variável de ambiente para o link do CartPanda e a
chamada de sync de `idade_bebe`) são aditivas; remover o bloco de sync não
quebra o fluxo principal, só faz `idade_bebe` parar de ser reutilizada
entre sessões (degradação graciosa, não uma falha).

## Critério para decidir por rollback

Reverta imediatamente se, em produção, qualquer um destes ocorrer:
- mensagens sendo enviadas sem uma mensagem recebida correspondente (outbound sem inbound);
- e-mail caindo em `continueChat` (ver `docs/route-map.md`);
- `/sessions//continueChat` aparecendo nos logs de qualquer HTTP Request node;
- duplicidade de resposta para o mesmo `messageId`.

Qualquer um desses é sintoma de uma regressão no roteamento — não tente
"consertar ao vivo" em produção; desative o workflow, corrija localmente,
rode `npm run verify`, e só então reimporte.
