"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, ChevronDown, ChevronUp, Users } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  sector_id: number | null;
  date_of_hire: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  sectors: { name: string } | null;
}

interface SeniorityScale {
  id: number;
  sector_id: number;
  years: number;
  base_salary: number;
}

interface OrgIndexation {
  id: number;
  indexation_value: number;
}

interface SectorIndexation {
  id: number;
  sector_id: number;
  indexation_value: number;
}

interface EmployeeIndexation {
  id: number;
  employee_id: number;
  indexation_value: number;
}

interface AlertData {
  employee: Employee;
  seniorityMonths: number;
  seniorityYears: number;
  previousBaseSalary: number;
  currentBaseSalary: number;
  previousIndexedSalary: number;
  currentIndexedSalary: number;
  difference: number;
}

interface EmployeeRow {
  employee: Employee;
  seniorityMonths: number;
  seniorityYears: number;
  currentBaseSalary: number;
  currentIndexedSalary: number;
  hasAlert: boolean;
}

function calculateSeniorityMonths(employee: Employee): number {
  const refDate = employee.granted_seniority_date || employee.date_of_hire;
  if (!refDate) return 0;
  const start = new Date(refDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  // Add granted seniority (in years → months)
  const grantedMonths = (employee.granted_seniority || 0) * 12;
  return Math.max(0, months + grantedMonths);
}

function findApplicableScale(
  scales: SeniorityScale[],
  sectorId: number | null,
  seniorityYears: number
): SeniorityScale | null {
  if (!sectorId) return null;
  const sectorScales = scales
    .filter((s) => s.sector_id === sectorId && s.years <= seniorityYears)
    .sort((a, b) => b.years - a.years);
  return sectorScales[0] || null;
}

function calculateIndexedSalary(
  baseSalary: number,
  sectorId: number | null,
  employeeId: number,
  orgIndexations: OrgIndexation[],
  sectorIndexations: SectorIndexation[],
  employeeIndexations: EmployeeIndexation[]
): number {
  // Product of organisation indexations
  const orgFactor = orgIndexations.reduce(
    (acc, idx) => acc * Number(idx.indexation_value),
    1
  );

  // Product of sector indexations for this sector
  const sectorFactor = sectorId
    ? sectorIndexations
        .filter((idx) => idx.sector_id === sectorId)
        .reduce((acc, idx) => acc * Number(idx.indexation_value), 1)
    : 1;

  // Sum of personal indexations for this employee
  const personalSum = employeeIndexations
    .filter((idx) => idx.employee_id === employeeId)
    .reduce((acc, idx) => acc + Number(idx.indexation_value), 0);

  return baseSalary * orgFactor * sectorFactor + personalSum;
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [allRows, setAllRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [empRes, scalesRes, orgIdxRes, secIdxRes, empIdxRes] =
        await Promise.all([
          supabase
            .from("employees")
            .select(
              "id, first_name, last_name, sector_id, date_of_hire, granted_seniority, granted_seniority_date, sectors(name)"
            )
            .eq("is_inactive", false)
            .order("last_name"),
          supabase
            .from("seniority_scales")
            .select("id, sector_id, years, base_salary")
            .order("years"),
          supabase
            .from("organisation_indexations")
            .select("id, indexation_value"),
          supabase
            .from("sector_indexations")
            .select("id, sector_id, indexation_value"),
          supabase
            .from("employee_indexations")
            .select("id, employee_id, indexation_value"),
        ]);

      const employees = (empRes.data || []) as unknown as Employee[];
      const scales = (scalesRes.data || []) as SeniorityScale[];
      const orgIndexations = (orgIdxRes.data || []) as OrgIndexation[];
      const sectorIndexations = (secIdxRes.data || []) as SectorIndexation[];
      const employeeIndexations = (empIdxRes.data || []) as EmployeeIndexation[];

      const alertsList: AlertData[] = [];
      const rowsList: EmployeeRow[] = [];

      for (const emp of employees) {
        const seniorityMonths = calculateSeniorityMonths(emp);
        const seniorityYears = Math.floor(seniorityMonths / 12);
        const previousYears = seniorityYears - 1;

        const currentScale = findApplicableScale(
          scales,
          emp.sector_id,
          seniorityYears
        );
        const previousScale = findApplicableScale(
          scales,
          emp.sector_id,
          previousYears
        );

        const currentBase = currentScale
          ? Number(currentScale.base_salary)
          : 0;
        const previousBase = previousScale
          ? Number(previousScale.base_salary)
          : 0;

        const currentIndexed = currentBase
          ? calculateIndexedSalary(
              currentBase,
              emp.sector_id,
              emp.id,
              orgIndexations,
              sectorIndexations,
              employeeIndexations
            )
          : 0;

        const previousIndexed = previousBase
          ? calculateIndexedSalary(
              previousBase,
              emp.sector_id,
              emp.id,
              orgIndexations,
              sectorIndexations,
              employeeIndexations
            )
          : 0;

        const hasAlert =
          currentBase !== previousBase && currentBase > 0 && previousBase > 0;

        if (hasAlert) {
          alertsList.push({
            employee: emp,
            seniorityMonths,
            seniorityYears,
            previousBaseSalary: previousBase,
            currentBaseSalary: currentBase,
            previousIndexedSalary: previousIndexed,
            currentIndexedSalary: currentIndexed,
            difference: currentIndexed - previousIndexed,
          });
        }

        rowsList.push({
          employee: emp,
          seniorityMonths,
          seniorityYears,
          currentBaseSalary: currentBase,
          currentIndexedSalary: currentIndexed,
          hasAlert,
        });
      }

      setAlerts(alertsList);
      setAllRows(rowsList);
      setLoading(false);
    }

    fetchData();
  }, []);

  function toggleAlert(employeeId: number) {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 mt-4">Chargement des alertes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Alertes &mdash; Augmentations salariales
        </h1>
        <p className="text-slate-500 mt-1">
          Detection des employes dont l&apos;anciennete atteint un nouveau
          palier cette annee
        </p>
      </div>

      {/* Section 1: Active Alerts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Alertes actives ({alerts.length})
          </h2>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-sm text-green-800">
              Aucune alerte active. Tous les employes sont au meme palier que
              l&apos;annee precedente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isExpanded = expandedAlerts.has(alert.employee.id);
              return (
                <div
                  key={alert.employee.id}
                  className="bg-orange-50 border border-orange-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleAlert(alert.employee.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {alert.employee.last_name},{" "}
                          {alert.employee.first_name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {alert.employee.sectors?.name || "Sans secteur"} —{" "}
                          {alert.seniorityYears} an
                          {alert.seniorityYears > 1 ? "s" : ""}{" "}
                          d&apos;anciennete
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-orange-700">
                        +
                        {alert.difference.toLocaleString("fr-BE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 border-t border-orange-200 bg-white/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <p className="text-xs text-slate-500 font-medium uppercase mb-2">
                            Annee precedente
                          </p>
                          <p className="text-sm text-slate-600">
                            Base :{" "}
                            {alert.previousBaseSalary.toLocaleString("fr-BE", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            Indexe :{" "}
                            {alert.previousIndexedSalary.toLocaleString(
                              "fr-BE",
                              { style: "currency", currency: "EUR" }
                            )}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <p className="text-xs text-orange-600 font-medium uppercase mb-2">
                            Annee courante
                          </p>
                          <p className="text-sm text-slate-600">
                            Base :{" "}
                            {alert.currentBaseSalary.toLocaleString("fr-BE", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </p>
                          <p className="text-sm font-semibold text-orange-900 mt-1">
                            Indexe :{" "}
                            {alert.currentIndexedSalary.toLocaleString(
                              "fr-BE",
                              { style: "currency", currency: "EUR" }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: All Employees Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Tous les employes ({allRows.length})
          </h2>
        </div>

        {allRows.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4">Aucun employe trouve.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Employe
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Secteur
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Anciennete
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Salaire base
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Salaire indexe
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                      Alerte
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allRows.map((row) => (
                    <tr
                      key={row.employee.id}
                      className={`hover:bg-slate-50 ${
                        row.hasAlert ? "bg-orange-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                        {row.employee.last_name}, {row.employee.first_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {row.employee.sectors?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-right">
                        {row.seniorityYears} an
                        {row.seniorityYears > 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right">
                        {row.currentBaseSalary > 0
                          ? row.currentBaseSalary.toLocaleString("fr-BE", {
                              style: "currency",
                              currency: "EUR",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium text-right">
                        {row.currentIndexedSalary > 0
                          ? row.currentIndexedSalary.toLocaleString("fr-BE", {
                              style: "currency",
                              currency: "EUR",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.hasAlert ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Nouveau palier
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
