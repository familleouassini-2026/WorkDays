"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Award, ExternalLink, Info, ChevronDown, ChevronUp, TrendingUp, Building2, Layers, Plus } from "lucide-react";
import { calculateSeniorityYears, calculateSeniorityBreakdown, calculateFullSalary, findBaseSalary } from "@/lib/calculations";

interface Employee { id: number; first_name: string; last_name: string; date_of_hire: string | null; granted_seniority: number | null; granted_seniority_date: string | null; sector_id: number | null; sectors?: { name: string } | null; }
interface SeniorityScale { id: number; sector_id: number; years: number; base_salary: number; }
interface IndexationRow { id: number; indexation_value: number; indexation_date: string; }
interface EmployeeIndexationRow { id: number; employee_id: number; indexation_value: number; indexation_date: string; }

export default function EmployeeBaremesPage() {
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [scales, setScales] = useState<SeniorityScale[]>([]);
  const [orgIndexations, setOrgIndexations] = useState<IndexationRow[]>([]);
  const [sectorIndexations, setSectorIndexations] = useState<IndexationRow[]>([]);
  const [personalIncreases, setPersonalIncreases] = useState<EmployeeIndexationRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Collapsible states
  const [baseOpen, setBaseOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [sectorOpen, setSectorOpen] = useState(false);
  const [personalOpen, setPersonalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const empId = params.id;
      const { data: emp } = await supabase.from("employees").select("id, first_name, last_name, date_of_hire, granted_seniority, granted_seniority_date, sector_id, sectors(name)").eq("id", empId).single();
      if (emp) {
        setEmployee(emp as unknown as Employee);
        if (emp.sector_id) {
          const [scaleRes, orgRes, secRes, empRes] = await Promise.all([
            supabase.from("seniority_scales").select("*").eq("sector_id", emp.sector_id).order("years"),
            supabase.from("organisation_indexations").select("id, indexation_value, indexation_date").order("indexation_date"),
            supabase.from("sector_indexations").select("id, indexation_value, indexation_date").eq("sector_id", emp.sector_id).order("indexation_date"),
            supabase.from("employee_indexations").select("id, employee_id, indexation_value, indexation_date").eq("employee_id", emp.id).order("indexation_date"),
          ]);
          if (scaleRes.data) setScales(scaleRes.data);
          if (orgRes.data) setOrgIndexations(orgRes.data as IndexationRow[]);
          if (secRes.data) setSectorIndexations(secRes.data as IndexationRow[]);
          if (empRes.data) setPersonalIncreases(empRes.data as EmployeeIndexationRow[]);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!employee) return <div className="text-center py-12"><p className="text-slate-500">Employ&eacute; non trouv&eacute;.</p><Link href="/employees" className="text-blue-600 hover:underline mt-2 inline-block">Retour</Link></div>;

  const seniorityBreakdown = calculateSeniorityBreakdown(employee.date_of_hire, employee.granted_seniority_date, new Date(), employee.granted_seniority);
  const seniorityYears = Math.floor(seniorityBreakdown.totale);
  const maxPalier = scales.length > 0 ? Math.max(...scales.map(s => s.years)) : null;
  const cappedYears = maxPalier !== null ? Math.min(seniorityYears, maxPalier) : seniorityYears;
  const matchingScale = [...scales].sort((a, b) => b.years - a.years).find((s) => cappedYears >= s.years);
  const baseSalary = matchingScale?.base_salary || null;

  const salaryResult = baseSalary ? calculateFullSalary({
    baseSalary,
    orgIndexations,
    sectorIndexations,
    personalIncreases,
  }) : null;

  const formatEUR = (v: number) => v.toLocaleString("fr-BE", { style: "currency", currency: "EUR" });

  return (
    <div className="space-y-4">
      <Link href={`/employees/${employee.id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-green-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Salaire - {employee.first_name} {employee.last_name}</h1>
          <p className="text-sm text-slate-500">{employee.sectors?.name || "Aucun secteur"}</p>
        </div>
      </div>

      {/* Formula banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs font-mono text-blue-800">
          Salaire = Base(bar&egrave;me) &times; &Pi;(indexations org) &times; &Pi;(indexations secteur) + &Sigma;(augmentations perso)
        </p>
      </div>

      {/* Result card */}
      {salaryResult && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5">
          <p className="text-sm text-green-700 font-medium">Salaire brut mensuel indexé</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{formatEUR(salaryResult.totalSalary)}</p>
          <p className="text-xs text-green-600 mt-2">
            {formatEUR(salaryResult.baseSalary)} &times; {salaryResult.combinedFactor.toFixed(6)} + {formatEUR(salaryResult.personalTotal)}
          </p>
        </div>
      )}

      {/* Card 1: Base (barème) */}
      <CollapsibleCard
        open={baseOpen}
        onToggle={() => setBaseOpen(!baseOpen)}
        icon={<Award className="w-4 h-4 text-blue-600" />}
        title="Base barémique"
        summary={baseSalary ? `${formatEUR(baseSalary)} (palier ${matchingScale?.years} ans)` : "Non configuré"}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Ancienneté prise en compte</span><p className="font-medium">{cappedYears} ans{maxPalier && seniorityYears > maxPalier ? ` (plafonnée, réelle: ${seniorityYears})` : ""}</p></div>
            <div><span className="text-slate-500">Palier appliqué</span><p className="font-medium">{matchingScale ? `${matchingScale.years} ans → ${formatEUR(matchingScale.base_salary)}` : "—"}</p></div>
          </div>
          {scales.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">Voir tous les {scales.length} paliers</summary>
              <div className="mt-2 max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b"><th className="text-left py-1 text-slate-500">Années</th><th className="text-right py-1 text-slate-500">Salaire</th></tr></thead>
                  <tbody>
                    {scales.map((s) => (
                      <tr key={s.id} className={s.id === matchingScale?.id ? "bg-green-50 font-semibold" : ""}>
                        <td className="py-1">{s.years} ans {s.id === matchingScale?.id && <span className="text-green-600">(actuel)</span>}</td>
                        <td className="py-1 text-right">{formatEUR(s.base_salary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      </CollapsibleCard>

      {/* Card 2: Indexations Organisation */}
      <CollapsibleCard
        open={orgOpen}
        onToggle={() => setOrgOpen(!orgOpen)}
        icon={<Building2 className="w-4 h-4 text-purple-600" />}
        title="Indexations organisation (ΠProduct)"
        summary={salaryResult ? `× ${salaryResult.orgFactor.toFixed(6)} (${orgIndexations.length} indexation${orgIndexations.length > 1 ? "s" : ""})` : "—"}
      >
        {orgIndexations.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Aucune indexation organisation configurée</p>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left py-1 text-slate-500">Date</th><th className="text-right py-1 text-slate-500">Facteur</th></tr></thead>
              <tbody>
                {orgIndexations.map((idx) => (
                  <tr key={idx.id} className="border-b last:border-b-0">
                    <td className="py-1.5">{new Date(idx.indexation_date).toLocaleDateString("fr-BE")}</td>
                    <td className="py-1.5 text-right font-mono">{idx.indexation_value.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-purple-600 mt-2 font-medium">Produit cumulé = {salaryResult?.orgFactor.toFixed(6)}</p>
          </div>
        )}
      </CollapsibleCard>

      {/* Card 3: Indexations Secteur */}
      <CollapsibleCard
        open={sectorOpen}
        onToggle={() => setSectorOpen(!sectorOpen)}
        icon={<Layers className="w-4 h-4 text-amber-600" />}
        title="Indexations sectorielles (ΠProduct)"
        summary={salaryResult ? `× ${salaryResult.sectorFactor.toFixed(6)} (${sectorIndexations.length} indexation${sectorIndexations.length > 1 ? "s" : ""})` : "—"}
      >
        {sectorIndexations.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Aucune indexation sectorielle pour {employee.sectors?.name || "ce secteur"}</p>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left py-1 text-slate-500">Date</th><th className="text-right py-1 text-slate-500">Facteur</th></tr></thead>
              <tbody>
                {sectorIndexations.map((idx) => (
                  <tr key={idx.id} className="border-b last:border-b-0">
                    <td className="py-1.5">{new Date(idx.indexation_date).toLocaleDateString("fr-BE")}</td>
                    <td className="py-1.5 text-right font-mono">{idx.indexation_value.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-amber-600 mt-2 font-medium">Produit cumulé = {salaryResult?.sectorFactor.toFixed(6)}</p>
          </div>
        )}
      </CollapsibleCard>

      {/* Card 4: Augmentations personnelles */}
      <CollapsibleCard
        open={personalOpen}
        onToggle={() => setPersonalOpen(!personalOpen)}
        icon={<Plus className="w-4 h-4 text-green-600" />}
        title="Augmentations personnelles (Σ)"
        summary={salaryResult ? `+ ${formatEUR(salaryResult.personalTotal)} (${personalIncreases.length} augmentation${personalIncreases.length > 1 ? "s" : ""})` : "—"}
      >
        {personalIncreases.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Aucune augmentation personnelle enregistrée</p>
        ) : (
          <div>
            <table className="w-full text-xs">
              <thead><tr className="border-b"><th className="text-left py-1 text-slate-500">Date</th><th className="text-left py-1 text-slate-500">Description</th><th className="text-right py-1 text-slate-500">Montant</th></tr></thead>
              <tbody>
                {personalIncreases.map((inc) => (
                  <tr key={inc.id} className="border-b last:border-b-0">
                    <td className="py-1.5">{new Date(inc.indexation_date).toLocaleDateString("fr-BE")}</td>
                    <td className="py-1.5 text-right font-mono text-green-700">+{formatEUR(inc.indexation_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-green-600 mt-2 font-medium">Total = +{formatEUR(salaryResult?.personalTotal || 0)}</p>
          </div>
        )}
      </CollapsibleCard>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        <Link href="/remuneration/baremes" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Barèmes globaux
        </Link>
        <Link href="/remuneration/indexations" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Indexations
        </Link>
      </div>
    </div>
  );
}

function CollapsibleCard({ open, onToggle, icon, title, summary, children }: {
  open: boolean; onToggle: () => void; icon: React.ReactNode; title: string; summary: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          {icon}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            <p className="text-xs text-slate-500 truncate">{summary}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 border-t border-slate-100 pt-3">{children}</div>}
    </div>
  );
}
