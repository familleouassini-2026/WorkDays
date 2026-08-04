-- ============================================================
-- WorkDays - Report Aggregation Functions
-- ============================================================

-- get_absence_count_by_employee: aggregates absences from year_calendar for a given year
CREATE OR REPLACE FUNCTION get_absence_count_by_employee(p_year INT)
RETURNS TABLE(
  employee_id INT,
  count BIGINT,
  total_days NUMERIC,
  total_minutes NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    yc.employee_id::INT,
    COUNT(*)::BIGINT AS count,
    COALESCE(SUM(yc.absence_days), 0)::NUMERIC AS total_days,
    COALESCE(SUM(yc.absence_minutes), 0)::NUMERIC AS total_minutes
  FROM year_calendar yc
  WHERE yc.year = p_year
  GROUP BY yc.employee_id;
$$;

-- get_salary_overview: joins employees with seniority_scales to return salary overview
CREATE OR REPLACE FUNCTION get_salary_overview()
RETURNS TABLE(
  employee_id INT,
  sector_id INT,
  base_salary NUMERIC,
  seniority_years INT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    e.id::INT AS employee_id,
    e.sector_id::INT,
    ss.base_salary::NUMERIC,
    EXTRACT(YEAR FROM age(now(), e.date_of_hire))::INT AS seniority_years
  FROM employees e
  LEFT JOIN LATERAL (
    SELECT s.base_salary
    FROM seniority_scales s
    WHERE s.sector_id = e.sector_id
      AND s.years <= EXTRACT(YEAR FROM age(now(), e.date_of_hire))::INT
    ORDER BY s.years DESC
    LIMIT 1
  ) ss ON true
  WHERE e.is_inactive = false;
$$;
