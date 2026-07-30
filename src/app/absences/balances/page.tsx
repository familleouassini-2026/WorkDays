"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3 } from "lucide-react";

interface BalanceRow {
  employee_name: string;
  code: string;
  label: string;
  default_days: number | null;
  used: number;
}

export default function AbsenceBalancesPage() {
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    async function fetchBalances() {
      setLoading(true);
      const supabase = createClient();

      const { data } = await supabase
        .from("holiday_selections")
        .select(
          "duration, employee_id, absence_code_id, start_date, employees(first_name, last_name), absence_codes(code, label, default_days)"
        )
        .gte("start_date", `${selectedYear}-01-01`)
        .lte("start_date", `${selectedYear}-12-31`);

      if (data) {
        // Group by employee + absence code
        const grouped: Record<string, BalanceRow> = {};
        for (const row of data as any[]) {
          const emp = row.employees;
          const code = row.absence_codes;
          if (!emp || !code) continue;
          const key = `${row.employee_id}-${row.absence_code_id}`;
          if (!grouped[key]) {
            grouped[key] = {
              employee_name: `${emp.last_name}, ${emp.first_name}`,
              code: code.code,
              label: code.label,
              default_days: code.default_days,
              used: 0,
            };
          }
          grouped[key].used += row.duration || 0;
        }
        setBalances(Object.values(grouped));
      }
      setLoading(false);
    }
    fetchBalances();
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Soldes de conges
          </h1>
          <p className="text-slate-500 mt-1">
            Droits et consommation par employe
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : balances.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucune donnee pour l&apos;annee {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Employe
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Code absence
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Droit (jours/an)
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Utilise
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Solde restant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map((row, idx) => {
                const remaining =
                  row.default_days != null
                    ? row.default_days - row.used
                    : null;
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                      {row.employee_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {row.code} - {row.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {row.default_days != null ? row.default_days : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">
                      {row.used}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-medium text-right ${
                        remaining !== null && remaining < 0
                          ? "text-red-600"
                          : remaining !== null && remaining <= 3
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {remaining !== null ? remaining : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
