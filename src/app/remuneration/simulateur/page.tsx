"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  TableProperties,
  TrendingUp,
  Calculator,
  UserSearch,
  Info,
} from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  sector_id: number | null;
  date_of_hire: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  is_inactive: boolean;
  sectors: { id: number; name: string } | null;
}

interface Timesheet {
  id: number;
  employee_id: number;
  is_active: boolean;
  monday_minutes: number;
  tuesday_minutes: number;
  wednesday_minutes: number;
  thursday_minutes: number;
  friday_minutes: number;
  saturday_minutes: number;
  sunday_minutes: number;
  full_time_minutes: number;
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

interface SimulationResult {
  baseSalary: number;
  seniorityYears: number;
  workPercentage: number;
  orgFactor: number;
  sectorFactor: number;
  cumulativeFactor: number;
  indexedSalary: number;
  sectorName: string;
}

export default function SimulateurPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      const supabase = createClient();
      const { data } = await supabase
        .from("employees")
        .select("id, first_name, last_name, sector_id, date_of_hire, granted_seniority, granted_seniority_date, is_inactive, sectors(id, name)")
        .eq("is_inactive", false)
        .order("last_name");

      if (data) setEmployees(data as unknown as Employee[]);
      setLoading(false);
    }
    fetchEmployees();
  }, []);

  function calculateSeniorityYears(employee: Employee): number {
    // When granted_seniority_date is set, it already encodes any granted bonus
    // (i.e., it IS the adjusted start date). Do not add granted_seniority on top.
    // Only add granted_seniority when using date_of_hire as the reference.
    const referenceDate = employee.granted_seniority_date
      ? new Date(employee.granted_seniority_date)
      : employee.date_of_hire
      ? new Date(employee.date_of_hire)
      : null;

    if (!referenceDate) return 0;

    const now = new Date();
    let years = now.getFullYear() - referenceDate.getFullYear();
    const monthDiff = now.getMonth() - referenceDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < referenceDate.getDate())) {
      years--;
    }

    // Only add granted_seniority when NOT using granted_seniority_date
    const grantedYears = employee.granted_seniority_date
      ? 0
      : (employee.granted_seniority || 0);
    return Math.max(0, years + grantedYears);
  }

  async function handleCalculate() {
    if (!selectedEmployeeId) return;

    setCalculating(true);
    setResult(null);
    setError(null);

    const supabase = createClient();
    const employee = employees.find((e) => e.id === Number(selectedEmployeeId));
    if (!employee) {
      setError("Employe non trouve.");
      setCalculating(false);
      return;
    }

    if (!employee.sector_id) {
      setError("Cet employe n'a pas de secteur assigne.");
      setCalculating(false);
      return;
    }

    // Fetch timesheet, scales, and indexations in parallel
    const [timesheetRes, scalesRes, orgIdxRes, sectorIdxRes] = await Promise.all([
      supabase
        .from("timesheets")
        .select("*")
        .eq("employee_id", employee.id)
        .eq("is_active", true)
        .limit(1),
      supabase
        .from("seniority_scales")
        .select("*")
        .eq("sector_id", employee.sector_id)
        .order("years", { ascending: true }),
      supabase.from("organisation_indexations").select("id, indexation_value"),
      supabase
        .from("sector_indexations")
        .select("id, sector_id, indexation_value")
        .eq("sector_id", employee.sector_id),
    ]);

    const timesheet: Timesheet | null = timesheetRes.data?.[0] || null;
    const scales: SeniorityScale[] = (scalesRes.data as SeniorityScale[]) || [];
    const orgIndexations: OrgIndexation[] = orgIdxRes.data || [];
    const sectorIndexations: SectorIndexation[] = sectorIdxRes.data || [];

    // Calculate seniority years
    const seniorityYears = calculateSeniorityYears(employee);

    // Find matching scale (closest years <= seniorityYears)
    const matchingScale = scales
      .filter((s) => s.years <= seniorityYears)
      .sort((a, b) => b.years - a.years)[0];

    if (!matchingScale) {
      setError(
        `Aucun bareme trouve pour le secteur "${employee.sectors?.name}" avec ${seniorityYears} an(s) d'anciennete.`
      );
      setCalculating(false);
      return;
    }

    // Calculate work percentage
    let workPercentage = 1;
    if (timesheet && timesheet.full_time_minutes > 0) {
      const weeklyMinutes =
        (timesheet.monday_minutes || 0) +
        (timesheet.tuesday_minutes || 0) +
        (timesheet.wednesday_minutes || 0) +
        (timesheet.thursday_minutes || 0) +
        (timesheet.friday_minutes || 0) +
        (timesheet.saturday_minutes || 0) +
        (timesheet.sunday_minutes || 0);
      workPercentage = weeklyMinutes / timesheet.full_time_minutes;
    }

    // Calculate cumulative indexation
    const orgFactor = orgIndexations.reduce(
      (acc, idx) => acc * Number(idx.indexation_value),
      1
    );
    const sectorFactor = sectorIndexations.reduce(
      (acc, idx) => acc * Number(idx.indexation_value),
      1
    );
    const cumulativeFactor = orgFactor * sectorFactor;

    // Calculate indexed salary
    const baseSalary = Number(matchingScale.base_salary);
    const indexedSalary = baseSalary * cumulativeFactor * workPercentage;

    setResult({
      baseSalary,
      seniorityYears,
      workPercentage,
      orgFactor,
      sectorFactor,
      cumulativeFactor,
      indexedSalary,
      sectorName: employee.sectors?.name || "Inconnu",
    });

    setCalculating(false);
  }

  const selectedEmployee = employees.find(
    (e) => e.id === Number(selectedEmployeeId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Simulateur salarial</h1>
        <p className="text-slate-500 mt-1">
          Calculez le salaire indexe pour un employe
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2">
        <Link
          href="/remuneration/baremes"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        >
          <TableProperties className="w-4 h-4" />
          Baremes
        </Link>
        <Link
          href="/remuneration/indexations"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          Indexations
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
          <Calculator className="w-4 h-4" />
          Simulateur
        </span>
      </div>

      {/* Employee selector */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserSearch className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-slate-900">
            Selectionner un employe
          </h2>
        </div>

        {loading ? (
          <div className="animate-pulse h-10 bg-slate-200 rounded-md" />
        ) : (
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employe
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setResult(null);
                  setError(null);
                }}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Choisir un employe --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.last_name}, {emp.first_name}
                    {emp.sectors ? ` (${emp.sectors.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCalculate}
              disabled={!selectedEmployeeId || calculating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {calculating ? "Calcul..." : "Calculer"}
            </button>
          </div>
        )}

        {/* Show selected employee info */}
        {selectedEmployee && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                Secteur
              </span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {selectedEmployee.sectors?.name || "Non assigne"}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                Date d&apos;embauche
              </span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {selectedEmployee.date_of_hire
                  ? new Date(selectedEmployee.date_of_hire).toLocaleDateString(
                      "fr-BE"
                    )
                  : "Non renseignee"}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                Anciennete accordee
              </span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {selectedEmployee.granted_seniority
                  ? `${selectedEmployee.granted_seniority} an(s)`
                  : "Aucune"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Resultat de la simulation
          </h2>

          {/* Salary breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xs text-blue-600 uppercase tracking-wider font-medium">
                Salaire de base (bareme)
              </span>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {result.baseSalary.toLocaleString("fr-BE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                EUR
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Secteur: {result.sectorName} | Anciennete: {result.seniorityYears} an(s)
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <span className="text-xs text-green-600 uppercase tracking-wider font-medium">
                Salaire indexe
              </span>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {result.indexedSalary.toLocaleString("fr-BE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                EUR
              </p>
              <p className="text-xs text-green-600 mt-1">
                Montant mensuel apres indexation
              </p>
            </div>
          </div>

          {/* Calculation breakdown */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
              <h3 className="text-sm font-medium text-slate-700">
                Detail du calcul
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-600">Salaire de base</span>
                <span className="text-sm font-medium text-slate-900">
                  {result.baseSalary.toLocaleString("fr-BE", {
                    minimumFractionDigits: 2,
                  })}{" "}
                  EUR
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-600">
                  Facteur indexation organisation
                </span>
                <span className="text-sm font-medium text-slate-900">
                  x {result.orgFactor.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-600">
                  Facteur indexation secteur
                </span>
                <span className="text-sm font-medium text-slate-900">
                  x {result.sectorFactor.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-600">
                  Facteur cumulatif total
                </span>
                <span className="text-sm font-medium text-slate-900">
                  x {result.cumulativeFactor.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-600">
                  Pourcentage de travail
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {(result.workPercentage * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-slate-50 font-semibold">
                <span className="text-sm text-slate-900">
                  Salaire indexe final
                </span>
                <span className="text-sm text-slate-900">
                  {result.indexedSalary.toLocaleString("fr-BE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  EUR
                </span>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 font-mono">
              Formule: salaire_base x facteur_indexation_cumulatif x pourcentage_travail
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              = {result.baseSalary.toFixed(2)} x {result.cumulativeFactor.toFixed(6)} x{" "}
              {result.workPercentage.toFixed(4)} = {result.indexedSalary.toFixed(2)} EUR
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
