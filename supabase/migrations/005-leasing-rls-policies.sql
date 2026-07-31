-- ============================================================
-- Migration 005: Leasing RLS policies
-- ============================================================
-- Without these policies, leasing_assets and employee_leasing
-- return 0 rows to anon role even with seed data present.
-- ============================================================

ALTER TABLE leasing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_leasing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read leasing_assets"
  ON leasing_assets FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert leasing_assets"
  ON leasing_assets FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update leasing_assets"
  ON leasing_assets FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete leasing_assets"
  ON leasing_assets FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read employee_leasing"
  ON employee_leasing FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert employee_leasing"
  ON employee_leasing FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update employee_leasing"
  ON employee_leasing FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow anon delete employee_leasing"
  ON employee_leasing FOR DELETE TO anon USING (true);
