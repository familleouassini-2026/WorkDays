"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  UserCircle,
  TreePalm,
  Timer,
  Clock,
  Calendar,
  TrendingUp,
  FileText,
  Download,
  PlusCircle,
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
  first_name: string;
  last_name: string;
  date_of_hire: string | null;
  date_of_birth: string | null;
  sector_id: number | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
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
  absence_codes: { code: string; description: string; color_hex: string } | null;
}

interface VacationRight {
  days: number | null;
  hours: number | null;
  minutes: number | null;
  absence_code_id: number;
  absence_codes: { code: string; description: string } | null;
}

interface DocumentRow {
  id: number;
  name: string;
  file_type: string | null;
  file_size: number | null;
  file_base64: string;
  category: string;
  uploaded_at: string;
}

// ---------- HELPERS ----------

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-BE");
}

function minutesToHM(m: number | null): string {
  if (!m) return "—";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------- PAGE ----------

export default function SelfServicePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // Dashboard data
  const [vacationRights, setVacationRights] = useState<VacationRight[]>([]);
  const [vacationUsedDays, setVacationUsedDays] = useState(0);
  const [rttMinutes, setRttMinutes] = useState<number | null>(null);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [recentAbsences, setRecentAbsences] = useState<AbsenceRow[]>([]);
  const [salary, setSalary] = useState<number | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);

  useEffect(() => {
    async function loadEmployees() {
      const supabase = createClient();
      const { data } = await supabase
        .from("employees")
        .select("id, first_name, last_name, date_of_hire, date_of_birth, sector_id, granted_seniority, granted_seniority_date")
        .eq("is_inactive", false)
        .order("last_name");
      if (data) setEmployees(data);
      setLoading(false);
    }
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadEmployeeData(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function loadEmployeeData(empId: number) {
    setDataLoading(true);
    const supabase = createClient();
    const currentYear = new Date().getFullYear();
    const emp = employees.find((e) => e.id === empId);

    // Fetch vacation rights
    const { data: rights } = await supabase
      .from("vacation_rights")
      .select("days, hours, minutes, absence_code_id, absence_codes(code, description)")
      .eq("employee_id", empId)
      .eq("year", currentYear);
    setVacationRights((rights as unknown as VacationRight[]) || []);

    // Fetch vacation used (CA code)
    const { data: usedData } = await supabase
      .from("year_calendar")
      .select("absence_days, absence_codes!inner(code)")
      .eq("employee_id", empId)
      .eq("year", currentYear)
      .eq("absence_codes.code", "CA");
    const totalUsed = usedData
      ? usedData.reduce((sum, r) => sum + ((r as unknown as { absence_days: number | null }).absence_days || 0), 0)
      : 0;
    setVacationUsedDays(totalUsed);

    // Fetch active timesheet
    const { data: ts } = await supabase
      .from("timesheets")
      .select("*")
      .eq("employee_id", empId)
      .eq("is_active", true)
      .single();
    setTimesheet(ts as Timesheet | null);

    // Calculate RTT
    if (emp && emp.sector_id && emp.date_of_birth) {
      const { data: rttEntitlements } = await supabase
        .from("rtt_entitlements")
        .select("*")
        .eq("sector_id", emp.sector_id);

      if (rttEntitlements && rttEntitlements.length > 0) {
        const birthDate = new Date(emp.date_of_birth);
        const birthMonth = birthDate.getMonth() + 1;
        const ageAtBirthdayThisYear = currentYear - birthDate.getFullYear();
        const ageLastYear = ageAtBirthdayThisYear - 1;

        const findHours = (age: number): number => {
          const match = rttEntitlements
            .filter((r: { seniority_start: number }) => Number(r.seniority_start) <= age)
            .sort((a: { seniority_start: number }, b: { seniority_start: number }) => Number(b.seniority_start) - Number(a.seniority_start))[0];
          return match ? Number(match.hours_per_year) : 0;
        };

        const hrThisYear = findHours(ageAtBirthdayThisYear);
        const hrLastYear = findHours(ageLastYear);

        const firstPortion = (birthMonth - 1) / 12;
        const secondPortion = 1 - firstPortion;
        const totalRTT = firstPortion * hrLastYear + secondPortion * hrThisYear;

        let percentWorkTime = 1;
        if (ts) {
          const totalMin =
            ((ts as Timesheet).monday_minutes || 0) +
            ((ts as Timesheet).tuesday_minutes || 0) +
            ((ts as Timesheet).wednesday_minutes || 0) +
            ((ts as Timesheet).thursday_minutes || 0) +
            ((ts as Timesheet).friday_minutes || 0) +
            ((ts as Timesheet).saturday_minutes || 0) +
            ((ts as Timesheet).sunday_minutes || 0);
          percentWorkTime = totalMin / ((ts as Timesheet).full_time_minutes || 2280);
        }

        const totalRTTAdjusted = Math.round(totalRTT * percentWorkTime * 100) / 100;
        setRttMinutes(totalRTTAdjusted * 60);
      } else {
        setRttMinutes(null);
      }
    } else {
      setRttMinutes(null);
    }

    // Fetch recent absences (last 5)
    const { data: absences } = await supabase
      .from("year_calendar")
      .select("absence_date, absence_days, absence_minutes, absence_codes(code, description, color_hex)")
      .eq("employee_id", empId)
      .order("absence_date", { ascending: false })
      .limit(5);
    setRecentAbsences((absences as unknown as AbsenceRow[]) || []);

    // Calculate salary
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
        .from("organisation_indexations")
        .select("id, indexation_value, indexation_date");

      const { data: secIdx } = await supabase
        .from("sector_indexations")
        .select("id, indexation_value, indexation_date")
        .eq("sector_id", emp.sector_id);

      const { data: empIdx } = await supabase
        .from("employee_indexations")
        .select("id, employee_id, indexation_value, indexation_date")
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
        } else {
          setSalary(null);
        }
      } else {
        setSalary(null);
      }
    } else {
      setSalary(null);
    }

    // Fetch documents
    const { data: docs } = await supabase
      .from("employee_documents")
      .select("id, name, file_type, file_size, file_base64, category, uploaded_at")
      .eq("employee_id", empId)
      .order("uploaded_at", { ascending: false });
    setDocuments((docs as DocumentRow[]) || []);

    setDataLoading(false);
  }

  function handleDownload(doc: DocumentRow) {
    const link = document.createElement("a");
    link.href = doc.file_base64;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Compute vacation balance
  const totalRightsDays = vacationRights.reduce((sum, r) => sum + (r.days || 0), 0);
  const soldeDays = totalRightsDays - vacationUsedDays;

  const selectedEmployee = employees.find((e) => e.id === selectedId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-blue-600" />
          Portail Self-service
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Simulez le portail employe en selectionnant un membre du personnel.
        </p>
      </div>

      {/* Employee selector */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selectionner un employe
        </label>
        <select
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
          className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choisir un employe --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.last_name} {emp.first_name}
            </option>
          ))}
        </select>
      </div>

      {/* Dashboard - only shown when employee is selected */}
      {selectedId && !dataLoading && (
        <div className="space-y-6">
          {/* Welcome banner */}
          {selectedEmployee && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 text-white">
              <h2 className="text-lg font-bold">
                Bonjour, {selectedEmployee.first_name} {selectedEmployee.last_name}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Voici votre tableau de bord personnel.
              </p>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Solde conges */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <TreePalm className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-700">Solde conges</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {totalRightsDays > 0 ? `${soldeDays}` : "—"}
                </span>
                {totalRightsDays > 0 && (
                  <span className="text-xs text-slate-500">jours restants</span>
                )}
              </div>
              {totalRightsDays > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {totalRightsDays} jours de droits - {vacationUsedDays} jours pris
                </p>
              )}
              {totalRightsDays === 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  Aucun droit configure pour cette annee
                </p>
              )}
            </div>

            {/* RTT */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-slate-700">RTT ({new Date().getFullYear()})</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {rttMinutes !== null ? formatHoursMinutes(rttMinutes) : "—"}
                </span>
                {rttMinutes !== null && (
                  <span className="text-xs text-slate-500">heures totales</span>
                )}
              </div>
              {rttMinutes === null && (
                <p className="text-xs text-slate-400 mt-1">
                  Pas de bareme RTT applicable
                </p>
              )}
            </div>

            {/* Salaire */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="text-sm font-semibold text-slate-700">Salaire actuel</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {salary ? `${salary.toFixed(2)} \u20AC` : "—"}
                </span>
                {salary && (
                  <span className="text-xs text-slate-500">/mois brut indexe</span>
                )}
              </div>
              {!salary && (
                <p className="text-xs text-slate-400 mt-1">
                  Bareme non configure
                </p>
              )}
            </div>
          </div>

          {/* Horaire hebdomadaire */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Horaire hebdomadaire
            </h3>
            {timesheet ? (
              <div className="grid grid-cols-7 gap-2">
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
            ) : (
              <p className="text-sm text-slate-400">Aucun horaire defini</p>
            )}
          </div>

          {/* Dernieres absences */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" /> 5 dernieres absences
            </h3>
            {recentAbsences.length > 0 ? (
              <div className="space-y-2">
                {recentAbsences.map((abs, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span
                      className="inline-block w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: abs.absence_codes?.color_hex || "#94a3b8" }}
                    />
                    <span className="text-slate-500 w-20 shrink-0">{formatDate(abs.absence_date)}</span>
                    <span className="font-medium text-slate-700 truncate">
                      {abs.absence_codes?.description || abs.absence_codes?.code || "—"}
                    </span>
                    {abs.absence_days && (
                      <span className="text-xs text-slate-400 ml-auto">{abs.absence_days}j</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Aucune absence enregistree</p>
            )}
          </div>

          {/* Documents personnels */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" /> Documents personnels ({documents.length})
            </h3>
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(doc.file_size)} - {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" /> Telecharger
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Aucun document</p>
            )}
          </div>

          {/* Action button */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/self-service/leave-request"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> Demander un conge
            </Link>
          </div>
        </div>
      )}

      {/* Loading state for data */}
      {selectedId && dataLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
