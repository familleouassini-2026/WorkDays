"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { auditLog } from "@/lib/audit";
import { ChevronLeft, ChevronRight, Plus, Trash2, History, X, CalendarPlus, AlertTriangle } from "lucide-react";
import SearchableSelect from "@/components/searchable-select";

interface Employee { id: number; first_name: string; last_name: string; }
interface AbsenceCode { id: number; code: string; description: string; color_hex: string | null; text_color_hex: string | null; time_unit: string; }
interface CalendarEntry { id: number; absence_date: string; absence_code_id: number; absence_minutes: number | null; absence_days: number | null; reason: string | null; }
interface AuditEntry { id: number; action: string; old_values: Record<string, unknown> | null; new_values: Record<string, unknown> | null; changed_fields: string[] | null; performed_at: string; context: string | null; }
interface Timesheet { monday_minutes: number | null; tuesday_minutes: number | null; wednesday_minutes: number | null; thursday_minutes: number | null; friday_minutes: number | null; saturday_minutes: number | null; sunday_minutes: number | null; }

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const DOW_FIELDS: (keyof Timesheet)[] = ["sunday_minutes", "monday_minutes", "tuesday_minutes", "wednesday_minutes", "thursday_minutes", "friday_minutes", "saturday_minutes"];

function getScheduleMinutes(ts: Timesheet | null, date: Date): number {
  if (!ts) return 480; // default 8h if no timesheet
  const dow = date.getDay(); // 0=sun, 1=mon...
  return ts[DOW_FIELDS[dow]] || 0;
}

interface EncoderDrawerProps {
  externalOpen?: boolean;
  onExternalClose?: () => void;
  preselectedEmployeeId?: number;
  preselectedDate?: string;
  onSaved?: () => void;
}

export default function EncoderDrawer({ externalOpen, onExternalClose, preselectedEmployeeId, preselectedDate, onSaved }: EncoderDrawerProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen || internalOpen;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [codes, setCodes] = useState<AbsenceCode[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addMinutes, setAddMinutes] = useState("");
  const [addDays, setAddDays] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | "all" | null>(null);
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [auditLabel, setAuditLabel] = useState<string>("");
  const [initialized, setInitialized] = useState(false);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [balanceInfo, setBalanceInfo] = useState<{ entitled: number; used: number; unit: "minutes" | "days" } | null>(null);

  // Handle external open with preselected employee and date
  useEffect(() => {
    if (externalOpen && initialized && preselectedEmployeeId) {
      const emp = employees.find((e) => e.id === preselectedEmployeeId);
      if (emp) {
        setSelectedEmp(emp);
        setSearch(`${emp.last_name} ${emp.first_name}`);
      }
    }
  }, [externalOpen, initialized, preselectedEmployeeId, employees]);

  useEffect(() => {
    if (externalOpen && preselectedDate) {
      setAddStart(preselectedDate);
      setAddEnd("");
      const d = new Date(preselectedDate);
      setMonth(d.getMonth());
      setYear(d.getFullYear());
    }
  }, [externalOpen, preselectedDate]);

  function setOpen(value: boolean) {
    if (!value) {
      if (onExternalClose) onExternalClose();
      setInternalOpen(false);
    } else {
      setInternalOpen(true);
    }
  }

  useEffect(() => {
    if (!open || initialized) return;
    async function init() {
      const supabase = createClient();
      const [empRes, codeRes] = await Promise.all([
        supabase.from("employees").select("id, first_name, last_name").eq("is_inactive", false).order("last_name"),
        supabase.from("absence_codes").select("id, code, description, color_hex, text_color_hex, time_unit").order("sort_order").order("code"),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (codeRes.data) setCodes(codeRes.data);
      setInitialized(true);
    }
    init();
  }, [open, initialized]);

  useEffect(() => { if (selectedEmp && open) fetchEntries(); }, [selectedEmp, month, year, open]);

  // Fetch timesheet + holidays when employee changes
  useEffect(() => {
    if (!selectedEmp) { setTimesheet(null); return; }
    async function fetchSchedule() {
      const supabase = createClient();
      const [tsRes, holRes] = await Promise.all([
        supabase.from("timesheets")
          .select("monday_minutes, tuesday_minutes, wednesday_minutes, thursday_minutes, friday_minutes, saturday_minutes, sunday_minutes")
          .eq("employee_id", selectedEmp!.id).eq("is_active", true).single(),
        supabase.from("holidays").select("holiday_date").eq("year", new Date().getFullYear()),
      ]);
      if (tsRes.data) setTimesheet(tsRes.data as Timesheet);
      if (holRes.data) setHolidays(new Set(holRes.data.map((h: { holiday_date: string }) => h.holiday_date)));
    }
    fetchSchedule();
  }, [selectedEmp]);

  async function fetchEntries() {
    if (!selectedEmp) return;
    setLoading(true);
    const supabase = createClient();
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const { data } = await supabase.from("year_calendar")
      .select("id, absence_date, absence_code_id, absence_minutes, absence_days, reason")
      .eq("employee_id", selectedEmp.id)
      .gte("absence_date", startDate).lte("absence_date", endDate)
      .order("absence_date");
    if (data) setEntries(data);
    setLoading(false);
  }

  const filtered = search.length >= 2
    ? employees.filter((e) => `${e.last_name} ${e.first_name}`.toLowerCase().includes(search.toLowerCase()))
    : [];

  function selectEmployee(emp: Employee) {
    setSelectedEmp(emp);
    setSearch(`${emp.last_name} ${emp.first_name}`);
  }

  const selectedCodeObj = codes.find((c) => String(c.id) === addCode);
  const isHours = selectedCodeObj?.time_unit === "HOURS_MINUTES";

  // Fetch balance for selected code + employee
  useEffect(() => {
    if (!selectedEmp || !addCode) { setBalanceInfo(null); return; }
    async function fetchBalance() {
      const supabase = createClient();
      const codeId = Number(addCode);
      const currentYear = new Date().getFullYear();
      const codeObj = codes.find((c) => c.id === codeId);
      if (!codeObj) return;
      const { data: right } = await supabase
        .from("vacation_rights")
        .select("days, hours, minutes")
        .eq("employee_id", selectedEmp!.id)
        .eq("absence_code_id", codeId)
        .eq("year", currentYear)
        .single();
      if (!right) { setBalanceInfo(null); return; }
      const { data: consumed } = await supabase
        .from("year_calendar")
        .select("absence_minutes, absence_days")
        .eq("employee_id", selectedEmp!.id)
        .eq("absence_code_id", codeId)
        .eq("year", currentYear);
      if (codeObj.time_unit === "HOURS_MINUTES") {
        const entitled = (right.hours || 0) * 60 + (right.minutes || 0);
        const used = (consumed || []).reduce((sum, c) => sum + (c.absence_minutes || 0), 0);
        setBalanceInfo({ entitled, used, unit: "minutes" });
      } else {
        const entitled = right.days || 0;
        const used = (consumed || []).reduce((sum, c) => sum + (c.absence_days || 0), 0);
        setBalanceInfo({ entitled, used, unit: "days" });
      }
    }
    fetchBalance();
  }, [selectedEmp, addCode, codes]);

  async function handleAdd() {
    if (!selectedEmp || !addCode || !addStart) return;
    setSaving(true);
    setValidationWarning(null);
    const supabase = createClient();
    const start = new Date(addStart);
    const end = addEnd ? new Date(addEnd) : start;
    const daysToInsert: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      const dateStr = d.toISOString().split("T")[0];
      // Skip weekends
      if (dow === 0 || dow === 6) continue;
      // Skip holidays
      if (holidays.has(dateStr)) continue;
      // Skip days where employee doesn't work (0 minutes scheduled)
      const scheduledMin = getScheduleMinutes(timesheet, d);
      if (scheduledMin === 0) continue;
      daysToInsert.push(dateStr);
    }
    if (daysToInsert.length === 0) {
      setValidationWarning("Aucun jour ouvré dans cette période (weekends/fériés/non travaillé).");
      setSaving(false);
      return;
    }
    // Validate minutes vs schedule for HOURS_MINUTES codes
    if (isHours && addMinutes) {
      const inputMin = Number(addMinutes);
      for (const day of daysToInsert) {
        const scheduledMin = getScheduleMinutes(timesheet, new Date(day));
        if (inputMin > scheduledMin) {
          const dayLabel = new Date(day + "T00:00:00").toLocaleDateString("fr-BE", { weekday: "short", day: "2-digit", month: "2-digit" });
          setValidationWarning(`${dayLabel}: ${inputMin} min dépasse l'horaire (${scheduledMin} min = ${Math.floor(scheduledMin/60)}h${String(scheduledMin%60).padStart(2,"0")}). Réduisez ou ajustez.`);
          setSaving(false);
          return;
        }
      }
    }
    for (const day of daysToInsert) {
      const scheduledMin = getScheduleMinutes(timesheet, new Date(day));
      const minutesForDay = isHours ? (Number(addMinutes) || scheduledMin) : null;
      const record = { employee_id: selectedEmp.id, absence_date: day, absence_code_id: Number(addCode), absence_minutes: isHours ? minutesForDay : null, absence_days: !isHours ? (Number(addDays) || 1) : null, year: Number(day.split("-")[0]) };
      const { data, error: insertError } = await supabase.from("year_calendar").insert(record).select("id").single();
      if (insertError) {
        console.error("[encoder] Insert year_calendar failed:", insertError.message);
        continue;
      }
      if (data) {
        const auditResult = await auditLog({ tableName: "year_calendar", recordId: data.id, action: "INSERT", newValues: record, context: "Encodeur rapide" });
        if (!auditResult.success) console.error("[encoder] Audit log failed for INSERT:", auditResult.error);
      }
    }
    setAddStart(""); setAddEnd(""); setAddCode(""); setAddMinutes(""); setAddDays("");
    setSaving(false);
    fetchEntries();
    if (onSaved) onSaved();
  }

  async function handleDelete(entry: CalendarEntry) {
    setDeleting(entry.id);
    const supabase = createClient();
    const { error } = await supabase.from("year_calendar").delete().eq("id", entry.id);
    if (!error) {
      const auditResult = await auditLog({ tableName: "year_calendar", recordId: entry.id, action: "DELETE", oldValues: entry as unknown as Record<string, unknown>, context: "Encodeur rapide" });
      if (!auditResult.success) console.error("[encoder] Audit log failed for DELETE:", auditResult.error);
      fetchEntries();
    }
    setDeleting(null);
  }

  async function handleDeleteAll() {
    if (!selectedEmp || entries.length === 0) return;
    setDeleting("all");
    const supabase = createClient();
    for (const entry of entries) {
      const { error } = await supabase.from("year_calendar").delete().eq("id", entry.id);
      if (!error) {
        const auditResult = await auditLog({ tableName: "year_calendar", recordId: entry.id, action: "DELETE", oldValues: entry as unknown as Record<string, unknown>, context: "Encodeur rapide - suppression masse" });
        if (!auditResult.success) console.error("[encoder] Audit log failed for mass DELETE:", auditResult.error);
      }
    }
    fetchEntries();
    setDeleting(null);
  }

  async function showHistoryFn(entry: CalendarEntry) {
    if (!selectedEmp) return;
    const absenceDate = entry.absence_date;
    setAuditLabel(absenceDate);
    setShowAudit(true);
    const supabase = createClient();
    // Fetch all audit entries for this employee + date (across all record IDs)
    const { data } = await supabase
      .from("audit_log")
      .select("id, action, old_values, new_values, changed_fields, performed_at, context")
      .eq("table_name", "year_calendar")
      .or(`new_values->>absence_date.eq.${absenceDate},old_values->>absence_date.eq.${absenceDate}`)
      .order("performed_at", { ascending: false });
    // Filter client-side for this employee (JSONB OR queries are limited)
    const empId = selectedEmp.id;
    const filtered = (data || []).filter((row) => {
      const nv = row.new_values as Record<string, unknown> | null;
      const ov = row.old_values as Record<string, unknown> | null;
      return (nv && Number(nv.employee_id) === empId) || (ov && Number(ov.employee_id) === empId);
    });
    setAuditHistory(filtered);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;

  const entryByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    entries.forEach((e) => { if (!map[e.absence_date]) map[e.absence_date] = []; map[e.absence_date].push(e); });
    return map;
  }, [entries]);

  function getCodeColor(codeId: number) {
    const c = codes.find((x) => x.id === codeId);
    return { bg: c?.color_hex || "#e2e8f0", text: c?.text_color_hex || "#000", label: c?.code || "?" };
  }

  // Floating button when closed
  if (!open) {
    // If externally controlled, don't show floating button
    if (externalOpen !== undefined) return null;
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-105"
      >
        <CalendarPlus className="w-4 h-4" />
        <span className="hidden sm:inline">Encoder</span>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-600 text-white">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4" />
            <span className="font-semibold text-sm">Encodeur rapide</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-emerald-700"><X className="w-5 h-5" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Employee search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (selectedEmp && e.target.value !== `${selectedEmp.last_name} ${selectedEmp.first_name}`) setSelectedEmp(null); }}
              placeholder="🔍 Tapez un nom..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {!selectedEmp && filtered.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filtered.map((emp) => (
                  <button key={emp.id} onClick={() => selectEmployee(emp)} className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-50">{emp.last_name} {emp.first_name}</button>
                ))}
              </div>
            )}
          </div>

          {selectedEmp && (
            <>
              {/* Month nav + mini calendar */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} className="p-1 rounded hover:bg-slate-200"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-xs font-semibold text-slate-700">{MONTHS[month]} {year}</span>
                  <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} className="p-1 rounded hover:bg-slate-200"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {DAYS.map((d, i) => <div key={i} className="text-center text-[9px] text-slate-400 font-medium">{d}</div>)}
                  {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} className="aspect-square" />)}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayEntries = entryByDate[dateStr] || [];
                    const isWeekend = new Date(year, month, day).getDay() % 6 === 0;
                    const isStart = addStart === dateStr;
                    const isEnd = addEnd === dateStr;
                    const isInRange = addStart && addEnd && dateStr >= addStart && dateStr <= addEnd;
                    const isSelected = isStart || isEnd;

                    return (
                      <div
                        key={day}
                        onClick={() => {
                          if (isWeekend) return;
                          if (!addStart || (addStart && addEnd)) {
                            // First click or reset
                            setAddStart(dateStr);
                            setAddEnd("");
                            setValidationWarning(null);
                          } else {
                            // Second click
                            if (dateStr < addStart) {
                              setAddEnd(addStart);
                              setAddStart(dateStr);
                            } else if (dateStr === addStart) {
                              // Same day = single day
                              setAddEnd("");
                            } else {
                              setAddEnd(dateStr);
                            }
                          }
                        }}
                        className={`aspect-square flex items-center justify-center rounded text-[10px] font-medium cursor-pointer transition-all
                          ${isWeekend ? "bg-slate-200 text-slate-400 cursor-not-allowed" : ""}
                          ${isSelected ? "ring-2 ring-emerald-500 bg-emerald-600 text-white" : ""}
                          ${isInRange && !isSelected ? "bg-emerald-100 text-emerald-800" : ""}
                          ${!isWeekend && !isSelected && !isInRange && dayEntries.length === 0 ? "hover:bg-emerald-50" : ""}
                        `}
                        style={!isSelected && !isInRange && dayEntries.length > 0 ? { backgroundColor: getCodeColor(dayEntries[0].absence_code_id).bg, color: getCodeColor(dayEntries[0].absence_code_id).text } : {}}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Entries list */}
              <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase">Ce mois ({entries.length})</h4>
                {entries.length > 0 && (
                  <button onClick={handleDeleteAll} disabled={deleting !== null} className="text-[10px] text-red-500 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1">
                    {deleting === "all" && <span className="inline-block w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />}
                    Supprimer tout
                  </button>
                )}
              </div>
                {loading ? (
                  <div className="text-center py-3"><div className="animate-spin w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" /></div>
                ) : entries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Aucune absence</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {entries.map((entry) => {
                      const c = getCodeColor(entry.absence_code_id);
                      return (
                        <div key={entry.id} className="flex items-center justify-between py-1.5 px-2 rounded border border-slate-100 hover:border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-4 rounded text-[8px] font-bold flex items-center justify-center" style={{ backgroundColor: c.bg, color: c.text }}>{c.label}</span>
                            <span className="text-xs text-slate-700">{new Date(entry.absence_date + "T00:00:00").toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" })}</span>
                            {entry.absence_minutes && <span className="text-[10px] text-slate-500">{Math.floor(entry.absence_minutes/60)}h</span>}
                            {entry.absence_days && <span className="text-[10px] text-slate-500">{entry.absence_days}j</span>}
                          </div>
                          <div className="flex gap-0.5">
                            <button onClick={() => showHistoryFn(entry)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><History className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(entry)} disabled={deleting !== null} className="p-1 rounded hover:bg-red-50 text-red-400 disabled:opacity-50">
                              {deleting === entry.id ? <span className="inline-block w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add form */}
              <div className="bg-emerald-50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-semibold text-emerald-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Ajouter</h4>
                {addStart ? (
                  <p className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                    {new Date(addStart + "T00:00:00").toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" })}
                    {addEnd && ` → ${new Date(addEnd + "T00:00:00").toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" })}`}
                    {!addEnd && " (cliquez un 2e jour pour une période)"}
                    <button onClick={() => { setAddStart(""); setAddEnd(""); }} className="ml-2 text-emerald-500 hover:text-emerald-700">✕</button>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400">Cliquez sur un jour du calendrier</p>
                )}
                <SearchableSelect
                  options={[...codes].sort((a, b) => a.code.localeCompare(b.code)).map((c) => ({
                    value: String(c.id),
                    label: `${c.code} - ${c.description}`,
                    colorHex: c.color_hex,
                    textColorHex: c.text_color_hex,
                  }))}
                  value={addCode}
                  onChange={(v) => setAddCode(v)}
                  placeholder="Code absence..."
                />
                {balanceInfo && (
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${
                    balanceInfo.entitled - balanceInfo.used <= 0
                      ? "bg-red-50 text-red-700"
                      : balanceInfo.entitled - balanceInfo.used < (balanceInfo.unit === "minutes" ? 480 : 2)
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}>
                    <span>Solde: {balanceInfo.unit === "minutes"
                      ? `${Math.floor((balanceInfo.entitled - balanceInfo.used) / 60)}h${String(Math.abs((balanceInfo.entitled - balanceInfo.used) % 60)).padStart(2, "0")}`
                      : `${balanceInfo.entitled - balanceInfo.used}j`
                    }</span>
                    <span className="text-slate-400">/ {balanceInfo.unit === "minutes"
                      ? `${Math.floor(balanceInfo.entitled / 60)}h${String(balanceInfo.entitled % 60).padStart(2, "0")}`
                      : `${balanceInfo.entitled}j`
                    }</span>
                    {balanceInfo.entitled - balanceInfo.used <= 0 && <AlertTriangle className="w-3 h-3" />}
                  </div>
                )}
                {isHours && (
                  <div>
                    <input type="number" value={addMinutes} onChange={(e) => setAddMinutes(e.target.value)} placeholder="Vide = journée complète" className="w-full px-2 py-1 border rounded text-xs focus:border-emerald-500 focus:outline-none" />
                    {addMinutes && Number(addMinutes) > 0 && (
                      <p className={`text-[10px] mt-0.5 ${Number(addMinutes) > 0 && Number(addMinutes) < 60 ? "text-amber-600 font-medium" : "text-slate-500"}`}>
                        = {Math.floor(Number(addMinutes) / 60)}h{String(Number(addMinutes) % 60).padStart(2, "0")}
                        {Number(addMinutes) > 0 && Number(addMinutes) < 60 && " ⚠️ Moins d'1h — vérifiez"}
                      </p>
                    )}
                  </div>
                )}
                {!isHours && addCode && <input type="number" step="0.5" value={addDays} onChange={(e) => setAddDays(e.target.value)} placeholder="Jours (ex: 1)" className="w-full px-2 py-1 border rounded text-xs focus:border-emerald-500 focus:outline-none" />}
                {addStart && timesheet && isHours && (
                  <p className="text-[10px] text-slate-500">
                    {!addMinutes ? "⏱️ Journée complète = " : "Horaire ce jour: "}
                    {(() => { const m = getScheduleMinutes(timesheet, new Date(addStart)); return `${Math.floor(m/60)}h${String(m%60).padStart(2,"0")}`; })()}
                    {addEnd && !addMinutes && " par jour (selon horaire)"}
                    {addEnd && addMinutes && " (par jour ouvré)"}
                  </p>
                )}
                {validationWarning && (
                  <p className="text-[10px] text-red-600 font-medium bg-red-50 px-2 py-1 rounded">{validationWarning}</p>
                )}
                <button onClick={handleAdd} disabled={saving || !addStart || !addCode || (balanceInfo !== null && balanceInfo.entitled - balanceInfo.used <= 0)} className="w-full py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {saving ? "..." : (balanceInfo && balanceInfo.entitled - balanceInfo.used <= 0) ? "Solde épuisé" : "Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Audit modal */}
      {showAudit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setShowAudit(false)}>
          <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm mx-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-900">Historique {auditLabel ? new Date(auditLabel + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}</h3>
              <button onClick={() => setShowAudit(false)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            {auditHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun historique.</p>
            ) : (
              <div className="space-y-2">
                {auditHistory.map((a) => (
                  <div key={a.id} className="border-l-2 border-emerald-200 pl-2 py-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${a.action === "INSERT" ? "bg-green-100 text-green-700" : a.action === "DELETE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{a.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(a.performed_at).toLocaleString("fr-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {a.context && <p className="text-[10px] text-slate-500">{a.context}</p>}
                    {(a.new_values || a.old_values) && (() => {
                      const vals = (a.action === "DELETE" ? a.old_values : a.new_values) as Record<string, unknown> | null;
                      if (!vals) return null;
                      const code = codes.find((c) => c.id === Number(vals.absence_code_id));
                      const minutes = vals.absence_minutes ? `${vals.absence_minutes} min` : null;
                      const days = vals.absence_days ? `${vals.absence_days}j` : null;
                      return (
                        <div className="mt-0.5 text-[10px] text-slate-600 bg-slate-50 rounded px-1.5 py-0.5">
                          {code && <span className="font-medium">{code.code}</span>}
                          {(minutes || days) && <span className="ml-1">({minutes || days})</span>}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
