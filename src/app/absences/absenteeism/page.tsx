"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertTriangle,
  Shield,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import {
  ABSENTEEISM_EXCLUDED_CODES,
  getAbsenteeismWindowStart,
  getAbsenteeismAlertLevel,
  formatHoursMinutes,
} from "@/lib/calculations";

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
}

interface AbsenceIncident {
  id: number;
  employee_id: number;
  absence_code_id: number;
  absence_date: string;
  absence_minutes: number | null;
  absence_days: number | null;
  reason: string | null;
}

interface EmployeeSummary {
  employeeId: number;
  employeeName: string;
  incidents: number;
  totalMinutes: number;
  totalDays: number;
  alertLevel: "ok" | "warning" | "danger";
  alertLabel: string;
  details: IncidentDetail[];
}

interface IncidentDetail {
  date: string;
  code: string;
  codeDescription: string;
  codeColor: string | null;
  reason: string | null;
  duration: string;
  expires: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AbsenteeismPolicyPage() {
  const [summaries, setSummaries] = useState<EmployeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEmployee, setExpandedEmployee] = useState<number | null>(null);
  const [filterLevel, setFilterLevel] = useState<"all" | "warning" | "danger">("all");
  const [windowMonths, setWindowMonths] = useState(6);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const now = new Date();
      const windowStart = new Date(now);
      windowStart.setMonth(windowStart.getMonth() - windowMonths);

      const windowStartStr = windowStart.toISOString().split("T")[0];
      const nowStr = now.toISOString().split("T")[0];

      // Fetch employees, absence codes, and year_calendar entries in the window
      const [empRes, codesRes, calendarRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase.from("absence_codes").select("id, code, description, color_hex"),
        supabase
          .from("year_calendar")
          .select("id, employee_id, absence_code_id, absence_date, absence_minutes, absence_days, reason")
          .gte("absence_date", windowStartStr)
          .lte("absence_date", nowStr),
      ]);

      const employees = (empRes.data || []) as Employee[];
      const codes = (codesRes.data || []) as AbsenceCode[];
      const calendar = (calendarRes.data || []) as AbsenceIncident[];

      // Build code lookup and exclusion set
      const codeMap = new Map(codes.map((c) => [c.id, c]));
      const excludedCodeIds = new Set(
        codes
          .filter((c) => ABSENTEEISM_EXCLUDED_CODES.includes(c.code))
          .map((c) => c.id)
      );

      // Filter calendar: exclude vacation-type codes
      const relevantEntries = calendar.filter(
        (entry) => !excludedCodeIds.has(entry.absence_code_id)
      );

      // Group by employee
      const employeeMap = new Map<number, AbsenceIncident[]>();
      for (const entry of relevantEntries) {
        if (!employeeMap.has(entry.employee_id)) {
          employeeMap.set(entry.employee_id, []);
        }
        employeeMap.get(entry.employee_id)!.push(entry);
      }

      // Build summaries
      const results: EmployeeSummary[] = [];
      for (const emp of employees) {
        const empEntries = employeeMap.get(emp.id) || [];

        // Count distinct absence dates as "incidents"
        const uniqueDates = new Set(empEntries.map((e) => e.absence_date));
        const incidents = uniqueDates.size;

        const totalMinutes = empEntries.reduce(
          (sum, e) => sum + (e.absence_minutes || 0),
          0
        );
        const totalDays = empEntries.reduce(
          (sum, e) => sum + (e.absence_days || 0),
          0
        );

        const { level, label } = getAbsenteeismAlertLevel(incidents);

        // Build detail rows
        const details: IncidentDetail[] = empEntries
          .sort((a, b) => a.absence_date.localeCompare(b.absence_date))
          .map((entry) => {
            const code = codeMap.get(entry.absence_code_id);
            const absDate = new Date(entry.absence_date);
            const expiresDate = new Date(absDate);
            expiresDate.setMonth(expiresDate.getMonth() + windowMonths);

            let duration = "";
            if (entry.absence_minutes && entry.absence_minutes > 0) {
              duration = formatHoursMinutes(entry.absence_minutes);
            } else if (entry.absence_days && entry.absence_days > 0) {
              duration = `${entry.absence_days} jour${entry.absence_days > 1 ? "s" : ""}`;
            } else {
              duration = "—";
            }

            return {
              date: entry.absence_date,
              code: code?.code || "?",
              codeDescription: code?.description || "Inconnu",
              codeColor: code?.color_hex || null,
              reason: entry.reason,
              duration,
              expires: expiresDate.toISOString().split("T")[0],
            };
          });

        // Only include employees with at least 1 incident
        if (incidents > 0) {
          results.push({
            employeeId: emp.id,
            employeeName: `${emp.last_name}, ${emp.first_name}`,
            incidents,
            totalMinutes,
            totalDays,
            alertLevel: level,
            alertLabel: label,
            details,
          });
        }
      }

      // Sort: danger first, then warning, then ok; within same level by incidents desc
      results.sort((a, b) => {
        const levelOrder = { danger: 0, warning: 1, ok: 2 };
        const diff = levelOrder[a.alertLevel] - levelOrder[b.alertLevel];
        if (diff !== 0) return diff;
        return b.incidents - a.incidents;
      });

      setSummaries(results);
      setLoading(false);
    }

    fetchData();
  }, [windowMonths]);

  // Filter summaries
  const filteredSummaries = useMemo(() => {
    if (filterLevel === "all") return summaries;
    if (filterLevel === "warning")
      return summaries.filter(
        (s) => s.alertLevel === "warning" || s.alertLevel === "danger"
      );
    return summaries.filter((s) => s.alertLevel === "danger");
  }, [summaries, filterLevel]);

  // Stats
  const stats = useMemo(() => {
    const total = summaries.length;
    const warnings = summaries.filter((s) => s.alertLevel === "warning").length;
    const dangers = summaries.filter((s) => s.alertLevel === "danger").length;
    const totalIncidents = summaries.reduce((sum, s) => sum + s.incidents, 0);
    return { total, warnings, dangers, totalIncidents };
  }, [summaries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Politique d&apos;absenteisme
          </h1>
          <p className="text-slate-500 mt-1">
            Suivi des absences sur {windowMonths} mois glissants — codes
            vacation/formation exclus
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={windowMonths}
            onChange={(e) => setWindowMonths(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value={3}>3 mois</option>
            <option value={6}>6 mois</option>
            <option value={9}>9 mois</option>
            <option value={12}>12 mois</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Employes concernes"
          value={stats.total}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-slate-600" />}
          label="Total incidents"
          value={stats.totalIncidents}
          bg="bg-slate-50"
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
          label="Attention (2-3)"
          value={stats.warnings}
          bg="bg-amber-50"
        />
        <StatCard
          icon={<Shield className="w-5 h-5 text-red-600" />}
          label="Critique (4+)"
          value={stats.dangers}
          bg="bg-red-50"
        />
      </div>

      {/* Excluded codes info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-xs text-slate-600">
          <strong>Codes exclus du comptage :</strong>{" "}
          {ABSENTEEISM_EXCLUDED_CODES.join(", ")}
          {" "}— Seules les absences non-planifiees sont comptabilisees (maladie,
          accident, etc.)
        </p>
        <p className="text-xs text-slate-500 mt-1">
          <strong>Seuils :</strong> Normal = 0-1 incident | Attention = 2-3
          incidents | Critique = 4+ incidents sur la fenetre glissante.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(
            [
              { key: "all", label: "Tous" },
              { key: "warning", label: "Attention+" },
              { key: "danger", label: "Critique" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterLevel(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filterLevel === opt.key
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 ml-2">
          {filteredSummaries.length} employe{filteredSummaries.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Main table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : filteredSummaries.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Shield className="w-12 h-12 text-emerald-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucun incident d&apos;absenteisme sur cette periode.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSummaries.map((summary) => (
            <EmployeeRow
              key={summary.employeeId}
              summary={summary}
              isExpanded={expandedEmployee === summary.employeeId}
              onToggle={() =>
                setExpandedEmployee(
                  expandedEmployee === summary.employeeId
                    ? null
                    : summary.employeeId
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-lg border p-4`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function EmployeeRow({
  summary,
  isExpanded,
  onToggle,
}: {
  summary: EmployeeSummary;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const alertColors = {
    ok: "border-l-emerald-400 bg-white",
    warning: "border-l-amber-400 bg-amber-50/30",
    danger: "border-l-red-400 bg-red-50/30",
  };

  const badgeColors = {
    ok: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={`rounded-lg border border-l-4 ${alertColors[summary.alertLevel]} overflow-hidden`}
    >
      {/* Summary row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-900">
            {summary.employeeName}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              badgeColors[summary.alertLevel]
            }`}
          >
            {summary.alertLabel}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-sm font-bold text-slate-900">
              {summary.incidents}
            </span>
            <span className="text-xs text-slate-500 ml-1">
              incident{summary.incidents > 1 ? "s" : ""}
            </span>
          </div>
          {summary.totalMinutes > 0 && (
            <div className="text-right">
              <span className="text-xs text-slate-500">
                {formatHoursMinutes(summary.totalMinutes)} total
              </span>
            </div>
          )}
          {summary.totalDays > 0 && (
            <div className="text-right">
              <span className="text-xs text-slate-500">
                {summary.totalDays} jour{summary.totalDays > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Detail table */}
      {isExpanded && summary.details.length > 0 && (
        <div className="border-t border-slate-200 bg-white">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                  Date
                </th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                  Code
                </th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                  Motif
                </th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">
                  Duree
                </th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">
                  Expire le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.details.map((detail, idx) => {
                const isExpired = new Date(detail.expires) < new Date();
                return (
                  <tr key={idx} className={isExpired ? "opacity-50" : ""}>
                    <td className="px-4 py-2 text-sm text-slate-900">
                      {new Date(detail.date + "T00:00:00").toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: detail.codeColor
                            ? `${detail.codeColor}20`
                            : "#f1f5f9",
                          color: detail.codeColor || "#475569",
                        }}
                      >
                        {detail.code}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {detail.codeDescription}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {detail.reason || "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-900 text-right font-medium">
                      {detail.duration}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      <span
                        className={`text-xs ${
                          isExpired ? "text-slate-400 line-through" : "text-slate-600"
                        }`}
                      >
                        {new Date(detail.expires + "T00:00:00").toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
