"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus, X } from "lucide-react";

interface Employee {
  id: number;
  title: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  job_title: string | null;
  contract_type: string | null;
  date_of_hire: string | null;
  is_inactive: boolean;
  mobile_phone: string | null;
  sector_id: number | null;
  sectors?: { name: string } | null;
}

interface Sector {
  id: number;
  name: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");
  const [contractFilter, setContractFilter] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [empRes, secRes] = await Promise.all([
        supabase.from("employees").select("*, sectors(name)").order("last_name"),
        supabase.from("sectors").select("id, name").order("name"),
      ]);

      if (empRes.error) {
        const { data: fallback } = await supabase.from("employees").select("*").order("last_name");
        if (fallback) setEmployees(fallback as unknown as Employee[]);
        else setFetchError("Impossible de charger les employés.");
      } else if (empRes.data) {
        setEmployees(empRes.data as unknown as Employee[]);
      }
      if (secRes.data) setSectors(secRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    // Text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        emp.first_name?.toLowerCase().includes(q) ||
        emp.last_name?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q) ||
        emp.job_title?.toLowerCase().includes(q) ||
        emp.mobile_phone?.includes(q) ||
        emp.sectors?.name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Sector filter
    if (sectorFilter) {
      if (sectorFilter === "none") {
        if (emp.sector_id !== null) return false;
      } else if (String(emp.sector_id) !== sectorFilter) return false;
    }
    // Status filter
    if (statusFilter === "active" && emp.is_inactive) return false;
    if (statusFilter === "inactive" && !emp.is_inactive) return false;
    // Contract filter
    if (contractFilter && emp.contract_type !== contractFilter) return false;
    return true;
  });

  const hasFilters = searchQuery || sectorFilter || statusFilter !== "all" || contractFilter;

  function clearFilters() {
    setSearchQuery("");
    setSectorFilter("");
    setStatusFilter("all");
    setContractFilter("");
  }

  // Get unique contract types from data
  const contractTypes = Array.from(new Set(employees.map((e) => e.contract_type).filter(Boolean))) as string[];

  async function handleSectorChange(empId: number, sectorId: number | null) {
    const supabase = createClient();
    await supabase.from("employees").update({ sector_id: sectorId }).eq("id", empId);
    // Update local state optimistically
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === empId
          ? { ...e, sector_id: sectorId, sectors: sectorId ? sectors.find((s) => s.id === sectorId) ? { name: sectors.find((s) => s.id === sectorId)!.name } : null : null }
          : e
      )
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personnel</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {filteredEmployees.length} employé{filteredEmployees.length > 1 ? "s" : ""}
            {hasFilters ? ` (sur ${employees.length} total)` : ""}
          </p>
        </div>
        <Link href="/employees/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, fonction, téléphone, secteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tous les secteurs</option>
            <option value="none">Sans secteur</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {([["all", "Tous"], ["active", "Actifs"], ["inactive", "Inactifs"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === val ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tous les contrats</option>
            {contractTypes.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" /> Effacer filtres
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{fetchError}</div>
      )}

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-4">Chargement...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">
              {employees.length === 0
                ? "Aucun employé. Ajoutez votre premier employé pour commencer."
                : "Aucun résultat pour ces filtres."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employé</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Secteur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Contrat</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">Entrée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => router.push(`/employees/${emp.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{emp.last_name} {emp.first_name}</p>
                        <p className="text-xs text-slate-500 truncate">{emp.job_title || emp.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={emp.sector_id || ""}
                      onChange={(e) => handleSectorChange(emp.id, e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-1 py-0.5 border-0 bg-transparent text-sm text-slate-600 hover:bg-slate-100 rounded cursor-pointer focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="">— Non assigné —</option>
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">
                    {emp.contract_type || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      !emp.is_inactive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {emp.is_inactive ? "Inactif" : "Actif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">
                    {emp.date_of_hire ? new Date(emp.date_of_hire).toLocaleDateString("fr-BE") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
