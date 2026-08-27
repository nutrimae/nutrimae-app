import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase SERVER-ONLY com service role (bypassa RLS de propósito —
 * o app inteiro fica atrás de senha e só lê dados agregados das tabelas
 * analytics_*). Nunca importar em componente client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TrackingClient = SupabaseClient<any>;

export function createTrackingClient(): TrackingClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
