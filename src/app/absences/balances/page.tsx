"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Clock, Calendar, ShoppingBag, Info, Search, ChevronDown } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"vacation" | "all">("all");

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
          <strong>Droits de cong&eacute;s :</strong> Les droits sont saisis par le gestionnaire dans{" "}
          <code className="bg-blue-100 px-1 rounded">vacation_rights</code> (source : secr&eacute;tariat social). Solde = Droit − Consomm&eacute;.
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
          <strong>Source :</strong> Droits saisis par le gestionnaire (vacation_rights). Solde = Droit − Consomm&eacute; (year_calendar).
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ALL CODES VIEW
// ============================================================

function AllCodesView({ balances }: { balances: CodeBalanceRow[] }) {
  const [search, setSearch] = useState("");
  const [expandedEmp, setExpandedEmp] = useState<number | null>(null);

  if (balances.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-4">Aucun droit ou consommation enregistre.</p>
      </div>
    );
  }

  // Group by employee
  const grouped = new Map<number, { name: string; rows: CodeBalanceRow[] }>();
  for (const row of balances) {
    if (!grouped.has(row.employeeId)) {
      grouped.set(row.employeeId, { name: row.employeeName, rows: [] });
    }
    grouped.get(row.employeeId)!.rows.push(row);
  }

  // Filter by search
  const filtered = search.length >= 2
    ? Array.from(grouped.entries()).filter(([, v]) => v.name.toLowerCase().includes(search.toLowerCase()))
    : Array.from(grouped.entries());

  const formatValue = (val: number, unit: string) =>
    unit === "HOURS_MINUTES" ? formatHoursMinutes(val) : `${val}j`;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Cards per employee */}
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Aucun résultat</p>
      ) : (
        filtered.map(([empId, { name, rows }]) => {
          const isExpanded = expandedEmp === empId;
          const activeRows = rows.filter((r) => r.entitled > 0 || r.used > 0);
          if (activeRows.length === 0) return null;

          return (
            <div key={empId} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedEmp(isExpanded ? null : empId)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-900">{name}</span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {activeRows.slice(0, 5).map((r) => {
                    const bal = r.balance;
                    const color = bal < 0 ? "bg-red-100 text-red-700" : bal === 0 ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700";
                    return (
                      <span key={r.codeId} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${color}`}>
                        {r.code} {formatValue(bal, r.timeUnit)}
                      </span>
                    );
                  })}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">Code absence</th>
                        <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Unité</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">Droit</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">Utilisé</th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">Solde</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeRows.map((r) => {
                        const balanceClass = r.balance < 0 ? "text-red-600 font-bold" : r.balance === 0 ? "text-slate-500" : "text-emerald-600 font-semibold";
                        return (
                          <tr key={r.codeId} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-sm text-slate-700">
                              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">{r.code}</span>
                              {r.codeDescription}
                            </td>
                            <td className="px-3 py-2.5 text-xs text-slate-500 text-center">{r.timeUnit === "HOURS_MINUTES" ? "H/Min" : "Jours"}</td>
                            <td className="px-4 py-2.5 text-sm text-slate-900 text-right font-medium">{formatValue(r.entitled, r.timeUnit)}</td>
                            <td className="px-4 py-2.5 text-sm text-slate-600 text-right">{formatValue(r.used, r.timeUnit)}</td>
                            <td className={`px-4 py-2.5 text-sm text-right ${balanceClass}`}>{formatValue(r.balance, r.timeUnit)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
