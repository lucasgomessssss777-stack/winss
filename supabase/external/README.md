# Migrar para um Supabase externo

Este diretório contém o script SQL completo para recriar todo o backend
deste projeto em um projeto Supabase próprio (externo).

## Passos

1. Crie um projeto novo em https://supabase.com/dashboard
2. Abra **SQL Editor** e cole o conteúdo inteiro de `0001_full_schema.sql`. Rode.
3. Confira em **Table Editor** que estas tabelas existem:
   `site_stats`, `payments`, `daily_stats`, `hourly_stats`, `site_settings`
4. Em **Project Settings → API**, copie:
   - Project URL
   - chave publishable / anon
   - chave `service_role` (secreta)
5. Aponte o app para o novo projeto com estas variáveis:
   ```
   VITE_SUPABASE_URL / SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
6. Recadastre os secrets do app: `ADMIN_USER`, `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET`, `BUCKPAY_API_TOKEN`.

## Observações

- Todo acesso ao banco é feito pelo servidor com a chave `service_role`;
  `anon` e `authenticated` não têm privilégio nenhum nestas tabelas
  (RLS ligado + grants revogados) — é intencional.
- As funções `increment_*` só podem ser executadas pelo `service_role`,
  para impedir que visitantes inflem as estatísticas.
- O script é idempotente: pode ser rodado novamente sem erros.
- Para levar os dados atuais, exporte antes em Cloud → Advanced settings →
  Export data e importe os CSVs no novo projeto.
