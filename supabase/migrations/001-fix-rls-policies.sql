-- ============================================================
-- Migration 001: Fix RLS policies for anon role
-- The app uses the Supabase anon key without authentication,
-- so we need to allow the anon role to access all tables.
-- ============================================================

-- Employees
CREATE POLICY "Allow anon read" ON employees FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON employees FOR ALL TO anon USING (true) WITH CHECK (true);

-- Organisations
CREATE POLICY "Allow anon read" ON organisations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON organisations FOR ALL TO anon USING (true) WITH CHECK (true);

-- Sectors
CREATE POLICY "Allow anon read" ON sectors FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON sectors FOR ALL TO anon USING (true) WITH CHECK (true);

-- Locations
CREATE POLICY "Allow anon read" ON locations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON locations FOR ALL TO anon USING (true) WITH CHECK (true);

-- Absence Codes
CREATE POLICY "Allow anon read" ON absence_codes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON absence_codes FOR ALL TO anon USING (true) WITH CHECK (true);

-- Holidays
CREATE POLICY "Allow anon read" ON holidays FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON holidays FOR ALL TO anon USING (true) WITH CHECK (true);

-- Timesheets
CREATE POLICY "Allow anon read" ON timesheets FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON timesheets FOR ALL TO anon USING (true) WITH CHECK (true);

-- Year Calendar
CREATE POLICY "Allow anon read" ON year_calendar FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON year_calendar FOR ALL TO anon USING (true) WITH CHECK (true);

-- Vacation Rights
CREATE POLICY "Allow anon read" ON vacation_rights FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON vacation_rights FOR ALL TO anon USING (true) WITH CHECK (true);

-- Holiday Selections
CREATE POLICY "Allow anon read" ON holiday_selections FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon all" ON holiday_selections FOR ALL TO anon USING (true) WITH CHECK (true);
