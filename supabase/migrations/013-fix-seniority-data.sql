-- ============================================================
-- Fix seniority data: correct granted_seniority for Deborah CZAPNIK
-- Access shows: date_of_hire=2003-01-01, granted_seniority_date=1998-01-01
-- Correct accordée = 2003-1998 = 5 years (was wrongly stored as 4.0)
-- ============================================================

UPDATE employees
SET granted_seniority = 5.0
WHERE id = 23;

-- Verify: all employees should have granted_seniority matching
-- the difference between date_of_hire and granted_seniority_date
-- This SELECT shows any mismatches (run to verify, not a migration step):
-- SELECT id, last_name, first_name, date_of_hire, granted_seniority_date, granted_seniority,
--   EXTRACT(YEAR FROM AGE(date_of_hire, granted_seniority_date)) as calculated_accordee
-- FROM employees
-- WHERE granted_seniority_date IS NOT NULL;
