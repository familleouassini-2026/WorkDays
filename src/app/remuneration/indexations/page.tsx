"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TableProperties, TrendingUp, Calculator, Building2, Briefcase } from "lucide-react";

interface OrgIndexation {
  id: number;
  organisation_id: number;
  indexation_value: number;
  indexation_date: string;
}

interface SectorIndexation {
  id: number;
  sector_id: number;
  indexation_value: number;
  indexation_date: string;
  sectors: { name: string } | null;
}

interface CombinedIndexation {
  id: string;
  type: "organisation" | "secteur";
  value: number;
  date: string;
  label: string;
}

export default function IndexationsPage() {
  const [orgIndexations, setOrgIndexations] = useState<OrgIndexation[]>([]);
  const [sectorIndexations, setSectorIndexations] = useState<SectorIndexation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [orgRes, sectorRes] = await Promise.all([
        supabase
          .from("organisation_indexations")
          .select("*")
          .order("indexation_date", { ascending: false }),
        supabase
          .from("sector_indexations")
          .select("*, sectors(name)")
          .order("indexation_date", { ascending: false }),
      ]);

      if (orgRes.data) setOrgIndexations(orgRes.data);
      if (sectorRes.data) setSectorIndexations(sectorRes.data as unknown as SectorIndexation[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Calculate cumulative indexation factor
  const cumulativeOrgFactor = orgIndexations.reduce(
    (acc, idx) => acc * Number(idx.indexation_value),
    1
  );

  const cumulativeSectorFactors: Record<string, number> = {};
  sectorIndexations.forEach((idx) => {
    const sectorName = idx.sectors?.name || "Inconnu";
    if (!cumulativeSectorFactors[sectorName]) {
      cumulativeSectorFactors[sectorName] = 1;
    }
    cumulativeSectorFactors[sectorName] *= Number(idx.indexation_value);
  });

  // Combined list for chronological display
  const combined: CombinedIndexation[] = [
    ...orgIndexations.map((o) => ({
      id: `org-${o.id}`,
      type: "organisation" as const,
      value: Number(o.indexation_value),
      date: o.indexation_date,
      label: "Organisation",
    })),
    ...sectorIndexations.map((s) => ({
      id: `sector-${s.id}`,
      type: "secteur" as const,
      value: Number(s.indexation_value),
      date: s.indexation_date,
      label: s.sectors?.name || "Secteur inconnu",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Indexations</h1>
        <p className="text-slate-500 mt-1">
          Historique des indexations et facteur cumulatif
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2">
        <Link
          href="/remuneration/baremes"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        >
          <TableProperties className="w-4 h-4" />
          Baremes
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
          <TrendingUp className="w-4 h-4" />
          Indexations
        </span>
        <Link
          href="/remuneration/simulateur"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
        >
          <Calculator className="w-4 h-4" />
          Simulateur
        </Link>
      </div>

      {/* Cumulative factors */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Facteur organisation
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {cumulativeOrgFactor.toFixed(6)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Base sur {orgIndexations.length} indexation{orgIndexations.length > 1 ? "s" : ""}
            </p>
          </div>

          {Object.entries(cumulativeSectorFactors).map(([sectorName, factor]) => (
            <div
              key={sectorName}
              className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  {sectorName}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {factor.toFixed(6)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Facteur sectoriel cumulatif
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement des indexations...</p>
        </div>
      ) : combined.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune indexation enregistree.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-600 font-medium">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">
                  Perimetre
                </th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">
                  Valeur
                </th>
              </tr>
            </thead>
            <tbody>
              {combined.map((idx) => (
                <tr
                  key={idx.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-slate-900">
                    {new Date(idx.date).toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        idx.type === "organisation"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {idx.type === "organisation" ? "Organisation" : "Secteur"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{idx.label}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    {idx.value.toFixed(6)}
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
