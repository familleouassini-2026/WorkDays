/**
 * WorkDays - Shared Calculation Utilities
 * 
 * Business rules from .kiro/specs/business-rules.md
 * Replaces the Access DProduct / IIf cascades with typed functions.
 */

// ============================================================
// TYPES
// ============================================================

export interface VacationPolicy {
  id: number;
  min_years: number;
  max_years: number | null;
  weeks_entitled: number;
  description: string;
}

export interface TimesheetRow {
  employee_id: number;
  is_active: boolean;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  saturday_minutes: number | null;
  sunday_minutes: number | null;
  full_time_minutes: number;
}

export interface IndexationRow {
  id: number;
  indexation_value: number;
  indexation_date: string;
}

export interface EmployeeIndexationRow {
  id: number;
  employee_id: number;
  indexation_value: number;
  indexation_date: string;
}

export interface SeniorityScaleRow {
  id: number;
  sector_id: number;
  years: number;
  base_salary: number;
}

// ============================================================
// SENIORITY
// ============================================================

/**
 * Calculate seniority breakdown:
 * 
 * - (A) Ancienneté accordée = granted_seniority numeric field (bonus years granted by employer)
 * - (B) Ancienneté acquise = (referenceDate - granted_seniority_date) in years
 *   If no granted_seniority_date, falls back to date_of_hire
 * - (C) Ancienneté totale = acquise + accordée
 * - (D) Ancienneté prise en compte = floor(totale) — used for barème/RTT lookup
 *       Capped at max barème tier when applicable (done externally)
 *
 * Example Lidia: acquise=11.22 + accordée=1.00 = totale 12.22 → prise en compte = 12
 */
export function calculateSeniorityBreakdown(
  dateOfHire: string | null,
  grantedSeniorityDate: string | null,
  referenceDate: Date = new Date(),
  grantedSeniority: number | null = null
): {
  accordee: number;
  acquise: number;
  totale: number;
  dateEffective: string | null;
} {
  if (!dateOfHire) return { accordee: 0, acquise: 0, totale: 0, dateEffective: null };

  const hireDate = new Date(dateOfHire);
  const effectiveStart = grantedSeniorityDate ? new Date(grantedSeniorityDate) : hireDate;

  // Accordée = numeric granted seniority (bonus years)
  const accordee = grantedSeniority && grantedSeniority > 0 ? grantedSeniority : 0;

  // Acquise = effective start → reference date (actual time worked from reference start)
  const acquiseMs = Math.max(0, referenceDate.getTime() - effectiveStart.getTime());
  const acquise = acquiseMs / (1000 * 60 * 60 * 24 * 365.25);

  // Totale = acquise + accordée
  const totale = acquise + accordee;

  return {
    accordee: Math.round(accordee * 100) / 100,
    acquise: Math.round(acquise * 100) / 100,
    totale: Math.round(totale * 100) / 100,
    dateEffective: grantedSeniorityDate || dateOfHire,
  };
}

/**
 * Calculate seniority years for barème lookup.
 * Returns floor(totale) = floor(acquise + accordée).
 * The caller should cap this at max barème tier if needed.
 */
export function calculateSeniorityYears(
  dateOfHire: string | null,
  grantedSeniority: number | null,
  grantedSeniorityDate: string | null,
  referenceDate: Date = new Date()
): number {
  const { totale } = calculateSeniorityBreakdown(dateOfHire, grantedSeniorityDate, referenceDate, grantedSeniority);
  return Math.floor(totale);
}

// ============================================================
// VACATION ENTITLEMENT
// ============================================================

/**
 * Determine weeks entitled based on years of service and vacation policy table.
 * Replaces the IIf ladder from Access: 0→0, ≤1→1, ≤7→2, ≤14→3, ≤24→4, ≥25→5
 */
export function getVacationWeeks(
  seniorityYears: number,
  policies: VacationPolicy[]
): { weeks: number; description: string } {
  if (seniorityYears <= 0) return { weeks: 0, description: "Pas encore un an" };

  // Sort policies by min_years ascending
  const sorted = [...policies].sort((a, b) => a.min_years - b.min_years);

  for (const policy of sorted) {
    const maxYears = policy.max_years ?? Infinity;
    if (seniorityYears > policy.min_years && seniorityYears <= maxYears) {
      return { weeks: policy.weeks_entitled, description: policy.description };
    }
    // Edge case: if min=25 max=null, covers 25+
    if (policy.max_years === null && seniorityYears >= policy.min_years) {
      return { weeks: policy.weeks_entitled, description: policy.description };
    }
  }

  // Fallback: find highest applicable
  const last = sorted[sorted.length - 1];
  if (last && seniorityYears >= last.min_years) {
    return { weeks: last.weeks_entitled, description: last.description };
  }

  return { weeks: 0, description: "Aucune politique applicable" };
}

/**
 * Get weekly working hours from a timesheet (sum of daily minutes → hours).
 */
export function getWeeklyHoursFromTimesheet(timesheet: TimesheetRow | null): number {
  if (!timesheet) return 38; // Default Belgian full-time
  const totalMinutes =
    (timesheet.monday_minutes || 0) +
    (timesheet.tuesday_minutes || 0) +
    (timesheet.wednesday_minutes || 0) +
    (timesheet.thursday_minutes || 0) +
    (timesheet.friday_minutes || 0) +
    (timesheet.saturday_minutes || 0) +
    (timesheet.sunday_minutes || 0);
  return totalMinutes / 60;
}

/**
 * Calculate total vacation entitlement in hours (or minutes).
 * Formula: (weeks_entitled + bought_week) × weekly_hours
 */
export function calculateVacationHours(
  weeksEntitled: number,
  boughtVacation: boolean,
  weeklyHours: number
): number {
  const totalWeeks = weeksEntitled + (boughtVacation ? 1 : 0);
  return totalWeeks * weeklyHours;
}

/**
 * Format hours as "Xh YYm" string.
 */
export function formatHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const mins = Math.round(Math.abs(totalMinutes) % 60);
  const sign = totalMinutes < 0 ? "-" : "";
  return `${sign}${hours}h${mins.toString().padStart(2, "0")}`;
}

// ============================================================
// SALARY CALCULATION
// ============================================================

/**
 * DProduct: multiply all indexation values (≥ 1.0 typically).
 * This is the Access DProduct("IndexationNumber", "tbl_Cmn_Indexation") equivalent.
 * Only includes indexations with effective_date <= referenceDate.
 */
export function calculateDProduct(
  indexations: IndexationRow[],
  referenceDate: Date = new Date()
): number {
  let product = 1;
  for (const idx of indexations) {
    if (new Date(idx.indexation_date) <= referenceDate) {
      product *= idx.indexation_value;
    }
  }
  return product;
}

/**
 * Sum of personal (employee-level) increases (additive).
 * In Access: DSum("IndexationNumber","tbl_Emp_Indexation","EmployeeID = X")
 */
export function calculatePersonalIncreases(
  employeeIndexations: EmployeeIndexationRow[],
  referenceDate: Date = new Date()
): number {
  let sum = 0;
  for (const idx of employeeIndexations) {
    if (new Date(idx.indexation_date) <= referenceDate) {
      sum += idx.indexation_value;
    }
  }
  return sum;
}

/**
 * Find the applicable base salary from seniority scales.
 * Scales are stored as (sector_id, years, base_salary).
 * We find the highest `years` value that is <= the employee's seniority.
 */
export function findBaseSalary(
  sectorId: number,
  seniorityYears: number,
  scales: SeniorityScaleRow[]
): number | null {
  const sectorScales = scales
    .filter((s) => s.sector_id === sectorId)
    .sort((a, b) => b.years - a.years); // Descending

  for (const scale of sectorScales) {
    if (seniorityYears >= scale.years) {
      return scale.base_salary;
    }
  }
  return sectorScales.length > 0 ? sectorScales[sectorScales.length - 1].base_salary : null;
}

/**
 * Full salary calculation:
 * current_salary = base_salary × PRODUCT(org_indexations) × PRODUCT(sector_indexations) + SUM(personal_increases)
 */
export function calculateFullSalary(params: {
  baseSalary: number;
  orgIndexations: IndexationRow[];
  sectorIndexations: IndexationRow[];
  personalIncreases: EmployeeIndexationRow[];
  referenceDate?: Date;
}): {
  baseSalary: number;
  orgFactor: number;
  sectorFactor: number;
  combinedFactor: number;
  personalTotal: number;
  indexedSalary: number;
  totalSalary: number;
} {
  const refDate = params.referenceDate || new Date();
  const orgFactor = calculateDProduct(params.orgIndexations, refDate);
  const sectorFactor = calculateDProduct(params.sectorIndexations, refDate);
  const combinedFactor = orgFactor * sectorFactor;
  const personalTotal = calculatePersonalIncreases(params.personalIncreases, refDate);
  const indexedSalary = params.baseSalary * combinedFactor;
  const totalSalary = indexedSalary + personalTotal;

  return {
    baseSalary: params.baseSalary,
    orgFactor,
    sectorFactor,
    combinedFactor,
    personalTotal,
    indexedSalary,
    totalSalary,
  };
}

// ============================================================
// ABSENTEEISM POLICY
// ============================================================

/**
 * Codes excluded from the absenteeism count.
 * From Access: Not In ("V","VFML","PD","FMLA","F","JD","ML","PC","SFML")
 * Mapped to our schema codes:
 * V = Vacances, F = Formation, PC = Petits chômages, MA (maladie is COUNTED)
 * We keep the ones we DO exclude (vacation, formation, small leaves, maternity leave)
 */
export const ABSENTEEISM_EXCLUDED_CODES = [
  "CA",   // Congés légaux (annuels)
  "F",    // Formation
  "PC",   // Petits chômages
  "MAT",  // Maternité
  "JF",   // Récup jour férié
  "CSS",  // Congé sans solde (bought)
  "JP",   // Solde congés N-1
  "HS",   // Heures supplémentaires
];

/**
 * Calculate the 6-month rolling window start date.
 */
export function getAbsenteeismWindowStart(referenceDate: Date = new Date()): Date {
  const start = new Date(referenceDate);
  start.setMonth(start.getMonth() - 6);
  return start;
}

/**
 * Determine alert level based on number of incidents.
 */
export function getAbsenteeismAlertLevel(incidents: number): {
  level: "ok" | "warning" | "danger";
  label: string;
} {
  if (incidents >= 4) return { level: "danger", label: "Critique" };
  if (incidents >= 2) return { level: "warning", label: "Attention" };
  return { level: "ok", label: "Normal" };
}
