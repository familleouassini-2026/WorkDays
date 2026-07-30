"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen } from "lucide-react";

interface SeniorityScale {
  id: number;
  min_seniority: number;
  max_seniority: number;
  base_amount: number;
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
          .select("id, min_seniority, max_seniority, base_amount, sectors(name)")
          .order("min_seniority"),
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Secteur
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Anciennete min (ans)
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Anciennete max (ans)
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Montant base
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScales.map((scale) => (
                <tr key={scale.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {scale.sectors?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">
                    {scale.min_seniority}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">
                    {scale.max_seniority}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium text-right">
                    {scale.base_amount.toLocaleString("fr-BE", {
                      style: "currency",
                      currency: "EUR",
                    })}
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
