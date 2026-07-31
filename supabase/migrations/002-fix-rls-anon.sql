-- ============================================================
-- Migration 002: Ajouter politiques RLS pour le rôle anon sur toutes les tables
-- ============================================================

-- employees
DROP POLICY IF EXISTS "Allow anon read" ON employees;
DROP POLICY IF EXISTS "Allow anon all" ON employees;
CREATE POLICY "Allow anon read" ON employees FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON employees FOR ALL TO anon USING (true) WITH CHECK (true);

-- organisations
DROP POLICY IF EXISTS "Allow anon read" ON organisations;
DROP POLICY IF EXISTS "Allow anon all" ON organisations;
CREATE POLICY "Allow anon read" ON organisations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON organisations FOR ALL TO anon USING (true) WITH CHECK (true);

-- sectors
DROP POLICY IF EXISTS "Allow anon read" ON sectors;
DROP POLICY IF EXISTS "Allow anon all" ON sectors;
CREATE POLICY "Allow anon read" ON sectors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON sectors FOR ALL TO anon USING (true) WITH CHECK (true);

-- locations
DROP POLICY IF EXISTS "Allow anon read" ON locations;
DROP POLICY IF EXISTS "Allow anon all" ON locations;
CREATE POLICY "Allow anon read" ON locations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON locations FOR ALL TO anon USING (true) WITH CHECK (true);

-- absence_codes
DROP POLICY IF EXISTS "Allow anon read" ON absence_codes;
DROP POLICY IF EXISTS "Allow anon all" ON absence_codes;
CREATE POLICY "Allow anon read" ON absence_codes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON absence_codes FOR ALL TO anon USING (true) WITH CHECK (true);

-- holidays
DROP POLICY IF EXISTS "Allow anon read" ON holidays;
DROP POLICY IF EXISTS "Allow anon all" ON holidays;
CREATE POLICY "Allow anon read" ON holidays FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON holidays FOR ALL TO anon USING (true) WITH CHECK (true);

-- timesheets
DROP POLICY IF EXISTS "Allow anon read" ON timesheets;
DROP POLICY IF EXISTS "Allow anon all" ON timesheets;
CREATE POLICY "Allow anon read" ON timesheets FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON timesheets FOR ALL TO anon USING (true) WITH CHECK (true);

-- year_calendar
DROP POLICY IF EXISTS "Allow anon read" ON year_calendar;
DROP POLICY IF EXISTS "Allow anon all" ON year_calendar;
CREATE POLICY "Allow anon read" ON year_calendar FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON year_calendar FOR ALL TO anon USING (true) WITH CHECK (true);

-- vacation_rights
DROP POLICY IF EXISTS "Allow anon read" ON vacation_rights;
DROP POLICY IF EXISTS "Allow anon all" ON vacation_rights;
CREATE POLICY "Allow anon read" ON vacation_rights FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON vacation_rights FOR ALL TO anon USING (true) WITH CHECK (true);

-- holiday_selections
DROP POLICY IF EXISTS "Allow anon read" ON holiday_selections;
DROP POLICY IF EXISTS "Allow anon all" ON holiday_selections;
CREATE POLICY "Allow anon read" ON holiday_selections FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON holiday_selections FOR ALL TO anon USING (true) WITH CHECK (true);
