"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Building2, Layers } from "lucide-react";

interface Indexation {
  id: number;
  indexation_value: number;
  indexation_date: string;
  scope: "org" | "sector";
  sector_name?: string;
}

export default function IndexationsPage() {
  const [indexations, setIndexations] = useState<Indexation[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"org" | "sector" | "all">("all");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [orgRes, secRes] = await Promise.all([
        supabase
          .from("organisation_indexations")
          .select("id, indexation_value, indexation_date")
          .order("indexation_date", { ascending: true }),
        supabase
          .from("sector_indexations")
          .select("id, indexation_value, indexation_date, sector_id, sectors(name)")
          .order("indexation_date", { ascending: true }),
      ]);

      const all: Indexation[] = [];

      if (orgRes.data) {
        for (const row of orgRes.data) {
          all.push({
            id: row.id,
            indexation_value: row.indexation_value,
            indexation_date: row.indexation_date,
            scope: "org",
          });
        }
      }

      if (secRes.data) {
        for (const row of secRes.data as any[]) {
          all.push({
            id: row.id + 10000, // Avoid ID collision in key
            indexation_value: row.indexation_value,
            indexation_date: row.indexation_date,
            scope: "sector",
            sector_name: row.sectors?.name || `Secteur ${row.sector_id}`,
          });
        }
      }

      // Sort by date
      all.sort((a, b) => a.indexation_date.localeCompare(b.indexation_date));
      setIndexations(all);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter by view
  const filtered =
    view === "all"
      ? indexations
      : indexations.filter((i) => i.scope === view);

  // Calculate cumulative factor for org indexations
  const orgIndexations = indexations.filter((i) => i.scope === "org");
  const orgCumulativeFactor = orgIndexations.reduce(
    (acc, idx) => acc * idx.indexation_value,
    1
  );

  function getCumulativeFactor(index: number, scope: "org" | "sector"): number {
    const scoped = filtered.filter((i) => i.scope === scope);
    let factor = 1;
    for (let i = 0; i <= index; i++) {
      if (scoped[i]) factor *= scoped[i].indexation_value;
    }
    return factor;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Historique des indexations
          </h1>
          <p className="text-slate-500 mt-1">
            Indexations organisation et sectorielles — facteur cumule
          </p>
        </div>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(
            [
              { key: "all", label: "Toutes", icon: TrendingUp },
              { key: "org", label: "Organisation", icon: Building2 },
              { key: "sector", label: "Sectorielles", icon: Layers },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
                view === opt.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <opt.icon className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">
            Indexations org
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {orgIndexations.length}
          </p>
          <p className="text-xs text-slate-500">
            Facteur cumule : {orgCumulativeFactor.toFixed(6)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">
            Indexations sectorielles
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {indexations.filter((i) => i.scope === "sector").length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">
            Total enregistrees
          </p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {indexations.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucune indexation enregistree.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Date d&apos;effet
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Scope
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Secteur
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Coefficient
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((idx) => (
                <tr key={`${idx.scope}-${idx.id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {new Date(
                      idx.indexation_date + "T00:00:00"
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        idx.scope === "org"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {idx.scope === "org" ? "Org" : "Secteur"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {idx.scope === "sector" ? idx.sector_name : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-mono text-right">
                    {idx.indexation_value.toFixed(6)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
