"use client";

import { useEffect, useState, Fragment } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, ChevronDown, ChevronUp, Users } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_hire: string | null;
  granted_seniority_date: string | null;
  sector_id: number | null;
  is_inactive: boolean;
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

interface SalaryAlertResult {
  seniorityStart: string;
  seniorityYears: number;
  seniorityLastYear: number;
  cappedThis: number;
  cappedLast: number;
  baseThis: number;
  baseLast: number;
  totalIndex: number;
  personalTotal: number;
  salaryThis: number;
  salaryLast: number;
  difference: number;
  hasAlert: boolean;
  changeDate: string;
  maxYears: number;
}

interface EmployeeAlert {
  employee: Employee;
  alert: SalaryAlertResult;
}

function calculateSalaryAlert(
  employee: Employee,
  scales: SeniorityScale[],
  orgIndexations: OrgIndexation[],
  sectorIndexations: SectorIndexation[],
  empIndexations: EmployeeIndexation[]
): SalaryAlertResult | null {
  const seniorityStart = employee.granted_seniority_date || employee.date_of_hire;
  if (!seniorityStart) return null;

  const now = new Date();
  const start = new Date(seniorityStart);
  const monthsDiff =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const seniorityYears = Math.floor(monthsDiff / 12);
  const seniorityLastYear = seniorityYears - 1;

  const sectorScales = scales
    .filter((s) => s.sector_id === employee.sector_id)
    .sort((a, b) => b.years - a.years);
  if (sectorScales.length === 0) return null;

  const maxYears = sectorScales[0].years;
  const cappedThis = Math.min(seniorityYears, maxYears);
  const cappedLast = Math.min(seniorityLastYear, maxYears);

  const findBase = (years: number): number => {
    const match = sectorScales
      .filter((s) => s.years <= years)
      .sort((a, b) => b.years - a.years)[0];
    return match ? match.base_salary : sectorScales[sectorScales.length - 1].base_salary;
  };

  const baseThis = findBase(cappedThis);
  const baseLast = findBase(cappedLast);

  const orgProduct = orgIndexations.reduce(
    (acc, i) => acc * Number(i.indexation_value),
    1
  );
  const secIdxs = sectorIndexations.filter(
    (i) => i.sector_id === employee.sector_id
  );
  const sectorProduct = secIdxs.reduce(
    (acc, i) => acc * Number(i.indexation_value),
    1
  );
  const totalIndex = orgProduct * sectorProduct;

  const personalTotal = empIndexations
    .filter((i) => i.employee_id === employee.id)
    .reduce((acc, i) => acc + Number(i.indexation_value), 0);

  const salaryThis =
    Math.round((baseThis * totalIndex + personalTotal) * 100) / 100;
  const salaryLast =
    Math.round((baseLast * totalIndex + personalTotal) * 100) / 100;
  const difference = Math.round((salaryThis - salaryLast) * 100) / 100;

  const hasAlert = baseThis !== baseLast;

  const changeMonth = start.getMonth() + 1;
  const changeDate = `${now.getFullYear()}-${String(changeMonth).padStart(2, "0")}-01`;

  return {
    seniorityStart,
    seniorityYears,
    seniorityLastYear,
    cappedThis,
    cappedLast,
    baseThis,
    baseLast,
    totalIndex: Math.round(totalIndex * 10000) / 10000,
    personalTotal,
    salaryThis,
    salaryLast,
    difference,
    hasAlert,
    changeDate,
    maxYears,
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString("fr-BE", { style: "currency", currency: "EUR" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-BE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getNextBracketInfo(
  alert: SalaryAlertResult,
  scales: SeniorityScale[],
  sectorId: number | null
): { nextYears: number | null; monthsRemaining: number | null } {
  if (!sectorId) return { nextYears: null, monthsRemaining: null };

  const sectorScales = scales
    .filter((s) => s.sector_id === sectorId)
    .sort((a, b) => a.years - b.years);

  const currentBase = alert.baseThis;
  const nextScale = sectorScales.find(
    (s) => s.years > alert.cappedThis && s.base_salary !== currentBase
  );

  if (!nextScale) return { nextYears: null, monthsRemaining: null };

  const now = new Date();
  const start = new Date(alert.seniorityStart);
  const monthsDiff =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  const monthsToNext = nextScale.years * 12 - monthsDiff;

  return {
    nextYears: nextScale.years,
    monthsRemaining: Math.max(0, monthsToNext),
  };
}

export default function AlertesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [scales, setScales] = useState<SeniorityScale[]>([]);
  const [orgIndexations, setOrgIndexations] = useState<OrgIndexation[]>([]);
  const [sectorIndexations, setSectorIndexations] = useState<SectorIndexation[]>([]);
  const [empIndexations, setEmpIndexations] = useState<EmployeeIndexation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<number>>(new Set());
  const [expandedAll, setExpandedAll] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [empRes, scalesRes, orgRes, secRes, empIdxRes] = await Promise.all([
        supabase
          .from("employees")
          .select(
            "id, first_name, last_name, date_of_hire, granted_seniority_date, sector_id, is_inactive, sectors(name)"
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

      if (empRes.data) setEmployees(empRes.data as unknown as Employee[]);
      if (scalesRes.data) setScales(scalesRes.data as unknown as SeniorityScale[]);
      if (orgRes.data) setOrgIndexations(orgRes.data as unknown as OrgIndexation[]);
      if (secRes.data) setSectorIndexations(secRes.data as unknown as SectorIndexation[]);
      if (empIdxRes.data) setEmpIndexations(empIdxRes.data as unknown as EmployeeIndexation[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleAlertExpand = (id: number) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllExpand = (id: number) => {
    setExpandedAll((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate alerts for all employees
  const employeeAlerts: EmployeeAlert[] = employees
    .map((emp) => {
      const alert = calculateSalaryAlert(
        emp,
        scales,
        orgIndexations,
        sectorIndexations,
        empIndexations
      );
      return alert ? { employee: emp, alert } : null;
    })
    .filter((item): item is EmployeeAlert => item !== null);

  const activeAlerts = employeeAlerts.filter((ea) => ea.alert.hasAlert);
  const allEmployees = employeeAlerts;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 mt-4">Chargement...</p>
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
          Detection des employes dont l&apos;anciennete atteint un nouveau palier
          cette annee, declenchant une augmentation de salaire a notifier.
        </p>
      </div>

      {/* Section 1: Active Alerts */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Alertes actives ({activeAlerts.length})
          </h2>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <p className="text-green-800 font-medium">
              Aucune alerte active. Tous les employes sont a jour.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map(({ employee, alert }) => (
              <div
                key={employee.id}
                className="bg-orange-50 border border-orange-200 rounded-lg shadow-sm overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-orange-100 transition-colors"
                  onClick={() => toggleAlertExpand(employee.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {employee.last_name}, {employee.first_name}
                        </h3>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-medium">
                          {employee.sectors?.name || "Sans secteur"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
                        <span>
                          Anciennete : <strong>{alert.seniorityYears} ans</strong>
                        </span>
                        <span>
                          Palier : {formatCurrency(alert.baseLast)} &rarr;{" "}
                          <strong>{formatCurrency(alert.baseThis)}</strong>
                        </span>
                        <span className="text-orange-700 font-semibold">
                          +{formatCurrency(alert.difference)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-orange-700 font-medium">
                        Attention : augmentation de salaire a notifier avant le{" "}
                        {formatDate(alert.changeDate)}
                      </p>
                    </div>
                    <div className="ml-4 text-slate-400">
                      {expandedAlerts.has(employee.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedAlerts.has(employee.id) && (
                  <div className="px-5 pb-5 border-t border-orange-200 bg-white/50">
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white rounded p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-medium">
                          Debut anciennete
                        </p>
                        <p className="font-medium text-slate-900 mt-1">
                          {formatDate(alert.seniorityStart)}
                        </p>
                      </div>
                      <div className="bg-white rounded p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-medium">
                          Anciennete plafonnee
                        </p>
                        <p className="font-medium text-slate-900 mt-1">
                          {alert.cappedLast} &rarr; {alert.cappedThis} ans (max:{" "}
                          {alert.maxYears})
                        </p>
                      </div>
                      <div className="bg-white rounded p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-medium">
                          Index total
                        </p>
                        <p className="font-medium text-slate-900 mt-1">
                          x {alert.totalIndex.toFixed(4)}
                        </p>
                      </div>
                      <div className="bg-white rounded p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-medium">
                          Indexation personnelle
                        </p>
                        <p className="font-medium text-slate-900 mt-1">
                          {formatCurrency(alert.personalTotal)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 bg-white rounded p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-mono">
                        Formule : base {formatCurrency(alert.baseThis)} x{" "}
                        {alert.totalIndex.toFixed(4)} + {formatCurrency(alert.personalTotal)}{" "}
                        = {formatCurrency(alert.salaryThis)}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        Ancien : base {formatCurrency(alert.baseLast)} x{" "}
                        {alert.totalIndex.toFixed(4)} + {formatCurrency(alert.personalTotal)}{" "}
                        = {formatCurrency(alert.salaryLast)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: All Employees */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Tous les employes ({allEmployees.length})
          </h2>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    Employe
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">
                    Secteur
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">
                    Anciennete
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">
                    Salaire actuel
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">
                    Prochain palier
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">
                    Mois restants
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-slate-600">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {allEmployees.map(({ employee, alert }) => {
                  const nextInfo = getNextBracketInfo(
                    alert,
                    scales,
                    employee.sector_id
                  );
                  const isExpanded = expandedAll.has(employee.id);

                  return (
                    <Fragment key={employee.id}>
                      <tr
                        className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                          alert.hasAlert ? "bg-orange-50/50" : ""
                        }`}
                        onClick={() => toggleAllExpand(employee.id)}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {employee.last_name}, {employee.first_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {employee.sectors?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-900">
                          {alert.seniorityYears} an
                          {alert.seniorityYears > 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-900">
                          {formatCurrency(alert.salaryThis)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {nextInfo.nextYears !== null
                            ? `${nextInfo.nextYears} ans`
                            : "Plafond atteint"}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {nextInfo.monthsRemaining !== null
                            ? `${nextInfo.monthsRemaining} mois`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {alert.hasAlert ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              Alerte
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-500 uppercase">
                                  Debut anciennete
                                </p>
                                <p className="font-medium text-slate-900">
                                  {formatDate(alert.seniorityStart)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase">
                                  Base actuelle
                                </p>
                                <p className="font-medium text-slate-900">
                                  {formatCurrency(alert.baseThis)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase">
                                  Index total
                                </p>
                                <p className="font-medium text-slate-900">
                                  x {alert.totalIndex.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase">
                                  Indexation perso.
                                </p>
                                <p className="font-medium text-slate-900">
                                  {formatCurrency(alert.personalTotal)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 font-mono">
                              Formule : {formatCurrency(alert.baseThis)} x{" "}
                              {alert.totalIndex.toFixed(4)} +{" "}
                              {formatCurrency(alert.personalTotal)} ={" "}
                              {formatCurrency(alert.salaryThis)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
