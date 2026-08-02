-- ============================================================
-- Fix full_time_minutes for timesheets that were incorrectly set to
-- weekly_hours × 60 × 5 instead of weekly_hours × 60.
-- 
-- The field stores WEEKLY total minutes (e.g. 38h = 2280 min).
-- Any value > 3600 (= 60h/week, unrealistic) was likely multiplied by 5.
-- ============================================================

UPDATE timesheets
SET full_time_minutes = full_time_minutes / 5
WHERE full_time_minutes > 3600 AND is_active = true;
