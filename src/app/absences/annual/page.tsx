"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Printer } from "lucide-react";
import SearchableSelect from "@/components/searchable-select";
import EncoderDrawer from "@/components/encoder-drawer";

// ============================================================
// TYPES
// ============================================================

interface Sector {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  sector_id: number | null;
  is_inactive: boolean;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  text_color_hex: string | null;
  time_unit: string | null;
}

interface CalendarEntry {
  id: number;
  year: number;
  absence_date: string;
  employee_id: number;
  absence_code_id: number;
  absence_minutes: number | null;
  absence_days: number | null;
  reason: string | null;
}

interface Holiday {
  id: number;
  holiday_date: string;
  name: string;
  year: number;
}


interface VacationRight {
  id: number;
  employee_id: number;
  absence_code_id: number;
  year: number;
  days: number;
  hours: number;
  minutes: number;
}

interface SummaryRow {
  codeId: number;
  code: string;
  description: string;
  timeUnit: string | null;
  daysEntitled: number;
  daysTaken: number;
  daysDiff: number;
  hoursEntitled: number;
  hoursTaken: number;
  hoursDiff: number;
}


// ============================================================
// HELPERS
// ============================================================

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isWeekend(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function minutesToHM(m: number): string {
  if (!m) return "0h00";
  const h = Math.floor(Math.abs(m) / 60);
  const min = Math.abs(m) % 60;
  const sign = m < 0 ? "-" : "";
  return `${sign}${h}h${min.toString().padStart(2, "0")}`;
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AnnualCalendarPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + 1 - i);

  // Filters
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Data
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [vacationRights, setVacationRights] = useState<VacationRight[]>([]);
  const [loading, setLoading] = useState(false);

  // Encoder drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState<string | undefined>(undefined);


  // Load sectors and absence codes on mount
  useEffect(() => {
    async function loadInitial() {
      const supabase = createClient();
      const [secRes, codesRes] = await Promise.all([
        supabase.from("sectors").select("id, name").order("name"),
        supabase.from("absence_codes").select("*").order("sort_order"),
      ]);
      if (secRes.data) setSectors(secRes.data);
      if (codesRes.data) setAbsenceCodes(codesRes.data);
    }
    loadInitial();
  }, []);

  // Load employees when sector changes (or all if no sector)
  useEffect(() => {
    async function loadEmployees() {
      const supabase = createClient();
      let query = supabase
        .from("employees")
        .select("id, first_name, last_name, sector_id, is_inactive")
        .eq("is_inactive", false)
        .order("last_name");
      if (selectedSectorId) {
        query = query.eq("sector_id", selectedSectorId);
      }
      const { data } = await query;
      if (data) {
        setEmployees(data);
        // If current selection is not in the new list, clear it
        if (selectedEmployeeId && !data.find((e) => e.id === selectedEmployeeId)) {
          setSelectedEmployeeId(null);
        }
      }
    }
    loadEmployees();
  }, [selectedSectorId]);


  // Load calendar data when employee and year are selected
  const loadCalendarData = useCallback(async () => {
    if (!selectedEmployeeId) {
      setCalendarEntries([]);
      setHolidays([]);
      setVacationRights([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const [calRes, holRes, rightsRes] = await Promise.all([
      supabase
        .from("year_calendar")
        .select("*")
        .eq("employee_id", selectedEmployeeId)
        .eq("year", selectedYear),
      supabase
        .from("holidays")
        .select("*")
        .eq("year", selectedYear),
      supabase
        .from("vacation_rights")
        .select("*")
        .eq("employee_id", selectedEmployeeId)
        .eq("year", selectedYear),
    ]);
    if (calRes.data) setCalendarEntries(calRes.data);
    if (holRes.data) setHolidays(holRes.data);
    if (rightsRes.data) setVacationRights(rightsRes.data);
    setLoading(false);
  }, [selectedEmployeeId, selectedYear]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Build holiday set for quick lookup
  const holidayMap = new Map<string, string>();
  holidays.forEach((h) => holidayMap.set(h.holiday_date, h.name));

  // Build absence map: date -> CalendarEntry[]
  const absenceMap = new Map<string, CalendarEntry[]>();
  calendarEntries.forEach((entry) => {
    const existing = absenceMap.get(entry.absence_date) || [];
    existing.push(entry);
    absenceMap.set(entry.absence_date, existing);
  });

  // Build code lookup
  const codeMap = new Map<number, AbsenceCode>();
  absenceCodes.forEach((c) => codeMap.set(c.id, c));


  // Open encoder drawer for a date
  function openEdit(dateStr: string) {
    setDrawerDate(dateStr);
    setDrawerOpen(true);
  }


  // Build summary data
  const summaryRows: SummaryRow[] = absenceCodes
    .map((code) => {
      const right = vacationRights.find((r) => r.absence_code_id === code.id);
      const entries = calendarEntries.filter((e) => e.absence_code_id === code.id);
      const daysTaken = entries.reduce((sum, e) => sum + (e.absence_days || 0), 0);
      const minutesTaken = entries.reduce((sum, e) => sum + (e.absence_minutes || 0), 0);
      const daysEntitled = right ? right.days : 0;
      const hoursEntitled = right ? right.hours * 60 + right.minutes : 0;

      if (daysEntitled === 0 && hoursEntitled === 0 && daysTaken === 0 && minutesTaken === 0) {
        return null;
      }
      return {
        codeId: code.id,
        code: code.code,
        description: code.description,
        timeUnit: code.time_unit,
        daysEntitled,
        daysTaken,
        daysDiff: daysEntitled - daysTaken,
        hoursEntitled,
        hoursTaken: minutesTaken,
        hoursDiff: hoursEntitled - minutesTaken,
      };
    })
    .filter(Boolean) as SummaryRow[];

  const MONTH_NAMES = [
    "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
  ];
  const DAY_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];


  // Build detail rows grouped by month
  const detailByMonth: { month: number; entries: { date: string; code: string; description: string; duree: string; reason: string }[] }[] = [];
  for (let m = 0; m < 12; m++) {
    const monthEntries = calendarEntries
      .filter((e) => new Date(e.absence_date).getMonth() === m)
      .sort((a, b) => a.absence_date.localeCompare(b.absence_date))
      .map((e) => {
        const code = codeMap.get(e.absence_code_id);
        let duree = "";
        if (e.absence_days) duree = `${e.absence_days} j`;
        else if (e.absence_minutes) duree = minutesToHM(e.absence_minutes);
        return {
          date: new Date(e.absence_date + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }),
          code: code?.code || "",
          description: code?.description || "",
          duree,
          reason: e.reason || "",
        };
      });
    if (monthEntries.length > 0) {
      detailByMonth.push({ month: m, entries: monthEntries });
    }
  }

  // Get selected employee name
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const employeeName = selectedEmployee ? `${selectedEmployee.last_name}, ${selectedEmployee.first_name}` : "";


  // Print function — Page 1: Calendar, Page 2: Detail + Recap
  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Build calendar HTML
    let calendarHTML = "";
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const daysInMonth = getDaysInMonth(selectedYear, monthIdx);
      const firstDow = new Date(selectedYear, monthIdx, 1).getDay();
      const startOffset = firstDow === 0 ? 6 : firstDow - 1;

      const cells: (number | null)[] = [];
      for (let i = 0; i < startOffset; i++) cells.push(null);
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);
      while (cells.length % 7 !== 0) cells.push(null);

      let rowsHTML = "";
      for (let i = 0; i < cells.length; i += 7) {
        let rowCells = "";
        for (let j = i; j < i + 7; j++) {
          const day = cells[j];
          if (day === null) { rowCells += '<td class="cell empty"></td>'; continue; }
          const dateStr = formatDateStr(selectedYear, monthIdx, day);
          const weekend = isWeekend(selectedYear, monthIdx, day);
          const isHol = holidayMap.has(dateStr);
          const dayAbs = absenceMap.get(dateStr) || [];

          let bg = ""; let clr = "";
          if (dayAbs.length >= 1) {
            const code = codeMap.get(dayAbs[0].absence_code_id);
            if (code) { bg = code.color_hex || "#94a3b8"; clr = code.text_color_hex || "#ffffff"; }
          } else if (isHol) { bg = "#fecaca"; clr = "#991b1b"; }
          else if (weekend) { bg = "#e2e8f0"; clr = "#64748b"; }

          const style = bg ? `background:${bg};color:${clr};` : "";
          const extra = dayAbs.length > 3 ? `<span class="extra">+${dayAbs.length - 3}</span>` : "";
          rowCells += `<td class="cell" style="${style}">${day}${extra}</td>`;
        }
        rowsHTML += `<tr>${rowCells}</tr>`;
      }

      calendarHTML += `
        <div class="month-block">
          <div class="month-title">${MONTH_NAMES[monthIdx]}</div>
          <table class="month-table">
            <thead><tr><th>L</th><th>M</th><th>M</th><th>J</th><th>V</th><th>S</th><th>D</th></tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>`;
    }


    // Legend
    let legendHTML = absenceCodes.map((c) =>
      `<span class="legend-item"><span class="legend-color" style="background:${c.color_hex || "#94a3b8"}"></span>${c.code} - ${c.description}</span>`
    ).join("");
    legendHTML += `<span class="legend-item"><span class="legend-color" style="background:#fecaca"></span>Jour ferie</span>`;
    legendHTML += `<span class="legend-item"><span class="legend-color" style="background:#e2e8f0"></span>Weekend</span>`;

    // Detail table
    let detailHTML = "";
    if (detailByMonth.length > 0) {
      detailByMonth.forEach((group) => {
        detailHTML += `<tr class="month-header-row"><td colspan="5">${MONTH_NAMES[group.month]}</td></tr>`;
        group.entries.forEach((entry) => {
          detailHTML += `<tr><td>${entry.date}</td><td>${entry.code}</td><td>${entry.description}</td><td>${entry.duree}</td><td>${entry.reason}</td></tr>`;
        });
      });
    } else {
      detailHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:#64748b;">Aucune absence enregistree</td></tr>`;
    }

    // Summary table
    let summaryHTML = "";
    if (summaryRows.length > 0) {
      summaryRows.forEach((row) => {
        summaryHTML += `<tr>
          <td>${selectedYear}</td><td>${row.code} - ${row.description}</td>
          <td style="text-align:center">${row.timeUnit === "HOURS_MINUTES" ? "H/M" : "Jours"}</td>
          <td style="text-align:right">${row.daysEntitled}</td><td style="text-align:right">${row.daysTaken}</td>
          <td style="text-align:right;color:${row.daysDiff < 0 ? "#dc2626" : "#16a34a"}">${row.daysDiff}</td>
          <td style="text-align:right">${minutesToHM(row.hoursEntitled)}</td><td style="text-align:right">${minutesToHM(row.hoursTaken)}</td>
          <td style="text-align:right;color:${row.hoursDiff < 0 ? "#dc2626" : "#16a34a"}">${minutesToHM(row.hoursDiff)}</td>
        </tr>`;
      });
    } else {
      summaryHTML = `<tr><td colspan="9" style="text-align:center;padding:20px;color:#64748b;">Aucun droit configure</td></tr>`;
    }


    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title></title>
<style>
  @page { size: A4 portrait; margin: 8mm 10mm; }
  @media print { .page-break { page-break-before: always; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { height: 257mm; display: flex; flex-direction: column; overflow: hidden; }
  .page-header { margin-bottom: 6px; padding-bottom: 4px; border-bottom: 2px solid #1e293b; }
  .page-header .title { font-size: 15px; font-weight: bold; }
  .page-header .subtitle { font-size: 11px; color: #475569; margin-top: 1px; }
  .page-footer { margin-top: auto; padding-top: 4px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; }
  .calendar-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; flex: 1; }
  .month-block { border: 1px solid #cbd5e1; border-radius: 3px; padding: 2px 3px; display: flex; flex-direction: column; }
  .month-title { font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 0; }
  .month-table { width: 100%; border-collapse: collapse; flex: 1; }
  .month-table th { font-size: 9px; color: #475569; padding: 0; text-align: center; }
  .month-table td.cell { font-size: 12px; text-align: center; padding: 0; border: 1px solid #e2e8f0; position: relative; width: 14.28%; }
  .month-table td.empty { border: 1px solid #f1f5f9; width: 14.28%; }
  .extra { position: absolute; bottom: 0; right: 0; font-size: 7px; background: #1e293b; color: #fff; padding: 0 2px; border-radius: 2px 0 0 0; }
  .legend { display: flex; flex-wrap: wrap; gap: 5px; padding: 4px 0; border-top: 1px solid #e2e8f0; margin-top: 3px; }
  .legend-item { display: inline-flex; align-items: center; gap: 2px; font-size: 9px; }
  .legend-color { width: 9px; height: 9px; border-radius: 2px; border: 1px solid #cbd5e1; display: inline-block; }
  .detail-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; }
  .detail-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 14px; }
  .detail-table th { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 5px 8px; text-align: left; font-weight: 600; }
  .detail-table td { border: 1px solid #e2e8f0; padding: 4px 8px; }
  .detail-table .month-header-row td { background: #e2e8f0; font-weight: bold; font-size: 12px; padding: 5px 8px; }
  .summary-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; margin-top: 16px; padding-bottom: 3px; border-bottom: 1px solid #e2e8f0; }
</style>
</head>
<body>
  <div class="page">
    <div class="page-header">
      <div class="title">Calendrier annuel ${selectedYear}</div>
      <div class="subtitle">${employeeName}</div>
    </div>
    <div class="calendar-grid">${calendarHTML}</div>
    <div class="legend">${legendHTML}</div>
    <div class="page-footer">
      <span>Page 1/2</span>
      <span>${new Date().toLocaleDateString("fr-BE")} ${new Date().toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
  </div>
  <div class="page page-break">
    <div class="page-header">
      <div class="title">Calendrier annuel ${selectedYear}</div>
      <div class="subtitle">${employeeName}</div>
    </div>
    <div class="detail-title">Detail des absences ${selectedYear}</div>
    <table class="detail-table">
      <thead><tr><th>Date</th><th>Code</th><th>Description</th><th>Duree</th><th>Raison</th></tr></thead>
      <tbody>${detailHTML}</tbody>
    </table>
    <div class="summary-title">Recapitulatif ${selectedYear}</div>
    <table class="detail-table">
      <thead><tr><th>Annee</th><th>Description</th><th>Type</th><th>J. acquis</th><th>J. pris</th><th>Diff. J.</th><th>H. acquises</th><th>H. prises</th><th>Diff. H.</th></tr></thead>
      <tbody>${summaryHTML}</tbody>
    </table>
    <div class="page-footer">
      <span>Page 2/2</span>
      <span>${new Date().toLocaleDateString("fr-BE")} ${new Date().toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
  </div>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Calendrier annuel</h1>
        <p className="text-slate-500 mt-1">Vue annuelle des absences par employe</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <SearchableSelect
            options={[{ value: "", label: "Tous les secteurs" }, ...sectors.map((s) => ({ value: String(s.id), label: s.name }))]}
            value={selectedSectorId ? String(selectedSectorId) : ""}
            onChange={(v) => setSelectedSectorId(v ? Number(v) : null)}
            placeholder="Secteur..."
            className="w-full sm:w-48"
          />

          <SearchableSelect
            options={employees.map((emp) => ({
              value: String(emp.id),
              label: `${emp.last_name}, ${emp.first_name}`,
            }))}
            value={selectedEmployeeId ? String(selectedEmployeeId) : ""}
            onChange={(v) => setSelectedEmployeeId(v ? Number(v) : null)}
            placeholder="Rechercher un employé..."
            className="w-full sm:w-64"
          />

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full sm:w-auto rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Print button — always below filters */}
        {selectedEmployeeId && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer le calendrier
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      )}


      {/* SECTION 1: Calendar Grid — ALWAYS visible */}
      {!loading && selectedEmployeeId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, monthIdx) => {
              const daysInMonth = getDaysInMonth(selectedYear, monthIdx);
              const firstDow = new Date(selectedYear, monthIdx, 1).getDay();
              const startOffset = firstDow === 0 ? 6 : firstDow - 1;
              const cells: (number | null)[] = [];
              for (let i = 0; i < startOffset; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);
              while (cells.length % 7 !== 0) cells.push(null);

              return (
                <div key={monthIdx} className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2 text-center">
                    {MONTH_NAMES[monthIdx]}
                  </h3>
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {DAY_HEADERS.map((d, i) => (
                      <div key={i} className="text-[10px] text-slate-400 text-center font-medium">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {cells.map((day, idx) => {
                      if (day === null) return <div key={`e-${idx}`} className="w-full aspect-square" />;
                      const dateStr = formatDateStr(selectedYear, monthIdx, day);
                      const weekend = isWeekend(selectedYear, monthIdx, day);
                      const isHoliday = holidayMap.has(dateStr);
                      const dayAbsences = absenceMap.get(dateStr) || [];

                      let bgColor = "";
                      let textColor = "";
                      let title = "";

                      if (isHoliday && dayAbsences.length === 0) {
                        bgColor = "#fecaca"; textColor = "#991b1b";
                        title = holidayMap.get(dateStr) || "Jour ferie";
                      } else if (weekend && dayAbsences.length === 0) {
                        bgColor = "#e2e8f0"; textColor = "#64748b";
                      } else if (dayAbsences.length === 1) {
                        const code = codeMap.get(dayAbsences[0].absence_code_id);
                        if (code) { bgColor = code.color_hex || "#94a3b8"; textColor = code.text_color_hex || "#ffffff"; title = `${code.code} - ${code.description}`; }
                      } else if (dayAbsences.length > 1) {
                        title = dayAbsences.map((a) => codeMap.get(a.absence_code_id)?.code).filter(Boolean).join(", ");
                      }

                      const showStacked = dayAbsences.length > 1;
                      const maxStripes = 3;
                      const visibleAbsences = dayAbsences.slice(0, maxStripes);
                      const extraCount = dayAbsences.length - maxStripes;

                      return (
                        <div
                          key={`d-${day}`}
                          onClick={() => openEdit(dateStr)}
                          title={title}
                          className={`w-full aspect-square flex items-center justify-center text-[10px] font-medium rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-blue-400 relative overflow-hidden`}
                          style={{
                            backgroundColor: !showStacked ? bgColor || undefined : undefined,
                            color: !showStacked ? textColor || undefined : undefined,
                          }}
                        >
                          {showStacked && (
                            <div className="absolute inset-0 flex flex-col">
                              {visibleAbsences.map((a, aIdx) => {
                                const code = codeMap.get(a.absence_code_id);
                                return <div key={aIdx} className="flex-1" style={{ backgroundColor: code?.color_hex || "#94a3b8" }} />;
                              })}
                            </div>
                          )}
                          <span className={showStacked ? "relative z-10 text-white drop-shadow-sm" : ""}>{day}</span>
                          {extraCount > 0 && (
                            <span className="absolute bottom-0 right-0 text-[7px] bg-slate-800 text-white px-0.5 rounded-tl z-10">+{extraCount}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Legende</h3>
            <div className="flex flex-wrap gap-3">
              {absenceCodes.map((c) => (
                <span key={c.id} className="inline-flex items-center gap-1.5 text-xs">
                  <span className="w-4 h-4 rounded-sm border border-slate-200" style={{ backgroundColor: c.color_hex || "#94a3b8" }} />
                  <span className="text-slate-700">{c.code} - {c.description}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className="w-4 h-4 rounded-sm border border-slate-200 bg-red-200" />
                <span className="text-slate-700">Jour ferie</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className="w-4 h-4 rounded-sm border border-slate-200 bg-slate-200" />
                <span className="text-slate-700">Weekend</span>
              </span>
            </div>
          </div>


          {/* SECTION 2: Detail des absences — ALWAYS visible */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">
                Detail des absences {selectedYear}
              </h3>
            </div>
            {detailByMonth.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Code</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Duree</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Raison</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailByMonth.map((group) => (
                      <Fragment key={group.month}>
                        <tr className="bg-slate-100">
                          <td colSpan={5} className="px-4 py-2 text-sm font-semibold text-slate-700">
                            {MONTH_NAMES[group.month]}
                          </td>
                        </tr>
                        {group.entries.map((entry, eIdx) => (
                          <tr key={`${group.month}-${eIdx}`} className="hover:bg-slate-50">
                            <td className="px-4 py-2 text-sm text-slate-600">{entry.date}</td>
                            <td className="px-4 py-2 text-sm">
                              <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{entry.code}</span>
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900">{entry.description}</td>
                            <td className="px-4 py-2 text-sm text-slate-600">{entry.duree}</td>
                            <td className="px-4 py-2 text-sm text-slate-500">{entry.reason}</td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Aucune absence enregistree pour {selectedYear}
              </div>
            )}
          </div>


          {/* SECTION 3: Recapitulatif — ALWAYS visible */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">
                Recapitulatif {selectedYear}
              </h3>
            </div>
            {summaryRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Annee</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Description</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Jours acquis</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Jours pris</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Diff. jours</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Heures acquises</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Heures prises</th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Diff. heures</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summaryRows.map((row) => {
                      const daysDiffClass = row.daysDiff < 0 ? "text-red-600 font-semibold" : row.daysDiff > 0 ? "text-emerald-600" : "";
                      const hoursDiffClass = row.hoursDiff < 0 ? "text-red-600 font-semibold" : row.hoursDiff > 0 ? "text-emerald-600" : "";
                      return (
                        <tr key={row.codeId} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-600">{selectedYear}</td>
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                            <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">{row.code}</span>
                            {row.description}
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-500 text-center">
                            {row.timeUnit === "HOURS_MINUTES" ? "H/M" : "Jours"}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-900 text-right">{row.daysEntitled}</td>
                          <td className="px-3 py-3 text-sm text-slate-600 text-right">{row.daysTaken}</td>
                          <td className={`px-3 py-3 text-sm text-right ${daysDiffClass}`}>{row.daysDiff}</td>
                          <td className="px-3 py-3 text-sm text-slate-900 text-right">{minutesToHM(row.hoursEntitled)}</td>
                          <td className="px-3 py-3 text-sm text-slate-600 text-right">{minutesToHM(row.hoursTaken)}</td>
                          <td className={`px-3 py-3 text-sm text-right ${hoursDiffClass}`}>{minutesToHM(row.hoursDiff)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Aucun droit de conge configure pour {selectedYear}
              </div>
            )}
          </div>
        </>
      )}


      {/* Empty state — no employee selected */}
      {!loading && !selectedEmployeeId && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Selectionnez un secteur, puis un employe pour afficher le calendrier annuel.
          </p>
        </div>
      )}

      {/* Encoder Drawer */}
      {selectedEmployeeId && (
        <EncoderDrawer
          externalOpen={drawerOpen}
          onExternalClose={() => setDrawerOpen(false)}
          preselectedEmployeeId={selectedEmployeeId}
          preselectedDate={drawerDate}
          onSaved={loadCalendarData}
        />
      )}
    </div>
  );
}
