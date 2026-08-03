import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses service_role key to bypass RLS.
 * Only use server-side (API routes, server actions). NEVER expose to browser.
 * 
 * Falls back to anon key if SUPABASE_SERVICE_ROLE_KEY is not set,
 * but you MUST also run: GRANT INSERT, SELECT ON audit_log TO anon;
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
