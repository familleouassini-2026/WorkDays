"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus, Filter } from "lucide-react";

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
  location_id: number | null;
  sectors?: { name: string } | null;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("employees")
        .select("*, sectors!sector_id(name)")
        .order("last_name", { ascending: true });

      if (error) {
        console.error("Error fetching employees:", error);
        setFetchError("Impossible de charger les employes. Verifiez la connexion.");
      } else if (data) {
        setEmployees(data as unknown as Employee[]);
      }
      setLoading(false);
    }

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.first_name?.toLowerCase().includes(query) ||
      emp.last_name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.job_title?.toLowerCase().includes(query) ||
      emp.sectors?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personnel</h1>
          <p className="text-slate-500 mt-1">
            Gestion des employes et de leurs informations
          </p>
        </div>
        <Link
          href="/employees/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un employe
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, fonction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {fetchError}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-4">Chargement des employes...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500">
              {employees.length === 0
                ? "Aucun employe trouve. Ajoutez votre premier employe pour commencer."
                : "Aucun resultat pour cette recherche."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employe
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Secteur
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fonction
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date d&apos;entree
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  onClick={() => router.push(`/employees/${employee.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {employee.first_name?.[0]}
                          {employee.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 hover:text-primary-600">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {employee.email}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {employee.sectors?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {employee.job_title || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        !employee.is_inactive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {employee.is_inactive ? "Inactif" : "Actif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {employee.date_of_hire
                      ? new Date(employee.date_of_hire).toLocaleDateString("fr-BE")
                      : "—"}
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
