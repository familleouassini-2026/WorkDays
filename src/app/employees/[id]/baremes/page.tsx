"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Award, ExternalLink, Info, ChevronDown, ChevronUp } from "lucide-react";
import { calculateSeniorityYears, calculateSeniorityBreakdown, calculateFullSalary, findBaseSalary } from "@/lib/calculations";

// ---------- TYPES ----------

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  date_of_hire: string | null;
  granted_seniority: number | null;
  granted_seniority_date: string | null;
  sector_id: number | null;
  sectors?: { name: string } | null;
}

interface SeniorityScale {
  id: number;
  sector_id: number;
  years: number;
  base_salary: number;
}

interface IndexationRow {
  id: number;
  indexation_value: number;
  indexation_date: string;
}

interface EmployeeIndexationRow {
  id: number;
  employee_id: number;
  indexation_value: number;
  indexation_date: string;
}

// ---------- PAGE ----------

export default function EmployeeBaremesPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [scales, setScales] = useState<SeniorityScale[]>([]);
  const [indexedSalary, setIndexedSalary] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [formulaOpen, setFormulaOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const empId = params.id;

      // Fetch employee with sector
      const { data: emp } = await supabase
        .from("employees")
        .select("id, first_name, last_name, date_of_hire, granted_seniority, granted_seniority_date, sector_id, sectors(name)")
        .eq("id", empId)
        .single();

      if (emp) {
        setEmployee(emp as unknown as Employee);

        if (emp.sector_id) {
          // Fetch seniority scales for this sector
          const { data: scaleData } = await supabase
            .from("seniority_scales")
            .select("*")
            .eq("sector_id", emp.sector_id)
            .order("years", { ascending: true });

          if (scaleData) setScales(scaleData);

          // Calculate indexed salary
          const senYears = calculateSeniorityYears(
            emp.date_of_hire,
            emp.granted_seniority,
            emp.granted_seniority_date
          );

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
            .eq("employee_id", emp.id);

          if (scaleData && scaleData.length > 0) {
            const baseSalary = findBaseSalary(emp.sector_id, senYears, scaleData);
            if (baseSalary) {
              const result = calculateFullSalary({
                baseSalary,
                orgIndexations: (orgIdx || []) as IndexationRow[],
                sectorIndexations: (secIdx || []) as IndexationRow[],
                personalIncreases: (empIdx || []) as EmployeeIndexationRow[],
              });
              setIndexedSalary(result.totalSalary);
            }
          }
        }
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

  const seniorityBreakdown = calculateSeniorityBreakdown(
    employee.date_of_hire,
    employee.granted_seniority_date
  );
  const seniorityYears = Math.floor(seniorityBreakdown.acquise);

  // Find the matching scale (highest years <= seniorityYears)
  const matchingScale = [...scales]
    .sort((a, b) => b.years - a.years)
    .find((s) => seniorityYears >= s.years);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/employees/${employee.id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> Retour &agrave; la fiche
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-slate-900">
          Bar&egrave;me salarial - {employee.first_name} {employee.last_name}
        </h1>
      </div>

      {/* Info banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-800">Logique de calcul du salaire</h4>
            <p className="text-sm text-blue-700 mt-1">
              Le salaire est calcul&eacute; &agrave; partir du bar&egrave;me de base (selon anciennet&eacute; et secteur), multipli&eacute; par le produit des indexations g&eacute;n&eacute;rales et sectorielles, puis additionn&eacute; des augmentations personnelles.
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

      {/* Current situation */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Situation actuelle</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Anciennet&eacute; prise en compte</span>
            <span className="font-bold text-blue-700">{seniorityYears} an{seniorityYears > 1 ? "s" : ""}</span>
            {seniorityBreakdown.accordee > 0 && (
              <span className="text-xs text-slate-400">dont {seniorityBreakdown.accordee.toFixed(0)} accord&eacute;e</span>
            )}
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Palier bar&egrave;me</span>
            <span className="font-medium text-slate-900">
              {matchingScale ? `${matchingScale.years} an${matchingScale.years > 1 ? "s" : ""}` : "\u2014"}
            </span>
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Salaire de base</span>
            <span className="font-medium text-slate-900">
              {matchingScale ? `${matchingScale.base_salary.toFixed(2)} \u20AC` : "\u2014"}
            </span>
          </div>
          <div className="flex justify-between sm:flex-col sm:gap-0.5">
            <span className="text-slate-500">Salaire index&eacute; actuel</span>
            <span className="font-bold text-green-700">
              {indexedSalary ? `${indexedSalary.toFixed(2)} \u20AC` : "\u2014"}
            </span>
          </div>
        </div>
        {!employee.sector_id && (
          <p className="text-xs text-amber-600 mt-3">Aucun secteur assign&eacute; &agrave; cet employ&eacute;.</p>
        )}
        {employee.sector_id && scales.length === 0 && (
          <p className="text-xs text-amber-600 mt-3">
            Aucun bar&egrave;me configur&eacute; pour le secteur {employee.sectors?.name || ""}.
          </p>
        )}
      </div>

      {/* Full bareme table */}
      {scales.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700">
              Bar&egrave;me complet - Secteur {employee.sectors?.name || "\u2014"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Anciennet&eacute; (ann&eacute;es)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Salaire de base (&euro;)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scales.map((scale) => {
                  const isCurrentRow = matchingScale?.id === scale.id;
                  return (
                    <tr
                      key={scale.id}
                      className={isCurrentRow ? "bg-green-50 font-semibold" : "hover:bg-slate-50"}
                    >
                      <td className="px-4 py-3 text-sm">
                        <span className={isCurrentRow ? "text-green-800" : "text-slate-700"}>
                          {scale.years} an{scale.years > 1 ? "s" : ""}
                        </span>
                        {isCurrentRow && (
                          <span className="ml-2 inline-flex px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                            actuel
                          </span>
                        )}
                      </td>
                      <td className={`text-right px-4 py-3 text-sm ${isCurrentRow ? "text-green-800" : "text-slate-700"}`}>
                        {scale.base_salary.toFixed(2)} &euro;
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Link to global management */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/remuneration/baremes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Gestion globale des bar&egrave;mes
        </Link>
      </div>
    </div>
  );
}
