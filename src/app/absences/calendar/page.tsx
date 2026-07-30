"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

interface CalendarAbsence {
  id: number;
  absence_date: string;
  absence_minutes: number | null;
  absence_days: number | null;
  reason: string | null;
  employees: { first_name: string; last_name: string } | null;
  absence_codes: {
    code: string;
    description: string;
    color_hex: string | null;
    text_color_hex: string | null;
  } | null;
}

export default function AbsencesCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [absences, setAbsences] = useState<CalendarAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    async function fetchAbsences() {
      setLoading(true);
      const supabase = createClient();

      const startOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endOfMonth = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const { data } = await supabase
        .from("year_calendar")
        .select(
          "id, absence_date, absence_minutes, absence_days, reason, employees(first_name, last_name), absence_codes(code, description, color_hex, text_color_hex)"
        )
        .gte("absence_date", startOfMonth)
        .lte("absence_date", endOfMonth)
        .order("absence_date");

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
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Adjust to start on Monday (0=Mon, 6=Sun)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  // Group absences by date
  const absencesByDate: Record<string, CalendarAbsence[]> = {};
  absences.forEach((a) => {
    if (!absencesByDate[a.absence_date]) absencesByDate[a.absence_date] = [];
    absencesByDate[a.absence_date].push(a);
  });

  const monthName = currentDate.toLocaleDateString("fr-BE", {
    month: "long",
    year: "numeric",
  });

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const selectedAbsences = selectedDay ? absencesByDate[selectedDay] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Calendrier des absences
          </h1>
          <p className="text-slate-500 mt-1">
            Vue mensuelle des absences
          </p>
        </div>
        <Link
          href="/absences"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Retour a la liste
        </Link>
      </div>

      {/* Month navigation */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-slate-500 mt-4">Chargement...</p>
          </div>
        ) : (
          <div className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map((d) => (
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
                  return <div key={idx} className="h-24" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayAbsences = absencesByDate[dateStr] || [];
                const isToday =
                  new Date().toISOString().split("T")[0] === dateStr;
                const isSelected = selectedDay === dateStr;
                const isWeekend = idx % 7 === 5 || idx % 7 === 6;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDay(dateStr)}
                    className={`h-24 p-1 rounded-lg text-left transition-all overflow-hidden ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : isWeekend
                        ? "bg-slate-50"
                        : "bg-white hover:bg-slate-50"
                    } ${dayAbsences.length > 0 ? "cursor-pointer" : ""}`}
                  >
                    <span
                      className={`text-xs font-medium ${
                        isToday
                          ? "bg-blue-600 text-white px-1.5 py-0.5 rounded-full"
                          : isWeekend
                          ? "text-slate-400"
                          : "text-slate-700"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayAbsences.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="text-[10px] leading-tight px-1 py-0.5 rounded truncate"
                          style={{
                            backgroundColor:
                              a.absence_codes?.color_hex || "#e2e8f0",
                            color:
                              a.absence_codes?.text_color_hex || "#1e293b",
                          }}
                        >
                          {a.employees?.last_name}
                        </div>
                      ))}
                      {dayAbsences.length > 3 && (
                        <div className="text-[10px] text-slate-500 pl-1">
                          +{dayAbsences.length - 3} autres
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">
              {new Date(selectedDay + "T00:00:00").toLocaleDateString("fr-BE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          {selectedAbsences.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucune absence enregistree ce jour.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedAbsences.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        a.absence_codes?.color_hex || "#94a3b8",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {a.employees?.last_name}, {a.employees?.first_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {a.absence_codes?.code} - {a.absence_codes?.description}
                      {a.reason && ` | ${a.reason}`}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">
                    {a.absence_days
                      ? `${a.absence_days}j`
                      : a.absence_minutes
                      ? `${Math.floor(a.absence_minutes / 60)}h${String(a.absence_minutes % 60).padStart(2, "0")}`
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
