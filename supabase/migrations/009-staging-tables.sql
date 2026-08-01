-- Migration 009: Staging tables for Excel data extraction
-- These tables hold raw extracted data BEFORE mapping to final tables
-- Process: Extract → Review → Map → Transfer → Delete staging

-- 1. Staging: Employee master data
CREATE TABLE IF NOT EXISTS staging_employees (
  id SERIAL PRIMARY KEY,
  sheet_name TEXT NOT NULL,
  last_name TEXT,
  first_name TEXT,
  hire_date TEXT,
  end_date TEXT,
  sector_code TEXT,
  contract_type TEXT,
  is_inactive BOOLEAN DEFAULT false,
  weekly_hours_lu TEXT,
  weekly_hours_ma TEXT,
  weekly_hours_me TEXT,
  weekly_hours_je TEXT,
  weekly_hours_ve TEXT,
  weekly_hours_sa TEXT,
  weekly_hours_di TEXT,
  full_time_hours TEXT,
  notes TEXT,
  raw_header TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Staging: Vacation rights (droits de congés annuels)
CREATE TABLE IF NOT EXISTS staging_vacation_rights (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  code TEXT NOT NULL,
  code_description TEXT,
  total_hours TEXT,
  total_days TEXT,
  raw_annotation TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Staging: Absences taken per month (RTT, V, etc.)
CREATE TABLE IF NOT EXISTS staging_absences_monthly (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  month INTEGER NOT NULL,
  code TEXT NOT NULL,
  hours_taken TEXT,
  days_taken TEXT,
  raw_header TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Staging: Important events / notes
CREATE TABLE IF NOT EXISTS staging_employee_events (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  event_date TEXT,
  event_type TEXT,
  description TEXT,
  raw_text TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Staging: Salary changes / barème alerts
CREATE TABLE IF NOT EXISTS staging_salary_changes (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2026,
  month INTEGER,
  change_type TEXT,
  description TEXT,
  raw_text TEXT,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staging_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_vacation_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_absences_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_employee_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_salary_changes ENABLE ROW LEVEL SECURITY;

-- Allow anon access for dev
CREATE POLICY "Allow anon all" ON staging_employees FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON staging_vacation_rights FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON staging_absences_monthly FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON staging_employee_events FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all" ON staging_salary_changes FOR ALL TO anon USING (true) WITH CHECK (true);
