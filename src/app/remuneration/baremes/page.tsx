"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TableProperties, TrendingUp, Calculator, Filter } from "lucide-react";

interface SeniorityScale {
  id: number;
  years: number;
  base_salary: number;
  sectors: { id: number; name: string; code_bareme: string | null } | null;
}

interface Sector {
  id: number;
  name: string;
  code_bareme: string | null;
}

export default function BaremesPage() {
  const [scales, setScales] = useState<SeniorityScale[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [scalesRes, sectorsRes] = await Promise.all([
        supabase
          .from("seniority_scales")
          .select("id, years, base_salary, sectors(id, name, code_bareme)")
          .order("years", { ascending: true }),
        supabase.from("sectors").select("id, name, code_bareme").order("name"),
      ]);

      if (scalesRes.data) setScales(scalesRes.data as unknown as SeniorityScale[]);
      if (sectorsRes.data) setSectors(sectorsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredScales = selectedSector
    ? scales.filter((s) => s.sectors?.id === Number(selectedSector))
    : scales;

  // Group by sector
  const grouped = filteredScales.reduce<Record<string, SeniorityScale[]>>(
    (acc, scale) => {
      const sectorName = scale.sectors?.name || "Sans secteur";
      if (!acc[sectorName]) acc[sectorName] = [];
      acc[sectorName].push(scale);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Baremes salariaux</h1>
        <p className="text-slate-500 mt-1">
          Echelles salariales par secteur et anciennete
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
          <TableProperties className="w-4 h-4" />
          Baremes
        </span>
        <Link
          href="/remuneration/indexations"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          Indexations
        </Link>
        <Link
          href="/remuneration/simulateur"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        >
          <Calculator className="w-4 h-4" />
          Simulateur
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les secteurs</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.code_bareme ? `(${s.code_bareme})` : ""}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {filteredScales.length} echelon{filteredScales.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement des baremes...</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <TableProperties className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun bareme trouve.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sectorName, entries]) => (
              <div key={sectorName} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {sectorName}
                    {entries[0]?.sectors?.code_bareme && (
                      <span className="ml-2 text-xs text-slate-500 font-normal">
                        Code: {entries[0].sectors.code_bareme}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-4 py-2 text-slate-600 font-medium">
                          Anciennete (annees)
                        </th>
                        <th className="text-right px-4 py-2 text-slate-600 font-medium">
                          Salaire de base (EUR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries
                        .sort((a, b) => a.years - b.years)
                        .map((scale) => (
                          <tr
                            key={scale.id}
                            className="border-b border-slate-50 hover:bg-slate-50"
                          >
                            <td className="px-4 py-2 text-slate-900">
                              {scale.years} an{scale.years > 1 ? "s" : ""}
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-slate-900">
                              {Number(scale.base_salary).toLocaleString("fr-BE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              EUR
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
