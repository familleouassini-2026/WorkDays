"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  TrendingUp,
  TreePalm,
  Timer,
  AlertCircle,
  Car,
  Pencil,
  CalendarDays,
  PlusCircle,
  User,
  ChevronDown,
  ChevronUp,
  Calculator,
  Award,
} from "lucide-react";
import {
  calculateSeniorityYears,
  findBaseSalary,
  calculateFullSalary,
  formatHoursMinutes,
} from "@/lib/calculations";

// ---------- TYPES ----------

interface Employee {
  id: number;
  title: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile_phone: string | null;
  business_phone: string | null;
  home_phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  province: string | null;
  country: string | null;
  job_title: string | null;
  contract_type: string | null;
  date_of_hire: string | null;
  end_date: string | null;
  date_of_birth: string | null;
  is_inactive: boolean;
  nationality: string | null;
  national_registration: string | null;
  inami_number: string | null;
  iban: string | null;
  bic: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  distance_to_home: number | null;
  sector_id: number | null;
  location_id: number | null;
  notes: string | null;
  sectors?: { name: string } | null;
  locations?: { name: string } | null;
}

interface Timesheet {
  id: number;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  saturday_minutes: number | null;
  sunday_minutes: number | null;
  full_time_minutes: number;
}

interface AbsenceRow {
  absence_date: string;
  absence_days: number | null;
  absence_minutes: number | null;
  absence_codes: { code: string; description: string; color_hex: string; text_color_hex: string } | null;
}

interface VacationRight {
  days: number | null;
  hours: number | null;
  minutes: number | null;
  absence_code_id: number;
  absence_codes: { code: string; description: string } | null;
}

interface AssetAssignment {
  start_date: string;
  end_date: string | null;
  assets: { type: string; name: string; identifier: string; status: string } | null;
}

interface EmployeeIndexation {
  id: number;
  amount: number;
  effective_date: string;
  description: string | null;
}

interface AbsenceSummaryRow {
  code: string;
  description: string;
  color_hex: string;
  text_color_hex: string;
  days_entitled: number;
  hours_entitled: number;
  minutes_entitled: number;
  days_taken: number;
  minutes_taken: number;
}

// ---------- HELPERS ----------

function formatDate(d: string | null) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("fr-BE");
}

function minutesToHM(m: number | null) {
  if (!m) return "\u2014";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

function seniorityBadge(hireDate: string | null, grantedDate: string | null) {
  const start = grantedDate || hireDate;
  if (!start) return null;
  const diff = Date.now() - new Date(start).getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return years;
}

// ---------- PAGE ----------

export default function EmployeeProfilePage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [recentAbsences, setRecentAbsences] = useState<AbsenceRow[]>([]);
  const [vacationRights, setVacationRights] = useState<VacationRight[]>([]);
  const [vacationUsed, setVacationUsed] = useState(0);
  const [rttTotal, setRttTotal] = useState<number | null>(null);
  const [salary, setSalary] = useState<number | null>(null);
  const [assets, setAssets] = useState<AssetAssignment[]>([]);
  const [indexations, setIndexations] = useState<EmployeeIndexation[]>([]);
  const [absenceSummary, setAbsenceSummary] = useState<AbsenceSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Expandable sections state
  const [seniorityOpen, setSeniorityOpen] = useState(false);
  const [augmentationsOpen, setAugmentationsOpen] = useState(false);
  const [absenceSummaryOpen, setAbsenceSummaryOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const empId = params.id;
      const currentYear = new Date().getFullYear();

      // Fetch employee
      const { data: emp } = await supabase
        .from("employees")
        .select("*, sectors(name), locations(name)")
        .eq("id", empId)
        .single();
      if (emp) setEmployee(emp);

      // Fetch active timesheet
      const { data: ts } = await supabase
        .from("timesheets")
        .select("*")
        .eq("employee_id", empId)
        .eq("is_active", true)
        .single();
      if (ts) setTimesheet(ts);

      // Fetch recent absences (last 3)
      const { data: absences } = await supabase
        .from("year_calendar")
        .select("absence_date, absence_days, absence_minutes, absence_codes(code, description, color_hex, text_color_hex)")
        .eq("employee_id", empId)
        .order("absence_date", { ascending: false })
        .limit(3);
      if (absences) setRecentAbsences(absences as unknown as AbsenceRow[]);

      // Fetch vacation rights for current year
      const { data: rights } = await supabase
        .from("vacation_rights")
        .select("days, hours, minutes, absence_code_id, absence_codes(code, description)")
        .eq("employee_id", empId)
        .eq("year", currentYear);
      if (rights) setVacationRights(rights as unknown as VacationRight[]);

      // Fetch vacation used (code "V") for current year
      const { data: usedData } = await supabase
        .from("year_calendar")
        .select("absence_days, absence_codes!inner(code)")
        .eq("employee_id", empId)
        .eq("year", currentYear)
        .eq("absence_codes.code", "V");
      if (usedData) {
        const totalUsed = usedData.reduce((sum, r) => sum + (r.absence_days || 0), 0);
        setVacationUsed(totalUsed);
      }

      // Fetch RTT hours for current year (code "RTT")
      const { data: rttData } = await supabase
        .from("year_calendar")
        .select("absence_minutes, absence_codes!inner(code)")
        .eq("employee_id", empId)
        .eq("year", currentYear)
        .eq("absence_codes.code", "RTT");
      if (rttData) {
        const totalRttMin = rttData.reduce((sum, r) => sum + (r.absence_minutes || 0), 0);
        setRttTotal(totalRttMin);
      }

      // Fetch salary data
      if (emp && emp.sector_id) {
        const seniorityYears = calculateSeniorityYears(
          emp.date_of_hire,
          emp.granted_seniority,
          emp.granted_seniority_date
        );

        const { data: scales } = await supabase
          .from("seniority_scales")
          .select("*")
          .eq("sector_id", emp.sector_id);

        const { data: orgIdx } = await supabase
          .from("org_indexations")
          .select("id, indexation_value:factor, indexation_date:effective_date");

        const { data: secIdx } = await supabase
          .from("sector_indexations")
          .select("id, indexation_value:factor, indexation_date:effective_date")
          .eq("sector_id", emp.sector_id);

        const { data: empIdx } = await supabase
          .from("employee_indexations")
          .select("id, employee_id, indexation_value:amount, indexation_date:effective_date")
          .eq("employee_id", empId);

        if (scales && scales.length > 0) {
          const baseSalary = findBaseSalary(emp.sector_id, seniorityYears, scales);
          if (baseSalary) {
            const result = calculateFullSalary({
              baseSalary,
              orgIndexations: orgIdx || [],
              sectorIndexations: secIdx || [],
              personalIncreases: empIdx || [],
            });
            setSalary(result.totalSalary);
          }
        }
      }

      // Fetch asset assignments
      const { data: assetData } = await supabase
        .from("asset_assignments")
        .select("start_date, end_date, assets(type, name, identifier, status)")
        .eq("employee_id", empId)
        .is("end_date", null);
      if (assetData) setAssets(assetData as unknown as AssetAssignment[]);

      // Fetch employee indexations (augmentations)
      const { data: empIndexations } = await supabase
        .from("employee_indexations")
        .select("id, amount, effective_date, description")
        .eq("employee_id", empId)
        .order("effective_date", { ascending: false });
      if (empIndexations) setIndexations(empIndexations as EmployeeIndexation[]);

      // Fetch absence summary: vacation_rights + year_calendar usage for current year
      const { data: allRights } = await supabase
        .from("vacation_rights")
        .select("days, hours, minutes, absence_code_id, absence_codes(id, code, description, color_hex, text_color_hex)")
        .eq("employee_id", empId)
        .eq("year", currentYear);

      const { data: allUsage } = await supabase
        .from("year_calendar")
        .select("absence_days, absence_minutes, absence_code_id, absence_codes(id, code, description, color_hex, text_color_hex)")
        .eq("employee_id", empId)
        .eq("year", currentYear);

      if (allRights || allUsage) {
        const summaryMap: Record<number, AbsenceSummaryRow> = {};

        // Build from rights
        if (allRights) {
          for (const r of allRights as unknown as Array<{ days: number | null; hours: number | null; minutes: number | null; absence_code_id: number; absence_codes: { id: number; code: string; description: string; color_hex: string; text_color_hex: string } | null }>) {
            if (!r.absence_codes) continue;
            const codeId = r.absence_code_id;
            if (!summaryMap[codeId]) {
              summaryMap[codeId] = {
                code: r.absence_codes.code,
                description: r.absence_codes.description,
                color_hex: r.absence_codes.color_hex,
                text_color_hex: r.absence_codes.text_color_hex,
                days_entitled: 0,
                hours_entitled: 0,
                minutes_entitled: 0,
                days_taken: 0,
                minutes_taken: 0,
              };
            }
            summaryMap[codeId].days_entitled += r.days || 0;
            summaryMap[codeId].hours_entitled += r.hours || 0;
            summaryMap[codeId].minutes_entitled += r.minutes || 0;
          }
        }

        // Add usage
        if (allUsage) {
          for (const u of allUsage as unknown as Array<{ absence_days: number | null; absence_minutes: number | null; absence_code_id: number; absence_codes: { id: number; code: string; description: string; color_hex: string; text_color_hex: string } | null }>) {
            if (!u.absence_codes) continue;
            const codeId = u.absence_code_id;
            if (!summaryMap[codeId]) {
              summaryMap[codeId] = {
                code: u.absence_codes.code,
                description: u.absence_codes.description,
                color_hex: u.absence_codes.color_hex,
                text_color_hex: u.absence_codes.text_color_hex,
                days_entitled: 0,
                hours_entitled: 0,
                minutes_entitled: 0,
                days_taken: 0,
                minutes_taken: 0,
              };
            }
            summaryMap[codeId].days_taken += u.absence_days || 0;
            summaryMap[codeId].minutes_taken += u.absence_minutes || 0;
          }
        }

        setAbsenceSummary(Object.values(summaryMap));
      }

      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Employ&eacute; non trouv&eacute;.</p>
        <Link href="/employees" className="text-blue-600 hover:underline mt-2 inline-block">
          Retour &agrave; la liste
        </Link>
      </div>
    );
  }

  const seniorityYears = seniorityBadge(employee.date_of_hire, employee.granted_seniority_date);

  const totalMinutes = timesheet
    ? (timesheet.monday_minutes || 0) +
      (timesheet.tuesday_minutes || 0) +
      (timesheet.wednesday_minutes || 0) +
      (timesheet.thursday_minutes || 0) +
      (timesheet.friday_minutes || 0) +
      (timesheet.saturday_minutes || 0) +
      (timesheet.sunday_minutes || 0)
    : 0;

  const pctFullTime = timesheet
    ? Math.round((totalMinutes / timesheet.full_time_minutes) * 100)
    : null;

  // Vacation data
  const vacRight = vacationRights.find((r) => r.absence_codes?.code === "V");
  const vacTotal = vacRight?.days || 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/employees" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Retour au personnel
      </Link>

      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-blue-700">
              {employee.first_name[0]}{employee.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {employee.first_name} {employee.last_name}
              </h1>
              {seniorityYears !== null && seniorityYears > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {seniorityYears} an{seniorityYears > 1 ? "s" : ""}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${employee.is_inactive ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                {employee.is_inactive ? "Inactif" : "Actif"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {employee.job_title || "\u2014"} &bull; {employee.sectors?.name || "Pas de secteur"}
            </p>
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Contrat */}
        <Link
          href={`/employees/${employee.id}/edit`}
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-700">Contrat</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Type</span>
              <span className="font-medium text-slate-900">{employee.contract_type || "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">R&ocirc;le</span>
              <span className="font-medium text-slate-900">{employee.job_title || "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Site</span>
              <span className="font-medium text-slate-900">{employee.locations?.name || "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">% Temps</span>
              <span className="font-medium text-slate-900">{pctFullTime ? `${pctFullTime}%` : "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entr&eacute;e</span>
              <span className="font-medium text-slate-900">{formatDate(employee.date_of_hire)}</span>
            </div>
          </div>
        </Link>

        {/* Card Salaire */}
        <Link
          href="/remuneration/simulateur"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-semibold text-slate-700">Salaire</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {salary ? `${salary.toFixed(2)} \u20AC` : "\u2014"}
            </span>
            <span className="text-xs text-slate-500">/mois brut index&eacute;</span>
          </div>
          {!salary && (
            <p className="text-xs text-slate-400 mt-2">Bar&egrave;me non configur&eacute; pour ce secteur</p>
          )}
        </Link>

        {/* Card Conges */}
        <Link
          href="/absences/balances"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-3">
            <TreePalm className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-700">Cong&eacute;s (V)</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {vacTotal > 0 ? vacTotal - vacationUsed : "\u2014"}
            </span>
            <span className="text-sm text-slate-500">/ {vacTotal} jours restants</span>
          </div>
          {vacTotal > 0 && (
            <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5">
              <div
                className="bg-amber-500 h-2.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, (vacationUsed / vacTotal) * 100)}%` }}
              />
            </div>
          )}
          {vacTotal === 0 && (
            <p className="text-xs text-slate-400 mt-2">Aucun droit configur&eacute; pour cette ann&eacute;e</p>
          )}
        </Link>

        {/* Card RTT */}
        <Link
          href="/schedules/rtt"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-700">RTT ({new Date().getFullYear()})</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {rttTotal !== null ? formatHoursMinutes(rttTotal) : "\u2014"}
            </span>
            <span className="text-xs text-slate-500">utilis&eacute;es</span>
          </div>
        </Link>

        {/* Card Absences recentes */}
        <Link
          href="/absences/annual"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-slate-700">Absences r&eacute;centes</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {recentAbsences.length > 0 ? (
            <div className="space-y-2">
              {recentAbsences.map((abs, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="inline-block w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: abs.absence_codes?.color_hex || "#94a3b8" }}
                  />
                  <span className="text-slate-500">{formatDate(abs.absence_date)}</span>
                  <span className="font-medium text-slate-700 truncate">
                    {abs.absence_codes?.description || abs.absence_codes?.code || "\u2014"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Aucune absence enregistr&eacute;e</p>
          )}
        </Link>

        {/* Card Actifs assignes */}
        <Link
          href="/assets"
          className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-slate-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">Actifs assign&eacute;s</h3>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {assets.length > 0 ? (
            <div className="space-y-2">
              {assets.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-600 uppercase">
                    {a.assets?.type || "?"}
                  </span>
                  <span className="font-medium text-slate-700 truncate">{a.assets?.name}</span>
                  <span className="text-slate-400 text-xs">{a.assets?.identifier}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Aucun actif assign&eacute;</p>
          )}
        </Link>
      </div>

      {/* ===== EXPANDABLE SECTIONS ===== */}
      <div className="space-y-3">
        {/* Anciennete */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setSeniorityOpen(!seniorityOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-700">Anciennet&eacute;</h3>
            </div>
            {seniorityOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {seniorityOpen && (
            <div className="px-4 pb-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                <div className="flex justify-between sm:flex-col sm:gap-0.5">
                  <span className="text-slate-500">Date d&apos;entr&eacute;e</span>
                  <span className="font-medium text-slate-900">{formatDate(employee.date_of_hire)}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:gap-0.5">
                  <span className="text-slate-500">Anciennet&eacute; accord&eacute;e</span>
                  <span className="font-medium text-slate-900">
                    {employee.granted_seniority != null ? `${employee.granted_seniority} an${employee.granted_seniority > 1 ? "s" : ""}` : "Aucune"}
                  </span>
                </div>
                <div className="flex justify-between sm:flex-col sm:gap-0.5">
                  <span className="text-slate-500">Date accord&eacute;e</span>
                  <span className="font-medium text-slate-900">{formatDate(employee.granted_seniority_date)}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:gap-0.5">
                  <span className="text-slate-500">Anciennet&eacute; acquise (calcul&eacute;e)</span>
                  <span className="font-medium text-slate-900">
                    {(() => {
                      const years = calculateSeniorityYears(
                        employee.date_of_hire,
                        employee.granted_seniority,
                        employee.granted_seniority_date
                      );
                      return `${years} an${years > 1 ? "s" : ""}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between sm:flex-col sm:gap-0.5">
                  <span className="text-slate-500">Date effective de d&eacute;but</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(employee.granted_seniority_date || employee.date_of_hire)}
                  </span>
                </div>
                <div className="flex justify-between sm:flex-col sm:gap-0.5">
                  <span className="text-slate-500">Situation actuelle</span>
                  <span className="font-medium text-slate-900">
                    {employee.is_inactive ? "Inactif" : "Actif"}
                    {employee.end_date ? ` (fin: ${formatDate(employee.end_date)})` : ""}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Augmentations */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setAugmentationsOpen(!augmentationsOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-slate-700">Augmentations</h3>
              {indexations.length > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  {indexations.length}
                </span>
              )}
            </div>
            {augmentationsOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {augmentationsOpen && (
            <div className="px-4 pb-4 border-t border-slate-100">
              {indexations.length > 0 ? (
                <div className="mt-3">
                  <div className="space-y-2">
                    {indexations.map((idx) => (
                      <div key={idx.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700">
                            +{idx.amount.toFixed(2)} &euro;
                          </span>
                          {idx.description && (
                            <span className="text-xs text-slate-400">{idx.description}</span>
                          )}
                        </div>
                        <span className="text-slate-500 text-xs">{formatDate(idx.effective_date)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">Total cumul&eacute;</span>
                    <span className="text-sm font-bold text-green-700">
                      +{indexations.reduce((sum, idx) => sum + idx.amount, 0).toFixed(2)} &euro;
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-3">Aucune augmentation personnelle enregistr&eacute;e</p>
              )}
            </div>
          )}
        </div>

        {/* Absences Sommaire */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setAbsenceSummaryOpen(!absenceSummaryOpen)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-slate-700">Absences Sommaire ({new Date().getFullYear()})</h3>
            </div>
            {absenceSummaryOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {absenceSummaryOpen && (
            <div className="px-4 pb-4 border-t border-slate-100">
              {absenceSummary.length > 0 ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 pr-2 font-semibold text-slate-600">Code</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-600">J. acquis</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-600">J. pris</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-600">Diff J.</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-600">H. acquises</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-600">H. prises</th>
                        <th className="text-right py-2 pl-2 font-semibold text-slate-600">Diff H.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absenceSummary.map((row) => {
                        const totalEntitledMinutes = (row.hours_entitled * 60) + row.minutes_entitled;
                        const diffDays = row.days_entitled - row.days_taken;
                        const diffMinutes = totalEntitledMinutes - row.minutes_taken;
                        return (
                          <tr key={row.code} className="border-b border-slate-50 last:border-0">
                            <td className="py-2 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
                                  style={{ backgroundColor: row.color_hex || "#94a3b8" }}
                                />
                                <span className="font-medium text-slate-700" title={row.description}>
                                  {row.code}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-2 px-2 text-slate-600">{row.days_entitled || "-"}</td>
                            <td className="text-right py-2 px-2 text-slate-600">{row.days_taken || "-"}</td>
                            <td className={`text-right py-2 px-2 font-medium ${diffDays < 0 ? "text-red-600" : "text-slate-700"}`}>
                              {row.days_entitled > 0 || row.days_taken > 0 ? diffDays : "-"}
                            </td>
                            <td className="text-right py-2 px-2 text-slate-600">
                              {totalEntitledMinutes > 0 ? formatHoursMinutes(totalEntitledMinutes) : "-"}
                            </td>
                            <td className="text-right py-2 px-2 text-slate-600">
                              {row.minutes_taken > 0 ? formatHoursMinutes(row.minutes_taken) : "-"}
                            </td>
                            <td className={`text-right py-2 pl-2 font-medium ${diffMinutes < 0 ? "text-red-600" : "text-slate-700"}`}>
                              {totalEntitledMinutes > 0 || row.minutes_taken > 0 ? formatHoursMinutes(diffMinutes) : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-3">Aucune donn&eacute;e d&apos;absence pour cette ann&eacute;e</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== DETAILS SECTION ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-500" /> Contact
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700">{employee.email || "\u2014"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700">{employee.business_phone || "\u2014"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700">{employee.mobile_phone || "\u2014"}</span>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" /> Adresse
          </h3>
          <div className="space-y-1 text-sm text-slate-700">
            <p>{employee.address || "\u2014"}</p>
            <p>{[employee.postal_code, employee.city].filter(Boolean).join(" ") || "\u2014"}</p>
            {employee.province && <p>{employee.province}</p>}
          </div>
        </div>

        {/* Horaire semaine */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" /> Horaire hebdomadaire
          </h3>
          {timesheet ? (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {[
                  { label: "Lu", val: timesheet.monday_minutes },
                  { label: "Ma", val: timesheet.tuesday_minutes },
                  { label: "Me", val: timesheet.wednesday_minutes },
                  { label: "Je", val: timesheet.thursday_minutes },
                  { label: "Ve", val: timesheet.friday_minutes },
                  { label: "Sa", val: timesheet.saturday_minutes },
                  { label: "Di", val: timesheet.sunday_minutes },
                ].map((day) => (
                  <div key={day.label} className="text-center bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 font-medium">{day.label}</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{minutesToHM(day.val)}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Total : <strong className="text-slate-700">{minutesToHM(totalMinutes)}</strong>/sem
                {pctFullTime && <> &bull; <strong className="text-blue-600">{pctFullTime}%</strong></>}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Aucun horaire d&eacute;fini</p>
          )}
        </div>

        {/* Notes */}
        {employee.notes && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" /> Notes
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{employee.notes}</p>
          </div>
        )}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/absences/new?employee=${employee.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Encoder absence
        </Link>
        <Link
          href="/absences/annual"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <CalendarDays className="w-4 h-4" /> Calendrier annuel
        </Link>
        <Link
          href="/remuneration/simulateur"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Calculator className="w-4 h-4" /> Simulateur salaire
        </Link>
        <Link
          href={`/employees/${employee.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Pencil className="w-4 h-4" /> &Eacute;diter
        </Link>
      </div>
    </div>
  );
}
