-- ============================================================
-- Migration 002: Fix ambiguous FK relationships for PostgREST
-- Add COMMENT ON CONSTRAINT to help PostgREST disambiguate
-- circular foreign key relationships.
-- ============================================================

-- Circular FK: organisations.representative_id -> employees
COMMENT ON CONSTRAINT fk_org_representative ON organisations IS 'The employee who represents this organisation';

-- Circular FK: locations.responsible_id -> employees
COMMENT ON CONSTRAINT fk_location_responsible ON locations IS 'The employee responsible for this location';

-- Circular FK: sectors.manager_id -> employees
COMMENT ON CONSTRAINT fk_sector_manager ON sectors IS 'The employee who manages this sector';

-- employees.sector_id -> sectors (auto-named constraint)
COMMENT ON CONSTRAINT employees_sector_id_fkey ON employees IS 'The sector this employee belongs to';

-- employees.location_id -> locations (auto-named constraint)
COMMENT ON CONSTRAINT employees_location_id_fkey ON employees IS 'The location where this employee works';

-- year_calendar.employee_id -> employees (auto-named constraint)
COMMENT ON CONSTRAINT year_calendar_employee_id_fkey ON year_calendar IS 'The employee for this calendar entry';

-- year_calendar.absence_code_id -> absence_codes (auto-named constraint)
COMMENT ON CONSTRAINT year_calendar_absence_code_id_fkey ON year_calendar IS 'The absence code for this calendar entry';
