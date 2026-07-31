"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface Sector { id: number; name: string; }
interface AbsenceCode { id: number; code: string; description: string; color_hex: string | null; text_color_hex: string | null; }
interface CalendarAbsence { id: number; absence_date: string; employee_id: number; absence_code_id: number; employees: { first_name: string; last_name: string } | null; absence_codes: { code: string; description: string; color_hex: string | null } | null; }

export default function AbsenceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [absences, setAbsences] = useState<CalendarAbsence[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Load sectors + absence codes on mount
  useEffect(() => {
    async function loadMeta() {
      const supabase = createClient();
      const [secRes, codesRes] = await Promise.all([
        supabase.from("sectors").select("id, name").order("name"),
        supabase.from("absence_codes").select("id, code, description, color_hex, text_color_hex").order("sort_order"),
      ]);
      if (secRes.data) setSectors(secRes.data);
      if (codesRes.data) setAbsenceCodes(codesRes.data);
    }
    loadMeta();
  }, []);

  // Load absences for selected month + sector
  useEffect(() => {
    async function fetchAbsences() {
      setLoading(true);
      const supabase = createClient();
      const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      let query = supabase
        .from("year_calendar")
        .select("id, absence_date, employee_id, absence_code_id, employees(first_name, last_name, sector_id), absence_codes(code, description, color_hex)")
        .gte("absence_date", startOfMonth)
        .lte("absence_date", endOfMonth)
        .order("absence_date");

      const { data } = await query;

      let results = (data || []) as unknown as (CalendarAbsence & { employees: { first_name: string; last_name: string; sector_id: number | null } | null })[];

      // Filter by sector client-side (since year_calendar doesn't have sector_id directly)
      if (selectedSectorId) {
        results = results.filter((a) => a.employees?.sector_id === Number(selectedSectorId));
      }

      setAbsences(results as unknown as CalendarAbsence[]);
      setLoading(false);
    }
    fetchAbsences();
  }, [year, month, selectedSectorId]);

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  function getAbsencesForDay(day: number): CalendarAbsence[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return absences.filter((a) => a.absence_date === dateStr);
  }

  const selectedAbsences = selectedDay ? absences.filter((a) => a.absence_date === selectedDay) : [];

  const monthName = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendrier des absences</h1>
        <p className="text-slate-500 mt-1">Vue mensuelle des absences de l&apos;equipe</p>
      </div>

      {/* Sector filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Secteur :</label>
          <select
            value={selectedSectorId}
            onChange={(e) => setSelectedSectorId(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tous les secteurs</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500">{absences.length} absence{absences.length > 1 ? "s" : ""} ce mois</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
          <h2 className="text-lg font-semibold text-slate-900 capitalize">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /><p className="text-slate-500 mt-4">Chargement...</p></div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="h-24" />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayAbsences = getAbsencesForDay(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDay;

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(dateStr)}
                    className={`h-24 p-1 border rounded-lg cursor-pointer transition-colors ${isSelected ? "border-blue-500 bg-blue-50" : isToday ? "border-blue-300 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-blue-600" : "text-slate-700"}`}>{day}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayAbsences.slice(0, 3).map((a) => (
                        <div key={a.id} className="text-[10px] px-1 rounded truncate flex items-center gap-1" style={{ backgroundColor: (a.absence_codes?.color_hex || "#94a3b8") + "30", color: a.absence_codes?.color_hex || "#475569" }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.absence_codes?.color_hex || "#94a3b8" }} />
                          {a.employees?.last_name}
                        </div>
                      ))}
                      {dayAbsences.length > 3 && (
                        <div className="text-[10px] text-slate-500 px-1">+{dayAbsences.length - 3} autres</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected day details */}
      {selectedDay && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            <CalendarDays className="w-5 h-5 inline-block mr-2 text-slate-400" />
            Details du {new Date(selectedDay + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </h3>
          {selectedAbsences.length === 0 ? (
            <p className="text-slate-500 text-sm">Aucune absence enregistree pour ce jour.</p>
          ) : (
            <div className="space-y-2">
              {selectedAbsences.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: (a.absence_codes?.color_hex || "#94a3b8") + "30", color: a.absence_codes?.color_hex || "#475569" }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.absence_codes?.color_hex || "#94a3b8" }} />
                    {a.absence_codes?.code}
                  </span>
                  <span className="text-sm text-slate-900">{a.employees?.last_name}, {a.employees?.first_name}</span>
                  <span className="text-xs text-slate-500">{a.absence_codes?.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend (from actual absence_codes) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Legende</h3>
        <div className="flex flex-wrap gap-3">
          {absenceCodes.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 text-xs">
              <span className="w-4 h-4 rounded-sm border border-slate-200" style={{ backgroundColor: c.color_hex || "#94a3b8" }} />
              <span className="text-slate-700">{c.code} - {c.description}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
