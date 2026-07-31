-- ============================================================
-- Migration 006: Seed absence test data for business rule validation
-- ============================================================
-- Generates realistic absence data for 2024-2026 to test:
-- - Soldes congés (vacation balance calculation)
-- - Politique absentéisme (6-month rolling window)
-- - Rapports (absences par employé/mois)
-- ============================================================

-- Absence code IDs (from schema.sql seed):
-- 1 = RTT, 2 = JP, 3 = CSS, 4 = PC, 5 = JF, 6 = MA, 7 = MAT, 8 = AT, 9 = F, 10 = HS, 11 = V

-- ============================================================
-- EMPLOYEE 23 (Deborah CZAPNIK) — Kine, 28 ans ancienneté
-- ============================================================

-- Vacances (code 11 = V) — 2024: 5 semaines consumed partially
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-02-12', 23, 11, 480, NULL, 'Vacances ski'),
(2024, '2024-02-13', 23, 11, 480, NULL, 'Vacances ski'),
(2024, '2024-02-14', 23, 11, 480, NULL, 'Vacances ski'),
(2024, '2024-02-15', 23, 11, 480, NULL, 'Vacances ski'),
(2024, '2024-02-16', 23, 11, 480, NULL, 'Vacances ski'),
(2024, '2024-04-08', 23, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-09', 23, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-10', 23, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-11', 23, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-12', 23, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-07-15', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-16', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-17', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-18', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-19', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-22', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-23', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-24', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-25', 23, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-26', 23, 11, 480, NULL, 'Vacances été');
-- = 20 jours × 8h = 160h = 9600 minutes de vacances 2024

-- RTT (code 1) — 2024
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-03-15', 23, 1, 480, NULL, 'RTT'),
(2024, '2024-06-07', 23, 1, 480, NULL, 'RTT'),
(2024, '2024-09-20', 23, 1, 480, NULL, 'RTT'),
(2024, '2024-11-29', 23, 1, 480, NULL, 'RTT');
-- = 4 jours × 8h = 32h = 1920 minutes RTT

-- Maladie (code 6 = MA) — comptera dans absentéisme
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-01-22', 23, 6, 480, NULL, 'Grippe'),
(2024, '2024-01-23', 23, 6, 480, NULL, 'Grippe'),
(2024, '2024-05-13', 23, 6, 480, NULL, 'Migraine'),
(2024, '2024-10-07', 23, 6, 480, NULL, 'Rhume');
-- = 4 incidents maladie

-- Formation (code 9 = F) — exclu absentéisme
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-03-21', 23, 9, 480, NULL, 'Formation kiné sportive'),
(2024, '2024-09-12', 23, 9, 480, NULL, 'Congrès annuel');

-- ============================================================
-- EMPLOYEE 30 (Pascale HANTON) — Infirmière, secteur 4
-- ============================================================

-- Vacances 2024
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-03-04', 30, 11, 480, NULL, 'Vacances carnaval'),
(2024, '2024-03-05', 30, 11, 480, NULL, 'Vacances carnaval'),
(2024, '2024-03-06', 30, 11, 480, NULL, 'Vacances carnaval'),
(2024, '2024-08-05', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-06', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-07', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-08', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-09', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-12', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-13', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-14', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-15', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-16', 30, 11, 480, NULL, 'Vacances été'),
(2024, '2024-12-23', 30, 11, 480, NULL, 'Vacances Noël'),
(2024, '2024-12-24', 30, 11, 480, NULL, 'Vacances Noël'),
(2024, '2024-12-27', 30, 11, 480, NULL, 'Vacances Noël');
-- = 16 jours vacances

-- Maladie (MA) — pour tester absentéisme élevé
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-02-05', 30, 6, 480, NULL, 'Grippe'),
(2024, '2024-02-06', 30, 6, 480, NULL, 'Grippe'),
(2024, '2024-02-07', 30, 6, 480, NULL, 'Grippe'),
(2024, '2024-04-15', 30, 6, 480, NULL, 'Dos bloqué'),
(2024, '2024-04-16', 30, 6, 480, NULL, 'Dos bloqué'),
(2024, '2024-06-03', 30, 6, 480, NULL, 'Gastro'),
(2024, '2024-09-16', 30, 6, 480, NULL, 'Covid'),
(2024, '2024-09-17', 30, 6, 480, NULL, 'Covid'),
(2024, '2024-09-18', 30, 6, 480, NULL, 'Covid'),
(2024, '2024-11-04', 30, 6, 480, NULL, 'Angine');
-- = 10 jours maladie, 5 incidents → CRITIQUE dans absentéisme

-- ============================================================
-- EMPLOYEE 44 (Alphonse SIBOMANA) — Infirmier IFIC, secteur 9
-- ============================================================

-- Vacances 2024
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-04-02', 44, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-03', 44, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-04', 44, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-04-05', 44, 11, 480, NULL, 'Vacances Pâques'),
(2024, '2024-08-19', 44, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-20', 44, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-21', 44, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-22', 44, 11, 480, NULL, 'Vacances été'),
(2024, '2024-08-23', 44, 11, 480, NULL, 'Vacances été');
-- = 9 jours vacances

-- Maladie — 1 seul incident (normal)
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-06-17', 44, 6, 480, NULL, 'Rhume');

-- Petits chômages (code 4 = PC) — exclu absentéisme, en JOURS
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-05-10', 44, 4, NULL, 1, 'Mariage fille');

-- ============================================================
-- EMPLOYEE 35 (Cindy HUIJSKENS) — Infirmière, secteur 4
-- ============================================================

-- Vacances 2024
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-07-01', 35, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-02', 35, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-03', 35, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-04', 35, 11, 480, NULL, 'Vacances été'),
(2024, '2024-07-05', 35, 11, 480, NULL, 'Vacances été');

-- Maladie — 2 incidents (attention)
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2024, '2024-03-11', 35, 6, 480, NULL, 'Grippe'),
(2024, '2024-03-12', 35, 6, 480, NULL, 'Grippe'),
(2024, '2024-08-26', 35, 6, 480, NULL, 'Fatigue');

-- ============================================================
-- 2025-2026 DATA (for 6-month rolling window absenteeism test)
-- Recent absences that will show in the absenteeism rolling window
-- ============================================================

-- Employee 30: recent maladies 2026 (will trigger CRITIQUE)
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2026, '2026-02-03', 30, 6, 480, NULL, 'Bronchite'),
(2026, '2026-02-04', 30, 6, 480, NULL, 'Bronchite'),
(2026, '2026-03-17', 30, 6, 480, NULL, 'Migraine'),
(2026, '2026-04-28', 30, 6, 480, NULL, 'Dos'),
(2026, '2026-04-29', 30, 6, 480, NULL, 'Dos'),
(2026, '2026-06-09', 30, 6, 480, NULL, 'Gastro'),
(2026, '2026-07-14', 30, 6, 480, NULL, 'Grippe été');
-- = 7 jours, 5 incidents dans les 6 derniers mois → CRITIQUE

-- Employee 23: 2 incidents récents 2026 (ATTENTION)
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2026, '2026-03-10', 23, 6, 480, NULL, 'Grippe'),
(2026, '2026-03-11', 23, 6, 480, NULL, 'Grippe'),
(2026, '2026-06-02', 23, 6, 480, NULL, 'Migraine');
-- = 3 jours, 2 incidents → ATTENTION

-- Employee 44: 1 incident récent (NORMAL)
INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2026, '2026-05-19', 44, 6, 480, NULL, 'Rhume');

-- Employee 35: 0 incidents récents 2026 → NORMAL (n'apparaîtra pas)

-- ============================================================
-- VACANCES 2026 (pour tester les soldes de l'année en cours)
-- ============================================================

INSERT INTO year_calendar (year, absence_date, employee_id, absence_code_id, absence_minutes, absence_days, reason) VALUES
(2026, '2026-02-24', 23, 11, 480, NULL, 'Vacances carnaval'),
(2026, '2026-02-25', 23, 11, 480, NULL, 'Vacances carnaval'),
(2026, '2026-02-26', 23, 11, 480, NULL, 'Vacances carnaval'),
(2026, '2026-04-14', 23, 11, 480, NULL, 'Vacances Pâques'),
(2026, '2026-04-15', 23, 11, 480, NULL, 'Vacances Pâques'),
(2026, '2026-04-16', 23, 11, 480, NULL, 'Vacances Pâques'),
(2026, '2026-04-17', 23, 11, 480, NULL, 'Vacances Pâques'),
(2026, '2026-04-18', 23, 11, 480, NULL, 'Vacances Pâques');
-- = 8 jours × 8h = 3840 minutes vacances 2026 pour Deborah

-- Bought vacation 2026 for employee 23
INSERT INTO employee_bought_vacations (employee_id, year, bought) VALUES
(23, 2026, true)
ON CONFLICT (employee_id, year) DO UPDATE SET bought = true;

-- ============================================================
-- RLS for year_calendar (ensure anon can read)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'year_calendar' AND policyname = 'Allow anon read year_calendar') THEN
    EXECUTE 'CREATE POLICY "Allow anon read year_calendar" ON year_calendar FOR SELECT TO anon USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'year_calendar' AND policyname = 'Allow anon insert year_calendar') THEN
    EXECUTE 'CREATE POLICY "Allow anon insert year_calendar" ON year_calendar FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END $$;
