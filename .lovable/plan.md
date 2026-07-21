Resposta sobre o banco de dados: não há risco de sobrecarga. Hoje o site guarda apenas uma linha de contadores (`site_stats`) e uma linha por pagamento. A proposta abaixo usa uma tabela de agregação diária (`daily_stats`), que cria **no máximo uma linha por dia** — é muito leve e cresce de forma previsível. O funil exibe os últimos 7 dias.

Etapas:

1. Banco de dados — nova tabela de agregação diária
   - Criar `public.daily_stats` com colunas: `date`, `visits`, `quiz_starts`, `quiz_completions`, `form_starts`, `double_clicks`, `payments_count`, `payments_amount`.
   - Adicionar GRANT e RLS para acesso seguro via service role.
   - Criar funções RPC para incrementar cada métrica no dia atual (`increment_daily_visits`, `increment_daily_quiz_start`, `increment_daily_quiz_completion`, `increment_daily_form_start`, `increment_daily_double_click`).
   - Atualizar `recordPayment` para também somar o valor do dia na `daily_stats`.

2. Backend — novas funções de servidor
   - Em `src/lib/tracking.functions.ts`, adicionar: `trackQuizStart`, `trackQuizCompletion`, `trackFormStart`.
   - Em `src/lib/admin.functions.ts`, adicionar `getDailyStats({ days: number })` que retorne os totais dos últimos N dias para montar o funil.

3. Frontend — disparar os novos eventos
   - `src/routes/index.tsx`: contar clique no botão "Começar".
   - `src/routes/quiz.tsx`: contar conclusão do quiz (antes de ir para /premiacao).
   - `src/routes/premiacao.tsx`: contar clique em "Continuar" (indo para /formulario).
   - Manter os eventos antigos (`trackVisit`, `trackDoubleClick`, `recordPayment`).

4. Painel admin — novo gráfico de funil
   - Adicionar gráfico de funil em `src/routes/admin.tsx` com as etapas: Visitas → Início do quiz → Conclusão do quiz → Início do formulário → Cliques em "Dobrar" → Pagamentos gerados.
   - Usar SVG próprio, sem instalar biblioteca extra, para manter o projeto leve.
   - O funil será filtrado por período; começar com "Últimos 7 dias" e deixar pronto para expandir depois.
   - Adicionar cards de resumo com as novas métricas (início do quiz, conclusão do quiz, início do formulário).

5. Testes e ajustes
   - Verificar build, tipos e que o funil carrega os dados corretamente.
   - Validar que o banco continua com crescimento controlado (uma linha por dia na tabela nova).