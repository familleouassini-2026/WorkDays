"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen } from "lucide-react";

interface SeniorityScale {
  id: number;
  sector_id: number;
  years: number;
  base_salary: number;
  sectors: { name: string } | null;
}

interface Sector {
  id: number;
  name: string;
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
          .select("id, sector_id, years, base_salary, sectors(name)")
          .order("sector_id")
          .order("years"),
        supabase.from("sectors").select("id, name").order("name"),
      ]);
      if (scalesRes.data) setScales(scalesRes.data as unknown as SeniorityScale[]);
      if (sectorsRes.data) setSectors(sectorsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredScales = selectedSector
    ? scales.filter((s) => s.sectors?.name === selectedSector)
    : scales;

  // Group by sector for better display
  const groupedBySector: Record<string, SeniorityScale[]> = {};
  filteredScales.forEach((scale) => {
    const sectorName = scale.sectors?.name || "Sans secteur";
    if (!groupedBySector[sectorName]) groupedBySector[sectorName] = [];
    groupedBySector[sectorName].push(scale);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Baremes salariaux
          </h1>
          <p className="text-slate-500 mt-1">
            Grilles de remuneration par secteur et anciennete
          </p>
        </div>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tous les secteurs</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : filteredScales.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun bareme trouve.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBySector).map(([sectorName, sectorScales]) => (
            <div key={sectorName} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">{sectorName}</h3>
                <p className="text-xs text-slate-500">{sectorScales.length} palier{sectorScales.length > 1 ? "s" : ""}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Anciennete (ans)
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Salaire de base
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectorScales.map((scale) => (
                      <tr key={scale.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-700">
                          {scale.years} an{scale.years > 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                          {scale.base_salary.toLocaleString("fr-BE", {
                            style: "currency",
                            currency: "EUR",
                          })}
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
