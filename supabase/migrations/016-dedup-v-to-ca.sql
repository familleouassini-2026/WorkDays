-- ============================================================
-- Deduplicate: merge code "V" (Vacances annuelles) into "CA" (Congés légaux)
-- They are the same thing. Excel/Access uses "CA". 
-- PR #64 inserted CA as a new row, but V still exists.
-- This migration moves all FK references from V's ID to CA's ID, then deletes V.
-- ============================================================

-- Step 1: Move all FK references from V to CA
UPDATE vacation_rights
SET absence_code_id = (SELECT id FROM absence_codes WHERE code = 'CA')
WHERE absence_code_id = (SELECT id FROM absence_codes WHERE code = 'V');

UPDATE holiday_selections
SET absence_code_id = (SELECT id FROM absence_codes WHERE code = 'CA')
WHERE absence_code_id = (SELECT id FROM absence_codes WHERE code = 'V');

UPDATE year_calendar
SET absence_code_id = (SELECT id FROM absence_codes WHERE code = 'CA')
WHERE absence_code_id = (SELECT id FROM absence_codes WHERE code = 'V');

-- Step 2: Delete the old V code (now orphaned)
DELETE FROM absence_codes WHERE code = 'V';
