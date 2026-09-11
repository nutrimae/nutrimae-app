/**
 * Backfill único: public.profiles.locale foi criado com default 'pt-BR'
 * (migração 202609090001) e nada no fluxo de compra/cadastro grava 'es'
 * explicitamente — todo perfil real está preso em 'pt-BR' no banco, mesmo
 * sem nenhum assinante BR ativo hoje (ver migração 202609110001).
 *
 * Execução: npx tsx scripts/backfill-locale-es.ts
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabase
    .from("profiles")
    .update({ locale: "es" })
    .eq("locale", "pt-BR")
    .select("user_id");

  if (error) {
    console.error("Erro no backfill:", error.message);
    process.exit(1);
  }

  console.log(`✅ ${data?.length ?? 0} perfis atualizados de 'pt-BR' para 'es'.`);
}

main();
