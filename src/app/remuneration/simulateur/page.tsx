"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calculator, TrendingUp, User, Building2, Layers, Plus, Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  calculateSeniorityYears,
  calculateSeniorityBreakdown,
  findBaseSalary,
  calculateFullSalary,
  type IndexationRow,
  type EmployeeIndexationRow,
  type SeniorityScaleRow,
} from "@/lib/calculations";

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  sector_id: number | null;
  date_of_hire: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  sectors: { id: number; name: string } | null;
}

// ============================================================
// COMPONENT
// ============================================================

export default function SimulateurPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [scales, setScales] = useState<SeniorityScaleRow[]>([]);
  const [orgIndexations, setOrgIndexations] = useState<IndexationRow[]>([]);
  const [sectorIndexations, setSectorIndexations] = useState<IndexationRow[]>([]);
  const [employeeIndexations, setEmployeeIndexations] = useState<EmployeeIndexationRow[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [simulationDate, setSimulationDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [formulaOpen, setFormulaOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [empRes, scalesRes, orgIdxRes, secIdxRes, empIdxRes] =
        await Promise.all([
          supabase
            .from("employees")
            .select(
              "id, first_name, last_name, sector_id, date_of_hire, granted_seniority, granted_seniority_date, sectors(id, name)"
            )
            .eq("is_inactive", false)
            .order("last_name"),
          supabase
            .from("seniority_scales")
            .select("id, sector_id, years, base_salary")
            .order("years"),
          supabase
            .from("organisation_indexations")
            .select("id, indexation_value, indexation_date")
            .order("indexation_date", { ascending: true }),
          supabase
            .from("sector_indexations")
            .select("id, sector_id, indexation_value, indexation_date")
            .order("indexation_date", { ascending: true }),
          supabase
            .from("employee_indexations")
            .select("id, employee_id, indexation_value, indexation_date")
            .order("indexation_date", { ascending: true }),
        ]);

      if (empRes.data) setEmployees(empRes.data as unknown as Employee[]);
      if (scalesRes.data) setScales(scalesRes.data as SeniorityScaleRow[]);
      if (orgIdxRes.data) setOrgIndexations(orgIdxRes.data as IndexationRow[]);
      if (secIdxRes.data)
        setSectorIndexations(secIdxRes.data as Array<IndexationRow & { sector_id: number }>);
      if (empIdxRes.data)
        setEmployeeIndexations(empIdxRes.data as EmployeeIndexationRow[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const employee = employees.find((e) => e.id === Number(selectedEmployee));
  const refDate = new Date(simulationDate || Date.now());

  // Calculate seniority
  const seniorityBreakdown = employee
    ? calculateSeniorityBreakdown(
        employee.date_of_hire,
        employee.granted_seniority,
        refDate
      )
    : { acquise: 0, accordee: 0, totale: 0 };
  const seniorityYears = Math.floor(seniorityBreakdown.totale);

  // Find base salary from scale
  const baseSalary =
    employee && employee.sector_id
      ? findBaseSalary(employee.sector_id, seniorityYears, scales)
      : null;

  // Filter sector indexations for this employee's sector
  const empSectorIndexations = employee?.sector_id
    ? (sectorIndexations as Array<IndexationRow & { sector_id: number }>).filter(
        (si) => (si as any).sector_id === employee.sector_id
      )
    : [];

  // Filter personal increases for this employee
  const empPersonalIncreases = employee
    ? employeeIndexations.filter((ei) => ei.employee_id === employee.id)
    : [];

  // Full salary calculation
  const salaryResult =
    baseSalary !== null
      ? calculateFullSalary({
          baseSalary,
          orgIndexations,
          sectorIndexations: empSectorIndexations,
          personalIncreases: empPersonalIncreases,
          referenceDate: refDate,
        })
      : null;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 mt-4">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Simulateur de salaire complet
        </h1>
        <p className="text-slate-500 mt-1">
          Base × Indexation org × Indexation secteur + Augmentations
          personnelles
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-800">Logique de calcul</h4>
            <p className="text-sm text-blue-700 mt-1">
              S&eacute;lectionnez un employ&eacute; pour calculer son salaire index&eacute;. La formule appliqu&eacute;e : Base &times; Index g&eacute;n&eacute;ral &times; Index sectoriel + Augmentations personnelles
            </p>
            <button
              onClick={() => setFormulaOpen(!formulaOpen)}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 mt-2"
            >
              {formulaOpen ? "Masquer la formule" : "Voir la formule"}
              {formulaOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {formulaOpen && (
              <div className="mt-2 bg-white/60 rounded-md p-3 border border-blue-100">
                <p className="text-xs font-mono text-blue-800 leading-relaxed">
                  Salaire = Base(bar&egrave;me) &times; &Pi;Product(org) &times; &Pi;Product(secteur) + &Sigma;(augmentations)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Selectionner un employe
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Choisir un employe</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.last_name}, {emp.first_name}
                  {emp.sectors ? ` (${emp.sectors.name})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date de simulation
            </label>
            <input
              type="date"
              value={simulationDate}
              onChange={(e) => setSimulationDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {employee && (
        <div className="space-y-4">
          {/* Employee info cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InfoCard
              icon={<User className="w-4 h-4 text-blue-600" />}
              label="Secteur"
              value={employee.sectors?.name || "Non defini"}
            />
            <InfoCard
              icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
              label="Anciennete totale"
              value={`${seniorityYears} an${seniorityYears > 1 ? "s" : ""}`}
              sublabel={seniorityBreakdown.accordee > 0
                ? `Acquise: ${seniorityBreakdown.acquise.toFixed(1)} + Accordée: ${seniorityBreakdown.accordee}`
                : `Acquise depuis ${employee?.date_of_hire ? new Date(employee.date_of_hire).getFullYear() : "?"}`
              }
            />
            <InfoCard
              icon={<Building2 className="w-4 h-4 text-emerald-600" />}
              label="Bareme de base"
              value={
                baseSalary !== null
                  ? formatEUR(baseSalary)
                  : "Aucun bareme"
              }
            />
            <InfoCard
              icon={<Layers className="w-4 h-4 text-amber-600" />}
              label="Augmentations perso."
              value={
                empPersonalIncreases.length > 0
                  ? `${empPersonalIncreases.length} enregistree${empPersonalIncreases.length > 1 ? "s" : ""}`
                  : "Aucune"
              }
            />
          </div>

          {/* Calculation breakdown */}
          {salaryResult ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calculator className="w-5 h-5 text-blue-700" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Decomposition du calcul
                </h3>
              </div>

              <div className="space-y-3">
                {/* Base salary */}
                <CalcRow
                  label="Salaire de base (bareme)"
                  value={formatEUR(salaryResult.baseSalary)}
                  sublabel={`Secteur ${employee.sectors?.name || "?"}, ${seniorityYears} ans d'anciennete${seniorityBreakdown.accordee > 0 ? ` (${seniorityBreakdown.acquise.toFixed(0)} acquise + ${seniorityBreakdown.accordee} accordée)` : ""}`}
                />

                {/* Org indexation */}
                <CalcRow
                  label="Indexation organisation (DProduct)"
                  value={`× ${salaryResult.orgFactor.toFixed(6)}`}
                  sublabel={`${orgIndexations.length} indexation${orgIndexations.length > 1 ? "s" : ""} enregistree${orgIndexations.length > 1 ? "s" : ""}`}
                  isMultiplier
                />

                {/* Sector indexation */}
                <CalcRow
                  label="Indexation sectorielle (DProduct)"
                  value={`× ${salaryResult.sectorFactor.toFixed(6)}`}
                  sublabel={`${empSectorIndexations.length} indexation${empSectorIndexations.length > 1 ? "s" : ""} pour ce secteur`}
                  isMultiplier
                />

                {/* Combined factor */}
                <div className="border-t border-blue-200 pt-3">
                  <CalcRow
                    label="Facteur combine (org × secteur)"
                    value={`× ${salaryResult.combinedFactor.toFixed(6)}`}
                    isBold
                  />
                </div>

                {/* Indexed salary */}
                <CalcRow
                  label="Salaire indexe (base × facteur)"
                  value={formatEUR(salaryResult.indexedSalary)}
                  isBold
                />

                {/* Personal increases */}
                {salaryResult.personalTotal > 0 && (
                  <CalcRow
                    label="Augmentations personnelles"
                    value={`+ ${formatEUR(salaryResult.personalTotal)}`}
                    sublabel={`Somme de ${empPersonalIncreases.length} augmentation${empPersonalIncreases.length > 1 ? "s" : ""}`}
                    isAddition
                  />
                )}

                {/* TOTAL */}
                <div className="border-t-2 border-blue-300 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-blue-900">
                      Salaire total actuel
                    </span>
                    <span className="text-2xl font-bold text-blue-900">
                      {formatEUR(salaryResult.totalSalary)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula reminder */}
              <div className="mt-5 bg-white/60 rounded-lg p-4">
                <p className="text-xs text-slate-600 font-mono leading-relaxed">
                  Formule : {formatEUR(salaryResult.baseSalary)} ×{" "}
                  {salaryResult.orgFactor.toFixed(4)} (org) ×{" "}
                  {salaryResult.sectorFactor.toFixed(4)} (secteur)
                  {salaryResult.personalTotal > 0
                    ? ` + ${formatEUR(salaryResult.personalTotal)} (perso)`
                    : ""}{" "}
                  = <strong>{formatEUR(salaryResult.totalSalary)}</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
              <p className="text-amber-800">
                Impossible de calculer : aucun bareme trouve pour ce secteur et
                cette anciennete.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Verifiez que le secteur {employee.sectors?.name || "?"} a des
                entrees dans la table <code>seniority_scales</code> pour{" "}
                {seniorityYears} ans.
              </p>
            </div>
          )}

          {/* Personal increases detail */}
          {empPersonalIncreases.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Detail des augmentations personnelles
                </h4>
              </div>
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500">
                      Date d&apos;effet
                    </th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {empPersonalIncreases.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 text-sm text-slate-900">
                        {new Date(
                          inc.indexation_date + "T00:00:00"
                        ).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2 text-sm text-emerald-700 font-medium text-right">
                        + {formatEUR(inc.indexation_value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Indexation history (collapsible) */}
          {(orgIndexations.length > 0 || empSectorIndexations.length > 0) && (
            <IndexationHistory
              orgIndexations={orgIndexations}
              sectorIndexations={empSectorIndexations}
              sectorName={employee.sectors?.name || ""}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function InfoCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-slate-500 font-medium uppercase">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

function CalcRow({
  label,
  value,
  sublabel,
  isBold,
  isMultiplier,
  isAddition,
}: {
  label: string;
  value: string;
  sublabel?: string;
  isBold?: boolean;
  isMultiplier?: boolean;
  isAddition?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span
          className={`text-sm ${isBold ? "font-semibold text-blue-900" : "text-slate-700"}`}
        >
          {label}
        </span>
        {sublabel && (
          <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          isMultiplier
            ? "text-purple-700"
            : isAddition
            ? "text-emerald-700"
            : isBold
            ? "font-bold text-blue-900"
            : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function IndexationHistory({
  orgIndexations,
  sectorIndexations,
  sectorName,
}: {
  orgIndexations: IndexationRow[];
  sectorIndexations: IndexationRow[];
  sectorName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute cumulative DProduct of all indexation factors (org + sector)
  const allFactors = [...orgIndexations, ...sectorIndexations];
  const dProductTotal = allFactors.reduce((acc, idx) => acc * idx.indexation_value, 1);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">
          Historique des indexations — Total: &times;{dProductTotal.toFixed(6)} ({orgIndexations.length} org +{" "}
          {sectorIndexations.length} secteur)
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Org indexations */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Organisation
            </h5>
            {orgIndexations.length === 0 ? (
              <p className="text-xs text-slate-400">Aucune indexation org.</p>
            ) : (
              <div className="space-y-1">
                {orgIndexations.map((idx) => (
                  <div
                    key={idx.id}
                    className="flex justify-between text-xs text-slate-600"
                  >
                    <span>
                      {new Date(
                        idx.indexation_date + "T00:00:00"
                      ).toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-mono">
                      {idx.indexation_value.toFixed(6)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sector indexations */}
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase mb-2">
              Secteur ({sectorName})
            </h5>
            {sectorIndexations.length === 0 ? (
              <p className="text-xs text-slate-400">
                Aucune indexation sectorielle.
              </p>
            ) : (
              <div className="space-y-1">
                {sectorIndexations.map((idx) => (
                  <div
                    key={idx.id}
                    className="flex justify-between text-xs text-slate-600"
                  >
                    <span>
                      {new Date(
                        idx.indexation_date + "T00:00:00"
                      ).toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-mono">
                      {idx.indexation_value.toFixed(6)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function formatEUR(amount: number): string {
  return amount.toLocaleString("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
