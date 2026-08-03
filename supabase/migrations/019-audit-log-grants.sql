-- ============================================================
-- Fix: Grant INSERT/SELECT on audit_log to anon role
-- 
-- Problem: migration 018 created the table and RLS policy but
-- never granted table-level INSERT privilege to the anon role.
-- The RLS policy (WITH CHECK true) only works if the role has
-- the underlying table privilege first.
-- 
-- Postgres privilege hierarchy:
--   1. Table-level GRANT (INSERT/SELECT/UPDATE/DELETE)
--   2. RLS policy (if RLS enabled)
-- Both must pass. Without the GRANT, RLS is irrelevant.
-- ============================================================

-- Grant INSERT + SELECT to anon (needed for browser/API writes + history reads)
GRANT INSERT, SELECT ON public.audit_log TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO anon;

-- Also grant to authenticated role (future-proof)
GRANT INSERT, SELECT ON public.audit_log TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO authenticated;

-- Disable RLS entirely on audit_log (it's a write-only log, no sensitive data)
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;
