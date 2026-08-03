"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CalendarDays, Plus, Filter, List, Calendar, BarChart3, Zap } from "lucide-react";
import Link from "next/link";

interface AbsenceEntry {
  id: number;
  absence_date: string;
  year: number;
  absence_minutes: number | null;
  absence_days: number | null;
  reason: string | null;
  employees: { first_name: string; last_name: string } | null;
  absence_codes: { code: string; description: string; color_hex: string | null } | null;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
}

function minutesToHM(m: number | null) {
  if (!m) return "";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

const tabs = [
  { label: "Liste", href: "/absences", icon: List },
  { label: "Calendrier", href: "/absences/calendar", icon: Calendar },
  { label: "Calendrier annuel", href: "/absences/annual", icon: Calendar },
  { label: "Soldes", href: "/absences/balances", icon: BarChart3 },
  { label: "Absenteisme", href: "/absences/absenteeism", icon: BarChart3 },
  { label: "Nouvelle absence", href: "/absences/new", icon: Plus },
  { label: "Encodeur", href: "/absences/encoder", icon: Zap },
];

export default function AbsencesPage() {
  const [absences, setAbsences] = useState<AbsenceEntry[]>([]);
  const [codes, setCodes] = useState<AbsenceCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const [absRes, codesRes] = await Promise.all([
        supabase
          .from("year_calendar")
          .select("*, employees(first_name, last_name), absence_codes(code, description, color_hex)")
          .eq("year", selectedYear)
          .order("absence_date", { ascending: false })
          .limit(200),
        supabase.from("absence_codes").select("*").order("sort_order"),
      ]);

      if (absRes.data) setAbsences(absRes.data);
      if (codesRes.data) setCodes(codesRes.data);
      setLoading(false);
    }
    fetchData();
  }, [selectedYear]);

  const filteredAbsences = absences.filter((a) => {
    const nameMatch =
      !searchQuery ||
      `${a.employees?.first_name} ${a.employees?.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const codeMatch = !selectedCode || a.absence_codes?.code === selectedCode;
    return nameMatch && codeMatch;
  });

  // Group by month for display
  const grouped = filteredAbsences.reduce<Record<string, AbsenceEntry[]>>((acc, a) => {
    const month = new Date(a.absence_date).toLocaleDateString("fr-BE", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Absences & Congés</h1>
          <p className="text-slate-500 mt-1">
            {filteredAbsences.length} absence{filteredAbsences.length > 1 ? "s" : ""} en {selectedYear}
          </p>
        </div>
        <Link
          href="/absences/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Nouvelle absence
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab.href === "/absences"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 sm:min-w-[200px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full sm:w-auto rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {[2025, 2024, 2023, 2022, 2021].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="w-full sm:w-auto rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tous les types</option>
            {codes.map((c) => (
              <option key={c.id} value={c.code}>{c.code} - {c.description}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {codes.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5 text-xs">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: c.color_hex || "#94a3b8" }}
            />
            {c.code}
          </span>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement des absences...</p>
        </div>
      ) : filteredAbsences.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune absence trouvée pour cette période.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, entries]) => (
            <div key={month}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {month} ({entries.length})
              </h3>
              <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 shadow-sm">
                {entries.map((a) => (
                  <div key={a.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: a.absence_codes?.color_hex || "#94a3b8" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {a.employees?.last_name}, {a.employees?.first_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.absence_codes?.code} — {a.absence_codes?.description}
                        {a.reason && ` • ${a.reason}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(a.absence_date).toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {a.absence_days ? `${a.absence_days} jour${a.absence_days > 1 ? "s" : ""}` : ""}
                        {a.absence_minutes ? minutesToHM(a.absence_minutes) : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
