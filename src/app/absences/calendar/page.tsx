"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface CalendarAbsence {
  id: number;
  date: string;
  employees: { first_name: string; last_name: string } | null;
  absence_codes: { code: string; label: string } | null;
}

const COLOR_MAP: Record<string, string> = {
  conge: "bg-blue-200 text-blue-900",
  maladie: "bg-red-200 text-red-900",
  rtt: "bg-green-200 text-green-900",
};

function getColorClass(code: string | undefined): string {
  if (!code) return "bg-gray-200 text-gray-900";
  const lower = code.toLowerCase();
  if (lower.includes("conge") || lower.includes("congé") || lower.includes("ca"))
    return COLOR_MAP.conge;
  if (lower.includes("malad") || lower.includes("cm")) return COLOR_MAP.maladie;
  if (lower.includes("rtt")) return COLOR_MAP.rtt;
  return "bg-gray-200 text-gray-900";
}

export default function AbsenceCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [absences, setAbsences] = useState<CalendarAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    async function fetchAbsences() {
      setLoading(true);
      const supabase = createClient();

      const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const { data } = await supabase
        .from("year_calendar")
        .select("id, date, employees(first_name, last_name), absence_codes(code, label)")
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .order("date");

      if (data) setAbsences(data as unknown as CalendarAbsence[]);
      setLoading(false);
    }
    fetchAbsences();
  }, [year, month]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  }

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based: Mon=0, Tue=1, ..., Sun=6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  // Fill remaining cells to complete last week
  while (days.length % 7 !== 0) days.push(null);

  function getAbsencesForDay(day: number): CalendarAbsence[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return absences.filter((a) => a.date === dateStr);
  }

  const selectedAbsences = selectedDay
    ? absences.filter((a) => a.date === selectedDay)
    : [];

  const monthName = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Calendrier des absences
        </h1>
        <p className="text-slate-500 mt-1">
          Vue mensuelle des absences de l&apos;equipe
        </p>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 capitalize">
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-slate-500 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-20" />;
                }
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayAbsences = getAbsencesForDay(day);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDay;

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(dateStr)}
                    className={`h-20 p-1 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : isToday
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        isToday ? "text-blue-600" : "text-slate-700"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayAbsences.slice(0, 2).map((a) => (
                        <div
                          key={a.id}
                          className={`text-[10px] px-1 rounded truncate ${getColorClass(a.absence_codes?.code)}`}
                        >
                          {a.employees?.last_name}
                        </div>
                      ))}
                      {dayAbsences.length > 2 && (
                        <div className="text-[10px] text-slate-500 px-1">
                          +{dayAbsences.length - 2} autres
                        </div>
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
            Details du{" "}
            {new Date(selectedDay + "T00:00:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
          {selectedAbsences.length === 0 ? (
            <p className="text-slate-500 text-sm">
              Aucune absence enregistree pour ce jour.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedAbsences.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
                >
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getColorClass(a.absence_codes?.code)}`}
                  >
                    {a.absence_codes?.code}
                  </span>
                  <span className="text-sm text-slate-900">
                    {a.employees?.last_name}, {a.employees?.first_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {a.absence_codes?.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200" /> Conge
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-200" /> Maladie
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-200" /> RTT
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-200" /> Autre
        </span>
      </div>
    </div>
  );
}
