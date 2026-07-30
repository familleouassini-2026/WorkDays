"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calculator } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  sector_id: number | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  sectors: { name: string } | null;
}

interface SeniorityScale {
  id: number;
  sector_id: number;
  min_seniority: number;
  max_seniority: number;
  base_amount: number;
}

interface Indexation {
  id: number;
  effective_date: string;
  coefficient: number;
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";

export default function SimulateurPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [scales, setScales] = useState<SeniorityScale[]>([]);
  const [indexations, setIndexations] = useState<Indexation[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [empRes, scalesRes, indexRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name, sector_id, granted_seniority, granted_seniority_date, sectors(name)")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase
          .from("seniority_scales")
          .select("id, sector_id, min_seniority, max_seniority, base_amount")
          .order("min_seniority"),
        supabase
          .from("salary_indexations")
          .select("id, effective_date, coefficient")
          .order("effective_date", { ascending: true }),
      ]);
      if (empRes.data) setEmployees(empRes.data as unknown as Employee[]);
      if (scalesRes.data) setScales(scalesRes.data);
      if (indexRes.data) setIndexations(indexRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const employee = employees.find((e) => e.id === Number(selectedEmployee));

  // Calculate seniority in years
  function calculateSeniority(): number {
    if (!employee) return 0;
    if (employee.granted_seniority != null) return employee.granted_seniority;
    if (!employee.granted_seniority_date) return 0;
    const startDate = new Date(employee.granted_seniority_date);
    const now = new Date();
    const diffYears =
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  }

  // Find applicable scale
  function findScale(): SeniorityScale | null {
    if (!employee || !employee.sector_id) return null;
    const seniority = calculateSeniority();
    return (
      scales.find(
        (s) =>
          s.sector_id === employee.sector_id &&
          seniority >= s.min_seniority &&
          seniority <= s.max_seniority
      ) || null
    );
  }

  // Calculate cumulative indexation factor
  function getCumulativeFactor(): number {
    let factor = 1;
    for (const idx of indexations) {
      factor *= idx.coefficient;
    }
    return factor;
  }

  const seniority = calculateSeniority();
  const applicableScale = findScale();
  const cumulativeFactor = getCumulativeFactor();
  const baseAmount = applicableScale?.base_amount || 0;
  const indexedSalary = baseAmount * cumulativeFactor;

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
          Simulateur de salaire
        </h1>
        <p className="text-slate-500 mt-1">
          Calcul du salaire indexe par employe
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Selectionner un employe</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className={inputClass}
            >
              <option value="">Choisir un employe</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.last_name}, {emp.first_name}
                </option>
              ))}
            </select>
          </div>

          {employee && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              {/* Employee info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Secteur
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {employee.sectors?.name || "Non defini"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Anciennete
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {seniority} an{seniority > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 font-medium uppercase">
                    Bareme applicable
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {applicableScale
                      ? `${applicableScale.base_amount.toLocaleString("fr-BE", { style: "currency", currency: "EUR" })}`
                      : "Aucun bareme trouve"}
                  </p>
                </div>
              </div>

              {/* Calculation */}
              {applicableScale && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">
                      Resultat du calcul
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Salaire de base (bareme)</span>
                      <span className="font-medium text-slate-900">
                        {baseAmount.toLocaleString("fr-BE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        Facteur d&apos;indexation cumule
                      </span>
                      <span className="font-medium text-slate-900">
                        x {cumulativeFactor.toFixed(4)}
                      </span>
                    </div>
                    <div className="border-t border-blue-200 pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-blue-900">
                        Salaire indexe
                      </span>
                      <span className="text-xl font-bold text-blue-900">
                        {indexedSalary.toLocaleString("fr-BE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/60 rounded p-3">
                    <p className="text-xs text-slate-600 font-mono">
                      Formule : {baseAmount.toLocaleString("fr-BE")} x{" "}
                      {cumulativeFactor.toFixed(4)} ={" "}
                      {indexedSalary.toLocaleString("fr-BE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </p>
                  </div>
                </div>
              )}

              {!applicableScale && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    Aucun bareme applicable trouve pour ce secteur et cette
                    anciennete. Verifiez que le secteur et les baremes sont
                    correctement configures.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
