-- ============================================================
-- Add missing absence codes from Excel/Access that were not in initial schema
-- These are needed for staging data transfer to work correctly
-- ============================================================

INSERT INTO absence_codes (code, description, color_hex, text_color_hex, time_unit, sort_order) VALUES
  ('VS', 'Vacances supplémentaires 305.1', '#9370DB', '#FFFFFF', 'HOURS_MINUTES', 2),
  ('CF', 'Jour communautaire 305.2', '#20B2AA', '#FFFFFF', 'DAYS', 3),
  ('VJ', 'Vacances jeunes + congés européens', '#87CEEB', '#000000', 'DAYS', 4),
  ('RF', 'Raisons familiales impérieuses', '#DC143C', '#FFFFFF', 'DAYS', 5),
  ('RC', 'Récupération', '#32CD32', '#FFFFFF', 'HOURS_MINUTES', 6),
  ('ML', 'Maladie longue durée', '#FF4500', '#FFFFFF', 'DAYS', 7),
  ('AJ', 'Absence justifiée', '#FFA500', '#000000', 'DAYS', 8)
ON CONFLICT (code) DO NOTHING;

-- Rename V → CA (same meaning: vacances annuelles = congés légaux)
-- This avoids having two codes for the same thing.
-- The Excel/Access source uses "CA", so we align with that.
UPDATE absence_codes
SET code = 'CA', description = 'Congés légaux (annuels)', sort_order = 1
WHERE code = 'V';
