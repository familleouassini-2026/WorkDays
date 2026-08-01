"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
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
  const [loading, setLoading] = useState(true);

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
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-700">Contrat</h3>
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
        </div>

        {/* Card Salaire */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="text-sm font-semibold text-slate-700">Salaire</h3>
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
        </div>

        {/* Card Conges */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <TreePalm className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-700">Cong&eacute;s (V)</h3>
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
        </div>

        {/* Card RTT */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-700">RTT ({new Date().getFullYear()})</h3>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {rttTotal !== null ? formatHoursMinutes(rttTotal) : "\u2014"}
            </span>
            <span className="text-xs text-slate-500">utilis&eacute;es</span>
          </div>
        </div>

        {/* Card Absences recentes */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-semibold text-slate-700">Absences r&eacute;centes</h3>
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
        </div>

        {/* Card Actifs assignes */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-700">Actifs assign&eacute;s</h3>
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
          href={`/employees/${employee.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <Pencil className="w-4 h-4" /> &Eacute;diter
        </Link>
      </div>
    </div>
  );
}
