-- ============================================================
-- Migration 003: Absenteeism config + seed indexation data
-- ============================================================
-- Run in Supabase SQL Editor after previous migrations.
-- ============================================================

-- ============================================================
-- 1. ABSENTEEISM POLICY CONFIGURATION
-- Stores configurable thresholds and excluded codes.
-- ============================================================

CREATE TABLE IF NOT EXISTS absenteeism_config (
  id SERIAL PRIMARY KEY,
  window_months INTEGER NOT NULL DEFAULT 6,
  warning_threshold INTEGER NOT NULL DEFAULT 2,
  danger_threshold INTEGER NOT NULL DEFAULT 4,
  excluded_codes TEXT[] NOT NULL DEFAULT ARRAY['V','F','PC','MAT','JF','CSS','JP','HS'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default config
INSERT INTO absenteeism_config (window_months, warning_threshold, danger_threshold, excluded_codes)
VALUES (6, 2, 4, ARRAY['V','F','PC','MAT','JF','CSS','JP','HS']);

-- ============================================================
-- 2. SEED ORGANISATION INDEXATIONS
-- Belgian healthcare sector indexations (sample 2020-2026)
-- These are multiplicative (e.g., 1.02 = +2% indexation)
-- ============================================================

INSERT INTO organisation_indexations (organisation_id, indexation_value, indexation_date) VALUES
(1, 1.020000, '2020-01-01'),
(1, 1.020000, '2021-01-01'),
(1, 1.020000, '2022-01-01'),
(1, 1.020000, '2022-06-01'),
(1, 1.020000, '2023-01-01'),
(1, 1.020000, '2023-11-01'),
(1, 1.020000, '2024-01-01'),
(1, 1.020000, '2024-09-01'),
(1, 1.020000, '2025-01-01'),
(1, 1.020000, '2025-09-01'),
(1, 1.020000, '2026-01-01')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. SEED SECTOR INDEXATIONS
-- Sector-specific adjustments (sample for sectors 1, 4, 5)
-- ============================================================

INSERT INTO sector_indexations (sector_id, indexation_value, indexation_date) VALUES
-- Sector 1: ACCUEIL
(1, 1.010000, '2021-07-01'),
(1, 1.015000, '2023-07-01'),
(1, 1.010000, '2025-01-01'),
-- Sector 4: INF NON IFIC
(4, 1.012000, '2021-07-01'),
(4, 1.010000, '2023-07-01'),
(4, 1.015000, '2025-01-01'),
-- Sector 5: KINE
(5, 1.010000, '2021-07-01'),
(5, 1.012000, '2023-07-01'),
(5, 1.010000, '2025-01-01')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. SEED EMPLOYEE INDEXATIONS (personal increases)
-- Sample personal salary increases for a few employees
-- These are ADDITIVE amounts (EUR/month)
-- ============================================================

INSERT INTO employee_indexations (employee_id, indexation_value, indexation_date) VALUES
(23, 150.00, '2020-01-01'),  -- Deborah CZAPNIK: personal increase
(23, 75.00, '2023-01-01'),   -- Deborah: second increase
(30, 100.00, '2019-06-01'),  -- Pascale HANTON: personal increase
(44, 200.00, '2021-01-01'),  -- Alphonse SIBOMANA: personal increase
(37, 125.00, '2022-07-01')   -- Anne-Pascale KETS: personal increase
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. SEED BOUGHT VACATIONS (sample)
-- ============================================================

INSERT INTO employee_bought_vacations (employee_id, year, bought) VALUES
(23, 2024, true),
(30, 2024, false),
(44, 2024, true),
(16, 2024, false),
(35, 2024, false),
(23, 2025, true),
(44, 2025, true),
(30, 2025, true)
ON CONFLICT (employee_id, year) DO NOTHING;

-- ============================================================
-- 6. RLS POLICIES FOR NEW TABLE
-- ============================================================

ALTER TABLE absenteeism_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read absenteeism_config"
  ON absenteeism_config FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert absenteeism_config"
  ON absenteeism_config FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update absenteeism_config"
  ON absenteeism_config FOR UPDATE TO anon USING (true);

-- Also ensure the indexation tables have read access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organisation_indexations' AND policyname = 'Allow anon read organisation_indexations') THEN
    EXECUTE 'CREATE POLICY "Allow anon read organisation_indexations" ON organisation_indexations FOR SELECT TO anon USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sector_indexations' AND policyname = 'Allow anon read sector_indexations') THEN
    EXECUTE 'CREATE POLICY "Allow anon read sector_indexations" ON sector_indexations FOR SELECT TO anon USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_indexations' AND policyname = 'Allow anon read employee_indexations') THEN
    EXECUTE 'CREATE POLICY "Allow anon read employee_indexations" ON employee_indexations FOR SELECT TO anon USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_bought_vacations' AND policyname = 'Allow anon read employee_bought_vacations') THEN
    EXECUTE 'CREATE POLICY "Allow anon read employee_bought_vacations" ON employee_bought_vacations FOR SELECT TO anon USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vacation_policies' AND policyname = 'Allow anon read vacation_policies') THEN
    EXECUTE 'CREATE POLICY "Allow anon read vacation_policies" ON vacation_policies FOR SELECT TO anon USING (true)';
  END IF;
END $$;
