"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Users, CheckCircle2,
  ExternalLink, ArrowRightLeft, Info, Calendar, Clock,
  UserPlus, UserMinus, AlertTriangle,
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


// --- Types ---
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
  hire_date: string | null;
  contract_type: string | null;
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
  is_inactive: boolean;
  sector_id: number | null;
  sectors: { name: string } | null;
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


type TabType = "employes" | "nouveaux" | "desactiver";

export default function DataMigrationPage() {
  const [activeTab, setActiveTab] = useState<TabType>("employes");
  const [stagingEmployees, setStagingEmployees] = useState<StagingEmployee[]>([]);
  const [selectedStaging, setSelectedStaging] = useState<StagingEmployee | null>(null);
  const [prodEmployees, setProdEmployees] = useState<ProdEmployee[]>([]);
  const [prodTimesheets, setProdTimesheets] = useState<ProdTimesheet[]>([]);
  const [prodVacRights, setProdVacRights] = useState<ProdVacRight[]>([]);
  const [stagingVacRights, setStagingVacRights] = useState<StagingVacRight[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferMsg, setTransferMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (selectedStaging) fetchComparisonData(selectedStaging); }, [selectedStaging]);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();
    const [stRes, prodRes] = await Promise.all([
      supabase.from("staging_employees").select("*").order("last_name"),
      supabase.from("employees").select("id, first_name, last_name, is_inactive, sector_id, sectors(name)"),
    ]);
    if (stRes.data) setStagingEmployees(stRes.data);
    if (prodRes.data) setProdEmployees(prodRes.data as unknown as ProdEmployee[]);
    setLoading(false);
  }

  function findProdEmployee(staging: StagingEmployee): ProdEmployee | undefined {
    return prodEmployees.find(
      (p) =>
        p.last_name.toLowerCase() === staging.last_name.toLowerCase() &&
        p.first_name.toLowerCase() === staging.first_name.toLowerCase()
    );
  }


  // Nouveaux employés: in staging but NOT in production
  const newEmployees = stagingEmployees.filter(
    (s) => !s.is_inactive && !findProdEmployee(s)
  );

  // Employés à désactiver: in production (active) but NOT in staging
  const toDeactivate = prodEmployees.filter(
    (p) => !p.is_inactive && !stagingEmployees.find(
      (s) => s.last_name.toLowerCase() === p.last_name.toLowerCase() &&
             s.first_name.toLowerCase() === p.first_name.toLowerCase()
    )
  );

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
    if (!matched) { setTransferMsg("Employé non trouvé en production"); return; }
    const supabase = createClient();
    await supabase.from("timesheets").update({ is_active: false, end_date: new Date().toISOString().split("T")[0] }).eq("employee_id", matched.id).eq("is_active", true);
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
      monday_minutes: mon, tuesday_minutes: tue, wednesday_minutes: wed,
      thursday_minutes: thu, friday_minutes: fri, full_time_minutes: ftMin,
    });
    if (error) { setTransferMsg("Erreur: " + error.message); return; }
    setTransferMsg("✓ Horaire transféré avec succès !");
    fetchComparisonData(selectedStaging);
  }

  async function transferDroits() {
    if (!selectedStaging) return;
    const matched = findProdEmployee(selectedStaging);
    if (!matched) { setTransferMsg("Employé non trouvé en production"); return; }
    const supabase = createClient();
    const { data: codes } = await supabase.from("absence_codes").select("id, code");
    if (!codes) { setTransferMsg("Erreur: codes absence non trouvés"); return; }
    const codeMap = new Map(codes.map((c: { id: number; code: string }) => [c.code.toUpperCase(), c.id]));
    let inserted = 0;
    for (const svr of stagingVacRights) {
      const absCodeId = codeMap.get(svr.code.toUpperCase());
      if (!absCodeId) continue;
      const parsed = parseHours(svr.total_hours || "0");
      const days = svr.total_days ? parseInt(svr.total_days, 10) : 0;
      const { error } = await supabase.from("vacation_rights").upsert({
        employee_id: matched.id, absence_code_id: absCodeId, year: 2026,
        hours: parsed.hours, minutes: parsed.minutes, days: isNaN(days) ? 0 : days,
      }, { onConflict: "employee_id,absence_code_id,year" });
      if (!error) inserted++;
    }
    setTransferMsg(`✓ ${inserted} droit(s) de congés transféré(s) avec succès !`);
    fetchComparisonData(selectedStaging);
  }


  async function addNewEmployee(staging: StagingEmployee) {
    setActionLoading(staging.id);
    const supabase = createClient();
    const { error } = await supabase.from("employees").insert({
      first_name: staging.first_name,
      last_name: staging.last_name,
      date_of_hire: staging.hire_date || null,
      contract_type: staging.contract_type || null,
      is_inactive: false,
    });
    if (error) {
      setTransferMsg("Erreur: " + error.message);
    } else {
      setTransferMsg(`✓ ${staging.first_name} ${staging.last_name} ajouté(e) et activé(e) !`);
      await fetchData();
    }
    setActionLoading(null);
  }

  async function addAllNewEmployees() {
    setActionLoading(-1);
    const supabase = createClient();
    const toInsert = newEmployees.map((s) => ({
      first_name: s.first_name,
      last_name: s.last_name,
      date_of_hire: s.hire_date || null,
      contract_type: s.contract_type || null,
      is_inactive: false,
    }));
    const { error } = await supabase.from("employees").insert(toInsert);
    if (error) {
      setTransferMsg("Erreur: " + error.message);
    } else {
      setTransferMsg(`✓ ${toInsert.length} employé(s) ajouté(s) et activé(s) !`);
      await fetchData();
    }
    setActionLoading(null);
  }

  async function deactivateEmployee(emp: ProdEmployee) {
    setActionLoading(emp.id);
    const supabase = createClient();
    const { error } = await supabase.from("employees").update({ is_inactive: true }).eq("id", emp.id);
    if (error) {
      setTransferMsg("Erreur: " + error.message);
    } else {
      setTransferMsg(`✓ ${emp.first_name} ${emp.last_name} désactivé(e) !`);
      await fetchData();
    }
    setActionLoading(null);
  }


  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "employes", label: "Employés", icon: <Users className="w-4 h-4" />, count: stagingEmployees.filter(s => !!findProdEmployee(s)).length },
    { id: "nouveaux", label: "Nouveaux employés", icon: <UserPlus className="w-4 h-4" />, count: newEmployees.length },
    { id: "desactiver", label: "À désactiver", icon: <UserMinus className="w-4 h-4" />, count: toDeactivate.length },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Migration des données</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Transférer les données staging vers les tables de production
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
            {tab.count !== undefined && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>


      {/* Success/Error message */}
      {transferMsg && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          transferMsg.startsWith("Erreur") || transferMsg.startsWith("✗")
            ? "bg-red-50 border border-red-200 text-red-800"
            : "bg-emerald-50 border border-emerald-200 text-emerald-800"
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {transferMsg}
          <button onClick={() => setTransferMsg(null)} className="ml-auto hover:opacity-70">×</button>
        </div>
      )}

      {/* Tab Content */}
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
      {activeTab === "nouveaux" && (
        <TabNouveaux
          newEmployees={newEmployees}
          addNewEmployee={addNewEmployee}
          addAllNewEmployees={addAllNewEmployees}
          actionLoading={actionLoading}
          loading={loading}
        />
      )}
      {activeTab === "desactiver" && (
        <TabDesactiver
          toDeactivate={toDeactivate}
          deactivateEmployee={deactivateEmployee}
          actionLoading={actionLoading}
          loading={loading}
        />
      )}
    </div>
  );
}


// --- Tab Nouveaux Employés ---
function TabNouveaux({
  newEmployees, addNewEmployee, addAllNewEmployees, actionLoading, loading,
}: {
  newEmployees: StagingEmployee[];
  addNewEmployee: (s: StagingEmployee) => void;
  addAllNewEmployees: () => void;
  actionLoading: number | null;
  loading: boolean;
}) {
  if (loading) return <div className="p-6 text-center"><div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>;

  if (newEmployees.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto" />
        <p className="text-slate-600 mt-4 font-medium">Tous les employés staging sont déjà en production</p>
        <p className="text-slate-400 text-sm mt-1">Aucun nouvel employé à ajouter</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <UserPlus className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">
            {newEmployees.length} employé(s) présent(s) dans staging mais absent(s) en production
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Ces employés seront créés avec les informations de base. Vous pourrez compléter leur fiche ensuite.
          </p>
        </div>
        <button
          onClick={addAllNewEmployees}
          disabled={actionLoading !== null}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" /> Ajouter tous
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date embauche</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {newEmployees.map((emp) => (
              <tr key={emp.id} className="border-b last:border-b-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{emp.last_name} {emp.first_name}</td>
                <td className="px-4 py-3 text-slate-600">{emp.sector_code || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{emp.hire_date || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => addNewEmployee(emp)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === emp.id ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    Ajouter et activer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// --- Tab Employés à désactiver ---
function TabDesactiver({
  toDeactivate, deactivateEmployee, actionLoading, loading,
}: {
  toDeactivate: ProdEmployee[];
  deactivateEmployee: (e: ProdEmployee) => void;
  actionLoading: number | null;
  loading: boolean;
}) {
  if (loading) return <div className="p-6 text-center"><div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>;

  if (toDeactivate.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto" />
        <p className="text-slate-600 mt-4 font-medium">Tous les employés actifs sont présents dans staging</p>
        <p className="text-slate-400 text-sm mt-1">Aucun employé à désactiver</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            {toDeactivate.length} employé(s) actif(s) en production mais absent(s) du staging
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Ces employés ont probablement quitté l&apos;organisation. Désactiver = is_inactive = true (données conservées).
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Nom</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {toDeactivate.map((emp) => (
              <tr key={emp.id} className="border-b last:border-b-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{emp.last_name} {emp.first_name}</td>
                <td className="px-4 py-3 text-slate-600">{emp.sectors?.name || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deactivateEmployee(emp)}
                    disabled={actionLoading !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === emp.id ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <UserMinus className="w-3 h-3" />
                    )}
                    Désactiver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// --- Tab Employes (existing matching + transfers) ---
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
  // Only show staging employees that HAVE a match in production
  const matched = stagingEmployees.filter((s) => !!findProdEmployee(s));
  const filtered = matched.filter(
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
            <p className="text-xs text-slate-400 mt-1">{filtered.length} employé(s) avec correspondance</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
              </div>
            ) : (
              filtered.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedStaging(emp)}
                  className={`w-full px-4 py-3 text-left border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
                    selectedStaging?.id === emp.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{emp.last_name} {emp.first_name}</p>
                  <p className="text-xs text-slate-500">{emp.sector_code || "Sans secteur"}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Correspondance trouvée
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Comparison panel */}
      <div className="flex-1 min-w-0">
        {!selectedStaging ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-500 mt-4">Sélectionnez un employé pour comparer et transférer</p>
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
  const activeTs = prodTimesheets.find(t => t.is_active);

  return (
    <div className="space-y-4">
      {/* Horaire section */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Horaire hebdomadaire
          </h3>
          {prodEmployee && (
            <button onClick={transferHoraire} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowRightLeft className="w-3 h-3" /> Transférer
            </button>
          )}
        </div>

        {/* Staging data */}
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Données staging</p>
          <div className="grid grid-cols-5 gap-1 text-center bg-slate-50 rounded-lg p-3">
            {days.map((d, i) => (
              <div key={d}>
                <p className="text-xs text-slate-400">{d}</p>
                <p className="text-sm font-medium text-slate-700">{stagingHours[i] || "-"}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Temps plein: {staging.full_time_hours || "-"}h</p>
        </div>

        {/* Production data card */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-emerald-600 mb-2 uppercase tracking-wide flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Données production actuelles
          </p>
          {!activeTs ? (
            <p className="text-xs text-slate-400 italic">Aucun horaire actif en production</p>
          ) : (
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="grid grid-cols-5 gap-1 text-center">
                {[activeTs.monday_minutes, activeTs.tuesday_minutes, activeTs.wednesday_minutes, activeTs.thursday_minutes, activeTs.friday_minutes].map((m, i) => (
                  <div key={i}>
                    <p className="text-xs text-emerald-500">{days[i]}</p>
                    <p className="text-sm font-medium text-emerald-800">{m != null ? `${Math.floor(m/60)}h${(m%60).toString().padStart(2,"0")}` : "-"}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-600 mt-2">Temps plein: {activeTs.full_time_minutes ? `${Math.floor(activeTs.full_time_minutes/60)}h` : "-"}</p>
            </div>
          )}
          {prodEmployee && (
            <Link href={`/employees/${prodEmployee.id}/timesheets`} className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700">
              <ExternalLink className="w-3 h-3" /> Gérer manuellement
            </Link>
          )}
        </div>
      </div>


      {/* Droits conges section */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Droits de congés 2026
          </h3>
          {prodEmployee && (
            <button onClick={transferDroits} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <ArrowRightLeft className="w-3 h-3" /> Transférer
            </button>
          )}
        </div>

        {/* Staging data */}
        <div className="mb-4">
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Données staging</p>
          {stagingVacRights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Aucun droit dans staging</p>
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

        {/* Production data card */}
        <div className="border-t pt-4">
          <p className="text-xs font-medium text-emerald-600 mb-2 uppercase tracking-wide flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Données production actuelles
          </p>
          {prodVacRights.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Aucun droit en production pour 2026</p>
          ) : (
            <div className="bg-emerald-50 rounded-lg p-3">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-emerald-200"><th className="pb-1 text-left text-emerald-600">Code</th><th className="pb-1 text-left text-emerald-600">Heures</th><th className="pb-1 text-left text-emerald-600">Jours</th></tr></thead>
                <tbody>
                  {prodVacRights.map((vr) => (
                    <tr key={vr.id} className="border-b border-emerald-100 last:border-b-0">
                      <td className="py-1 font-medium text-emerald-800">{vr.absence_codes?.code || "?"}</td>
                      <td className="py-1 text-emerald-700">{vr.hours}h{vr.minutes > 0 ? vr.minutes.toString().padStart(2, "0") : ""}</td>
                      <td className="py-1 text-emerald-700">{vr.days || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {prodEmployee && (
            <Link href={`/employees/${prodEmployee.id}/vacation-rights`} className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700">
              <ExternalLink className="w-3 h-3" /> Gérer manuellement
            </Link>
          )}
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
            Les absences mensuelles nécessitent une saisie jour par jour dans le calendrier annuel.
          </p>
          {prodEmployee && (
            <Link href={`/employees/${prodEmployee.id}/absences`} className="inline-flex items-center gap-1 mt-2 text-sm text-amber-700 hover:text-amber-900 font-medium">
              <ExternalLink className="w-3 h-3" /> Saisir les absences manuellement
            </Link>
          )}
        </div>
      </div>

      {/* Non-transferable: Events */}
      <div className="bg-white border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-slate-900">Événements employé</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            Les événements (accouchement, fin de contrat, maladie longue, etc.) doivent être saisis
            manuellement car ils nécessitent une validation au cas par cas.
          </p>
          {prodEmployee && (
            <Link href={`/employees/${prodEmployee.id}/edit`} className="inline-flex items-center gap-1 mt-2 text-sm text-amber-700 hover:text-amber-900 font-medium">
              <ExternalLink className="w-3 h-3" /> Gérer les données employé
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
