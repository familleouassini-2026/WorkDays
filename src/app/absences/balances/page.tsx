"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

interface VacationRight {
  id: number;
  employee_id: number;
  absence_code_id: number;
  year: number;
  days: number | null;
  hours: number | null;
  minutes: number | null;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  text_color_hex: string | null;
  time_unit: string;
}

interface UsedEntry {
  employee_id: number;
  absence_code_id: number;
  total_days: number;
  total_minutes: number;
}

interface BalanceRow {
  employee: Employee;
  absenceCode: AbsenceCode;
  entitled_days: number;
  entitled_minutes: number;
  used_days: number;
  used_minutes: number;
  remaining_days: number;
  remaining_minutes: number;
}

export default function AbsencesBalancesPage() {
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const [empRes, codesRes, rightsRes, usedRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase.from("absence_codes").select("*").order("sort_order"),
        supabase
          .from("vacation_rights")
          .select("*")
          .eq("year", selectedYear),
        supabase
          .from("year_calendar")
          .select("employee_id, absence_code_id, absence_days, absence_minutes")
          .eq("year", selectedYear),
      ]);

      const employees: Employee[] = empRes.data || [];
      const codes: AbsenceCode[] = codesRes.data || [];
      const rights: VacationRight[] = rightsRes.data || [];
      const usedRaw = usedRes.data || [];

      setAbsenceCodes(codes);

      // Aggregate used values
      const usedMap: Record<string, UsedEntry> = {};
      usedRaw.forEach((entry: { employee_id: number; absence_code_id: number; absence_days: number | null; absence_minutes: number | null }) => {
        const key = `${entry.employee_id}-${entry.absence_code_id}`;
        if (!usedMap[key]) {
          usedMap[key] = {
            employee_id: entry.employee_id,
            absence_code_id: entry.absence_code_id,
            total_days: 0,
            total_minutes: 0,
          };
        }
        usedMap[key].total_days += entry.absence_days || 0;
        usedMap[key].total_minutes += entry.absence_minutes || 0;
      });

      // Build balance rows
      const rows: BalanceRow[] = [];
      rights.forEach((right) => {
        const employee = employees.find((e) => e.id === right.employee_id);
        const code = codes.find((c) => c.id === right.absence_code_id);
        if (!employee || !code) return;

        const key = `${right.employee_id}-${right.absence_code_id}`;
        const used = usedMap[key];

        const entitledDays = right.days || 0;
        const entitledMinutes = (right.hours || 0) * 60 + (right.minutes || 0);
        const usedDays = used?.total_days || 0;
        const usedMinutes = used?.total_minutes || 0;

        rows.push({
          employee,
          absenceCode: code,
          entitled_days: entitledDays,
          entitled_minutes: entitledMinutes,
          used_days: usedDays,
          used_minutes: usedMinutes,
          remaining_days: entitledDays - usedDays,
          remaining_minutes: entitledMinutes - usedMinutes,
        });
      });

      setBalances(rows);
      setLoading(false);
    }
    fetchData();
  }, [selectedYear]);

  function formatMinutes(m: number): string {
    if (m === 0) return "0h00";
    const h = Math.floor(Math.abs(m) / 60);
    const min = Math.abs(m) % 60;
    const sign = m < 0 ? "-" : "";
    return `${sign}${h}h${String(min).padStart(2, "0")}`;
  }

  function formatDays(d: number): string {
    return `${Math.round(d * 100) / 100}j`;
  }

  const filteredBalances = balances.filter((b) => {
    const nameMatch =
      !searchQuery ||
      `${b.employee.first_name} ${b.employee.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const codeMatch =
      !selectedCode || b.absenceCode.code === selectedCode;
    return nameMatch && codeMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Soldes de conges
          </h1>
          <p className="text-slate-500 mt-1">
            Droits, utilisation et soldes restants par employe
          </p>
        </div>
        <Link
          href="/absences"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Retour a la liste
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher un employe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {[2025, 2024, 2023, 2022].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tous les types</option>
            {absenceCodes.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code} - {c.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement des soldes...</p>
        </div>
      ) : filteredBalances.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucun droit de conge trouve pour {selectedYear}.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Employe
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Type
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Droit
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Utilise
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-700">
                    Solde
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBalances.map((row, idx) => {
                  const isTimeUnit =
                    row.absenceCode.time_unit === "HOURS_MINUTES";
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.employee.last_name}, {row.employee.first_name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              row.absenceCode.color_hex || "#e2e8f0",
                            color:
                              row.absenceCode.text_color_hex || "#1e293b",
                          }}
                        >
                          {row.absenceCode.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {isTimeUnit
                          ? formatMinutes(row.entitled_minutes)
                          : formatDays(row.entitled_days)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {isTimeUnit
                          ? formatMinutes(row.used_minutes)
                          : formatDays(row.used_days)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          (isTimeUnit
                            ? row.remaining_minutes
                            : row.remaining_days) < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {isTimeUnit
                          ? formatMinutes(row.remaining_minutes)
                          : formatDays(row.remaining_days)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
