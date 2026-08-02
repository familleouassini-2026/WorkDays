"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Building2, Users, Layers, CheckCircle2,
  ExternalLink, ArrowRightLeft, Info, Calendar, Clock
} from "lucide-react";
import Link from "next/link";

// --- Helpers ---
function parseHours(val: string): { hours: number; minutes: number } {
  if (!val) return { hours: 0, minutes: 0 };
  const clean = val.trim();
  const match = clean.match(/^(\d+)h(\d+)?$/i);
  if (match) {
    return { hours: parseInt(match[1], 10), minutes: match[2] ? parseInt(match[2], 10) : 0 };
  }
  const num = parseFloat(clean);
  if (!isNaN(num)) return { hours: Math.floor(num), minutes: 0 };
  return { hours: 0, minutes: 0 };
}

function hoursToMinutes(val: string): number {
  const { hours, minutes } = parseHours(val);
  return hours * 60 + minutes;
}

interface StagingEmployee {
  id: number;
  sheet_name: string;
  last_name: string;
  first_name: string;
  sector_code: string | null;
  weekly_hours_lu: string | null;
  weekly_hours_ma: string | null;
  weekly_hours_me: string | null;
  weekly_hours_je: string | null;
  weekly_hours_ve: string | null;
  full_time_hours: string | null;
  is_inactive: boolean;
}

interface StagingVacRight {
  id: number;
  employee_name: string;
  year: number;
  code: string;
  code_description: string | null;
  total_hours: string | null;
  total_days: string | null;
}

interface ProdEmployee {
  id: number;
  first_name: string;
  last_name: string;
}

interface ProdTimesheet {
  id: number;
  is_active: boolean;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  full_time_minutes: number | null;
  start_date: string | null;
}

interface ProdVacRight {
  id: number;
  absence_code_id: number;
  year: number;
  hours: number;
  minutes: number;
  days: number;
  absence_codes: { code: string; description: string } | null;
}

type TabType = "organisation" | "secteurs" | "employes";

export default function DataMigrationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("organisation");
  const [stagingEmployees, setStagingEmployees] = useState<StagingEmployee[]>([]);
  const [selectedStaging, setSelectedStaging] = useState<StagingEmployee | null>(null);
  const [prodEmployees, setProdEmployees] = useState<ProdEmployee[]>([]);
  const [prodTimesheets, setProdTimesheets] = useState<ProdTimesheet[]>([]);
  const [prodVacRights, setProdVacRights] = useState<ProdVacRight[]>([]);
  const [stagingVacRights, setStagingVacRights] = useState<StagingVacRight[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStaging) {
      fetchComparisonData(selectedStaging);
    }
  }, [selectedStaging]);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();
    const [stRes, prodRes] = await Promise.all([
      supabase.from("staging_employees").select("*").order("last_name"),
      supabase.from("employees").select("id, first_name, last_name"),
    ]);
    if (stRes.data) setStagingEmployees(stRes.data);
    if (prodRes.data) setProdEmployees(prodRes.data);
    setLoading(false);
  }

  function findProdEmployee(staging: StagingEmployee): ProdEmployee | undefined {
    return prodEmployees.find(
      (p) =>
        p.last_name.toLowerCase() === staging.last_name.toLowerCase() &&
        p.first_name.toLowerCase() === staging.first_name.toLowerCase()
    );
  }

  async function fetchComparisonData(staging: StagingEmployee) {
    const matched = findProdEmployee(staging);
    if (!matched) {
      setProdTimesheets([]);
      setProdVacRights([]);
      setStagingVacRights([]);
      return;
    }
    const supabase = createClient();
    const [tsRes, vrRes, svrRes] = await Promise.all([
      supabase.from("timesheets").select("*").eq("employee_id", matched.id).order("is_active", { ascending: false }),
      supabase.from("vacation_rights").select("*, absence_codes(code, description)").eq("employee_id", matched.id).eq("year", 2026),
      supabase.from("staging_vacation_rights").select("*").eq("employee_name", staging.sheet_name),
    ]);
    if (tsRes.data) setProdTimesheets(tsRes.data);
    if (vrRes.data) setProdVacRights(vrRes.data);
    if (svrRes.data) setStagingVacRights(svrRes.data);
  }

  async function transferHoraire() {
    if (!selectedStaging) return;
    const matched = findProdEmployee(selectedStaging);
    if (!matched) { setTransferMsg("Employe non trouve en production"); return; }
    const supabase = createClient();
    // Deactivate old timesheets
    await supabase.from("timesheets").update({ is_active: false, end_date: new Date().toISOString().split("T")[0] }).eq("employee_id", matched.id).eq("is_active", true);
    // Parse and insert new
    const mon = hoursToMinutes(selectedStaging.weekly_hours_lu || "0");
    const tue = hoursToMinutes(selectedStaging.weekly_hours_ma || "0");
    const wed = hoursToMinutes(selectedStaging.weekly_hours_me || "0");
    const thu = hoursToMinutes(selectedStaging.weekly_hours_je || "0");
    const fri = hoursToMinutes(selectedStaging.weekly_hours_ve || "0");
    const ftMin = hoursToMinutes(selectedStaging.full_time_hours || "38") > 0
      ? hoursToMinutes(selectedStaging.full_time_hours || "38") * 5
      : 2280;
    const { error } = await supabase.from("timesheets").insert({
      employee_id: matched.id,
      is_active: true,
      start_date: new Date().toISOString().split("T")[0],
      monday_minutes: mon,
      tuesday_minutes: tue,
      wednesday_minutes: wed,
      thursday_minutes: thu,
      friday_minutes: fri,
      full_time_minutes: ftMin,
    });
    if (error) { setTransferMsg("Erreur: " + error.message); return; }
    setTransferMsg("Horaire transfere avec succes !");
    fetchComparisonData(selectedStaging);
  }

  async function transferDroits() {
    if (!selectedStaging) return;
    const matched = findProdEmployee(selectedStaging);
    if (!matched) { setTransferMsg("Employe non trouve en production"); return; }
    const supabase = createClient();
    // Get absence codes
    const { data: codes } = await supabase.from("absence_codes").select("id, code");
    if (!codes) { setTransferMsg("Erreur: codes absence non trouves"); return; }
    const codeMap = new Map(codes.map((c: { id: number; code: string }) => [c.code.toUpperCase(), c.id]));
    let inserted = 0;
    for (const svr of stagingVacRights) {
      const absCodeId = codeMap.get(svr.code.toUpperCase());
      if (!absCodeId) continue;
      const parsed = parseHours(svr.total_hours || "0");
      const days = svr.total_days ? parseInt(svr.total_days, 10) : 0;
      const { error } = await supabase.from("vacation_rights").upsert({
        employee_id: matched.id,
        absence_code_id: absCodeId,
        year: 2026,
        hours: parsed.hours,
        minutes: parsed.minutes,
        days: isNaN(days) ? 0 : days,
      }, { onConflict: "employee_id,absence_code_id,year" });
      if (!error) inserted++;
    }
    setTransferMsg(`${inserted} droit(s) de conges transfere(s) avec succes !`);
    fetchComparisonData(selectedStaging);
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "organisation", label: "Organisation", icon: <Building2 className="w-4 h-4" /> },
    { id: "secteurs", label: "Secteurs", icon: <Layers className="w-4 h-4" /> },
    { id: "employes", label: "Employes", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Migration des donnees</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Transferer les donnees staging vers les tables de production
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Success message */}
      {transferMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4" />
          {transferMsg}
          <button onClick={() => setTransferMsg(null)} className="ml-auto text-emerald-600 hover:text-emerald-800">x</button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "organisation" && <TabOrganisation />}
      {activeTab === "secteurs" && <TabSecteurs />}
      {activeTab === "employes" && (
        <TabEmployes
          stagingEmployees={stagingEmployees}
          selectedStaging={selectedStaging}
          setSelectedStaging={setSelectedStaging}
          prodEmployees={prodEmployees}
          prodTimesheets={prodTimesheets}
          prodVacRights={prodVacRights}
          stagingVacRights={stagingVacRights}
          findProdEmployee={findProdEmployee}
          transferHoraire={transferHoraire}
          transferDroits={transferDroits}
          loading={loading}
        />
      )}
    </div>
  );
}

// --- Tab Organisation ---
function TabOrganisation() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Verifier la configuration de base</p>
          <p className="text-sm text-blue-700 mt-1">
            Avant de migrer les employes, verifiez que les indexations et les jours feries sont configures.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/remuneration/indexations" className="bg-white border rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Indexations</h3>
              <p className="text-sm text-slate-500 mt-1">Verifier que les indexations sont configurees</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </div>
        </Link>
        <Link href="/settings/holidays" className="bg-white border rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Jours feries</h3>
              <p className="text-sm text-slate-500 mt-1">Verifier que les jours feries existent pour 2026</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </div>
        </Link>
      </div>
    </div>
  );
}

// --- Tab Secteurs ---
function TabSecteurs() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Verifier les secteurs</p>
          <p className="text-sm text-blue-700 mt-1">
            Assurez-vous que les baremes et les droits RTT par secteur sont bien configures.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/settings/rtt-entitlements" className="bg-white border rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Baremes RTT</h3>
              <p className="text-sm text-slate-500 mt-1">Heures RTT par tranche d&apos;age et par secteur</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </div>
        </Link>
        <Link href="/settings/sectors" className="bg-white border rounded-lg p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Secteurs</h3>
              <p className="text-sm text-slate-500 mt-1">Gerer les secteurs et groupes RTT</p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </div>
        </Link>
      </div>
    </div>
  );
}

// --- Tab Employes ---
function TabEmployes({
  stagingEmployees, selectedStaging, setSelectedStaging, prodEmployees,
  prodTimesheets, prodVacRights, stagingVacRights, findProdEmployee,
  transferHoraire, transferDroits, loading,
}: {
  stagingEmployees: StagingEmployee[];
  selectedStaging: StagingEmployee | null;
  setSelectedStaging: (e: StagingEmployee) => void;
  prodEmployees: ProdEmployee[];
  prodTimesheets: ProdTimesheet[];
  prodVacRights: ProdVacRight[];
  stagingVacRights: StagingVacRight[];
  findProdEmployee: (s: StagingEmployee) => ProdEmployee | undefined;
  transferHoraire: () => void;
  transferDroits: () => void;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filtered = stagingEmployees.filter(
    (e) =>
      e.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.first_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT: Employee list */}
      <div className="lg:w-[280px] flex-shrink-0">
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-3 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 text-sm border rounded-md focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              filtered.map((emp) => {
                const matched = findProdEmployee(emp);
                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedStaging(emp)}
                    className={`w-full px-4 py-3 text-left border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
                      selectedStaging?.id === emp.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{emp.last_name} {emp.first_name}</p>
                    <p className="text-xs text-slate-500">{emp.sector_code || "Sans secteur"}</p>
                    {matched ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Trouve</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-amber-600"><Clock className="w-3 h-3" /> Non trouve</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Comparison panel */}
      <div className="flex-1 min-w-0">
        {!selectedStaging ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4">Selectionnez un employe pour comparer les donnees</p>
          </div>
        ) : (
          <ComparisonPanel
            staging={selectedStaging}
            prodEmployee={findProdEmployee(selectedStaging)}
            prodTimesheets={prodTimesheets}
            prodVacRights={prodVacRights}
            stagingVacRights={stagingVacRights}
            transferHoraire={transferHoraire}
            transferDroits={transferDroits}
          />
        )}
      </div>
    </div>
  );
}

// --- Comparison Panel ---
function ComparisonPanel({
  staging, prodEmployee, prodTimesheets, prodVacRights, stagingVacRights,
  transferHoraire, transferDroits,
}: {
  staging: StagingEmployee;
  prodEmployee: ProdEmployee | undefined;
  prodTimesheets: ProdTimesheet[];
  prodVacRights: ProdVacRight[];
  stagingVacRights: StagingVacRight[];
  transferHoraire: () => void;
  transferDroits: () => void;
}) {
  const days = ["Lu", "Ma", "Me", "Je", "Ve"];
  const stagingHours = [
    staging.weekly_hours_lu, staging.weekly_hours_ma, staging.weekly_hours_me,
    staging.weekly_hours_je, staging.weekly_hours_ve,
  ];

  return (
    <div className="space-y-4">
      {!prodEmployee && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Employe non trouve en production (correspondance nom + prenom).
            Creez-le dans la page employes avant de transferer.
          </p>
        </div>
      )}

      {/* Horaire section */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Horaire hebdomadaire
          </h3>
          {prodEmployee && (
            <button onClick={transferHoraire} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowRightLeft className="w-3 h-3" /> Transferer
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Staging</p>
            <div className="grid grid-cols-5 gap-1 text-center">
              {days.map((d, i) => (
                <div key={d}>
                  <p className="text-xs text-slate-400">{d}</p>
                  <p className="text-sm font-medium text-slate-700">{stagingHours[i] || "-"}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Temps plein: {staging.full_time_hours || "-"}h</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Production</p>
            {prodTimesheets.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun horaire</p>
            ) : (
              prodTimesheets.filter(t => t.is_active).map((ts) => (
                <div key={ts.id}>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {[ts.monday_minutes, ts.tuesday_minutes, ts.wednesday_minutes, ts.thursday_minutes, ts.friday_minutes].map((m, i) => (
                      <div key={i}>
                        <p className="text-xs text-slate-400">{days[i]}</p>
                        <p className="text-sm font-medium text-slate-700">{m != null ? `${Math.floor(m/60)}h${(m%60).toString().padStart(2,"0")}` : "-"}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Temps plein: {ts.full_time_minutes ? `${Math.floor(ts.full_time_minutes/60)}h` : "-"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Droits conges section */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Droits de conges 2026
          </h3>
          {prodEmployee && (
            <button onClick={transferDroits} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <ArrowRightLeft className="w-3 h-3" /> Transferer
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Staging</p>
            {stagingVacRights.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun droit</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="pb-1 text-left text-slate-500">Code</th><th className="pb-1 text-left text-slate-500">Heures</th><th className="pb-1 text-left text-slate-500">Jours</th></tr></thead>
                <tbody>
                  {stagingVacRights.map((vr) => (
                    <tr key={vr.id} className="border-b last:border-b-0">
                      <td className="py-1 font-medium text-slate-700">{vr.code}</td>
                      <td className="py-1 text-slate-600">{vr.total_hours || "-"}</td>
                      <td className="py-1 text-slate-600">{vr.total_days || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Production</p>
            {prodVacRights.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun droit</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="pb-1 text-left text-slate-500">Code</th><th className="pb-1 text-left text-slate-500">Heures</th><th className="pb-1 text-left text-slate-500">Jours</th></tr></thead>
                <tbody>
                  {prodVacRights.map((vr) => (
                    <tr key={vr.id} className="border-b last:border-b-0">
                      <td className="py-1 font-medium text-slate-700">{vr.absence_codes?.code || "?"}</td>
                      <td className="py-1 text-slate-600">{vr.hours}h{vr.minutes > 0 ? vr.minutes.toString().padStart(2, "0") : ""}</td>
                      <td className="py-1 text-slate-600">{vr.days || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Non-transferable: Absences mensuelles */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Absences mensuelles</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            Les absences mensuelles ne peuvent pas etre transferees automatiquement car elles necessitent
            une saisie jour par jour dans le calendrier annuel.
          </p>
          <Link href={prodEmployee ? `/employees/${prodEmployee.id}/absences` : "/absences/new"} className="inline-flex items-center gap-1 mt-2 text-sm text-amber-700 hover:text-amber-900 font-medium">
            <ExternalLink className="w-3 h-3" /> Saisir les absences manuellement
          </Link>
        </div>
      </div>

      {/* Non-transferable: Events */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Evenements employe</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            Les evenements (accouchement, fin de contrat, maladie longue, etc.) doivent etre saisis
            manuellement car ils necessitent une validation au cas par cas.
          </p>
          <Link href={prodEmployee ? `/employees/${prodEmployee.id}/edit` : "/employees"} className="inline-flex items-center gap-1 mt-2 text-sm text-amber-700 hover:text-amber-900 font-medium">
            <ExternalLink className="w-3 h-3" /> Gerer les employes
          </Link>
        </div>
      </div>
    </div>
  );
}