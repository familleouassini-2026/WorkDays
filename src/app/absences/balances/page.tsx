"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Clock, Calendar, ShoppingBag, Info } from "lucide-react";
import {
  calculateSeniorityYears,
  getVacationWeeks,
  getWeeklyHoursFromTimesheet,
  calculateVacationHours,
  formatHoursMinutes,
  type VacationPolicy,
  type TimesheetRow,
} from "@/lib/calculations";

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_hire: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  sector_id: number | null;
  is_inactive: boolean;
}

interface BoughtVacation {
  employee_id: number;
  year: number;
  bought: boolean;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  time_unit: "HOURS_MINUTES" | "DAYS";
}

interface YearCalendarEntry {
  employee_id: number;
  absence_code_id: number;
  absence_minutes: number | null;
  absence_days: number | null;
}

interface BalanceRow {
  employeeId: number;
  employeeName: string;
  seniorityYears: number;
  weeksEntitled: number;
  boughtVacation: boolean;
  weeklyHours: number;
  totalHoursEntitled: number;
  totalMinutesUsed: number;
  balanceMinutes: number;
  policyDescription: string;
}

interface CodeBalanceRow {
  employeeId: number;
  employeeName: string;
  codeId: number;
  code: string;
  codeDescription: string;
  timeUnit: "HOURS_MINUTES" | "DAYS";
  entitled: number; // minutes for H/M, days for DAYS
  used: number; // minutes for H/M, days for DAYS
  balance: number;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AbsenceBalancesPage() {
  const [vacationBalances, setVacationBalances] = useState<BalanceRow[]>([]);
  const [codeBalances, setCodeBalances] = useState<CodeBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"vacation" | "all">("vacation");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    async function fetchBalances() {
      setLoading(true);
      const supabase = createClient();

      // Fetch all required data in parallel
      const [
        empRes,
        policiesRes,
        timesheetsRes,
        boughtRes,
        calendarRes,
        codesRes,
        rightsRes,
      ] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name, date_of_hire, granted_seniority, granted_seniority_date, sector_id, is_inactive")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase.from("vacation_policies").select("*").order("min_years"),
        supabase
          .from("timesheets")
          .select("employee_id, is_active, monday_minutes, tuesday_minutes, wednesday_minutes, thursday_minutes, friday_minutes, saturday_minutes, sunday_minutes, full_time_minutes")
          .eq("is_active", true),
        supabase
          .from("employee_bought_vacations")
          .select("employee_id, year, bought")
          .eq("year", selectedYear),
        supabase
          .from("year_calendar")
          .select("employee_id, absence_code_id, absence_minutes, absence_days")
          .eq("year", selectedYear),
        supabase
          .from("absence_codes")
          .select("id, code, description, time_unit")
          .order("sort_order"),
        supabase
          .from("vacation_rights")
          .select("employee_id, absence_code_id, year, days, hours, minutes")
          .eq("year", selectedYear),
      ]);

      const employees = (empRes.data || []) as Employee[];
      const policies = (policiesRes.data || []) as VacationPolicy[];
      const timesheets = (timesheetsRes.data || []) as TimesheetRow[];
      const boughtVacs = (boughtRes.data || []) as BoughtVacation[];
      const calendar = (calendarRes.data || []) as YearCalendarEntry[];
      const codes = (codesRes.data || []) as AbsenceCode[];
      const rights = (rightsRes.data || []) as Array<{
        employee_id: number;
        absence_code_id: number;
        year: number;
        days: number;
        hours: number;
        minutes: number;
      }>;

      // Reference date for seniority: Jan 1 of selected year
      const refDate = new Date(selectedYear, 0, 1);

      // Build vacation-specific balances
      const vacRows: BalanceRow[] = [];
      // Find the vacation code (CA = Congés légaux/annuels)
      const vacCode = codes.find((c) => c.code === "CA");

      for (const emp of employees) {
        const seniorityYears = calculateSeniorityYears(
          emp.date_of_hire,
          emp.granted_seniority,
          emp.granted_seniority_date,
          refDate
        );

        const { weeks, description } = getVacationWeeks(seniorityYears, policies);

        const timesheet = timesheets.find((t) => t.employee_id === emp.id) || null;
        const weeklyHours = getWeeklyHoursFromTimesheet(timesheet);

        const bought = boughtVacs.find((b) => b.employee_id === emp.id);
        const hasBought = bought?.bought || false;

        // Droit CA = valeur gestionnaire dans vacation_rights (seule source de vérité)
        let totalMinutesEntitled = 0;
        if (vacCode) {
          const manualRight = rights.find(
            (r) => r.employee_id === emp.id && r.absence_code_id === vacCode.id
          );
          if (manualRight) {
            totalMinutesEntitled = manualRight.hours * 60 + manualRight.minutes;
          }
        }

        // Sum consumed vacation minutes from year_calendar for code "CA"
        let totalMinutesUsed = 0;
        if (vacCode) {
          const empCalendar = calendar.filter(
            (c) => c.employee_id === emp.id && c.absence_code_id === vacCode.id
          );
          totalMinutesUsed = empCalendar.reduce(
            (sum, c) => sum + (c.absence_minutes || 0),
            0
          );
        }

        const balanceMinutes = totalMinutesEntitled - totalMinutesUsed;

        vacRows.push({
          employeeId: emp.id,
          employeeName: `${emp.last_name}, ${emp.first_name}`,
          seniorityYears,
          weeksEntitled: weeks + (hasBought ? 1 : 0),
          boughtVacation: hasBought,
          weeklyHours,
          totalHoursEntitled: totalMinutesEntitled / 60,
          totalMinutesUsed,
          balanceMinutes,
          policyDescription: description,
        });
      }

      setVacationBalances(vacRows);

      // Build per-code balances for all codes
      const allCodeBalances: CodeBalanceRow[] = [];
      for (const emp of employees) {
        for (const code of codes) {
          // Get entitlement from vacation_rights
          const right = rights.find(
            (r) => r.employee_id === emp.id && r.absence_code_id === code.id
          );

          // Get consumption from year_calendar
          const consumed = calendar.filter(
            (c) => c.employee_id === emp.id && c.absence_code_id === code.id
          );

          let entitled = 0;
          let used = 0;

          if (code.time_unit === "HOURS_MINUTES") {
            entitled = right ? right.hours * 60 + right.minutes : 0;
            used = consumed.reduce((sum, c) => sum + (c.absence_minutes || 0), 0);
          } else {
            // DAYS
            entitled = right ? right.days : 0;
            used = consumed.reduce((sum, c) => sum + (c.absence_days || 0), 0);
          }

          // Only show rows where there's entitlement or usage
          if (entitled > 0 || used > 0) {
            allCodeBalances.push({
              employeeId: emp.id,
              employeeName: `${emp.last_name}, ${emp.first_name}`,
              codeId: code.id,
              code: code.code,
              codeDescription: code.description,
              timeUnit: code.time_unit,
              entitled,
              used,
              balance: entitled - used,
            });
          }
        }
      }

      setCodeBalances(allCodeBalances);
      setLoading(false);
    }

    fetchBalances();
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Soldes de conges
          </h1>
          <p className="text-slate-500 mt-1">
            Droits et consommation par employe — calcul par anciennete
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("vacation")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "vacation"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Vacances
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Tous les codes
            </button>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Calcul automatique :</strong> Les droits vacances sont calcules
          automatiquement selon l&apos;anciennete (politique configurable) ×
          heures hebdomadaires (timesheet actif) + semaine achetee si applicable.
          Les autres codes utilisent les droits saisis manuellement dans{" "}
          <code className="bg-blue-100 px-1 rounded">vacation_rights</code>.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : viewMode === "vacation" ? (
        <VacationView balances={vacationBalances} />
      ) : (
        <AllCodesView balances={codeBalances} />
      )}
    </div>
  );
}

// ============================================================
// VACATION VIEW (detailed per employee)
// ============================================================

function VacationView({ balances }: { balances: BalanceRow[] }) {
  if (balances.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-4">Aucune donnee.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Employe
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">
                Anciennete
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">
                Semaines
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">
                <ShoppingBag className="w-3 h-3 inline" /> Achetee
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">
                <Clock className="w-3 h-3 inline" /> H/sem
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Droit total
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Utilise
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Solde
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {balances.map((row) => {
              const balanceClass =
                row.balanceMinutes < 0
                  ? "text-red-600 font-bold"
                  : row.balanceMinutes <= 480 // <= 8h
                  ? "text-amber-600 font-semibold"
                  : "text-emerald-600 font-semibold";

              return (
                <tr key={row.employeeId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {row.employeeName}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                    {row.seniorityYears} an{row.seniorityYears > 1 ? "s" : ""}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      {row.weeksEntitled} sem.
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {row.boughtVacation ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        +1 sem
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600 text-center">
                    {row.weeklyHours.toFixed(1)}h
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                    {formatHoursMinutes(row.totalHoursEntitled * 60)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">
                    {formatHoursMinutes(row.totalMinutesUsed)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right ${balanceClass}`}>
                    {formatHoursMinutes(row.balanceMinutes)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs text-slate-500">
          <strong>Formule :</strong> Droit = (Semaines par anciennete + Semaine
          achetee) × Heures hebdomadaires. Solde = Droit − Consomme (depuis
          year_calendar).
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ALL CODES VIEW
// ============================================================

function AllCodesView({ balances }: { balances: CodeBalanceRow[] }) {
  if (balances.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-4">
          Aucun droit ou consommation enregistre.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Employe
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Code absence
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">
                Unite
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Droit
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Utilise
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                Solde
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {balances.map((row, idx) => {
              const isNegative = row.balance < 0;
              const isLow =
                row.timeUnit === "HOURS_MINUTES"
                  ? row.balance > 0 && row.balance <= 480
                  : row.balance > 0 && row.balance <= 1;

              const balanceClass = isNegative
                ? "text-red-600 font-bold"
                : isLow
                ? "text-amber-600 font-semibold"
                : "text-emerald-600 font-semibold";

              const formatValue = (val: number) =>
                row.timeUnit === "HOURS_MINUTES"
                  ? formatHoursMinutes(val)
                  : `${val} j`;

              return (
                <tr key={`${row.employeeId}-${row.codeId}-${idx}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {row.employeeName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">
                      {row.code}
                    </span>
                    {row.codeDescription}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 text-center">
                    {row.timeUnit === "HOURS_MINUTES" ? "H/Min" : "Jours"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                    {formatValue(row.entitled)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">
                    {formatValue(row.used)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right ${balanceClass}`}>
                    {formatValue(row.balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
