"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp } from "lucide-react";

interface Indexation {
  id: number;
  effective_date: string;
  coefficient: number;
}

export default function IndexationsPage() {
  const [indexations, setIndexations] = useState<Indexation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("salary_indexations")
        .select("id, effective_date, coefficient")
        .order("effective_date", { ascending: true });
      if (data) setIndexations(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Calculate cumulative factor
  function getCumulativeFactor(index: number): number {
    let factor = 1;
    for (let i = 0; i <= index; i++) {
      factor *= indexations[i].coefficient;
    }
    return factor;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Historique des indexations
        </h1>
        <p className="text-slate-500 mt-1">
          Evolution des coefficients d&apos;indexation salariale
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : indexations.length === 0 ? (
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
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Coefficient
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Facteur cumule
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indexations.map((idx, i) => (
                <tr key={idx.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                    {new Date(idx.effective_date + "T00:00:00").toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-right">
                    {idx.coefficient.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900 font-medium text-right">
                    {getCumulativeFactor(i).toFixed(4)}
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
