"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { auditLog } from "@/lib/audit";
import { ChevronLeft, ChevronRight, Plus, Trash2, History, X, CalendarPlus } from "lucide-react";

interface Employee { id: number; first_name: string; last_name: string; }
interface AbsenceCode { id: number; code: string; description: string; color_hex: string | null; text_color_hex: string | null; time_unit: string; }
interface CalendarEntry { id: number; absence_date: string; absence_code_id: number; absence_minutes: number | null; absence_days: number | null; reason: string | null; }
interface AuditEntry { id: number; action: string; old_values: Record<string, unknown> | null; new_values: Record<string, unknown> | null; changed_fields: string[] | null; performed_at: string; context: string | null; }

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export default function EncoderDrawer() {
  const [open, setOpen] = useState(false);
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
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [auditRecordId, setAuditRecordId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

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

  async function handleAdd() {
    if (!selectedEmp || !addCode || !addStart) return;
    setSaving(true);
    const supabase = createClient();
    const start = new Date(addStart);
    const end = addEnd ? new Date(addEnd) : start;
    const daysToInsert: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) daysToInsert.push(d.toISOString().split("T")[0]);
    }
    for (const day of daysToInsert) {
      const record = { employee_id: selectedEmp.id, absence_date: day, absence_code_id: Number(addCode), absence_minutes: isHours ? (Number(addMinutes) || null) : null, absence_days: !isHours ? (Number(addDays) || 1) : null, year: Number(day.split("-")[0]) };
      const { data } = await supabase.from("year_calendar").insert(record).select("id").single();
      if (data) await auditLog({ tableName: "year_calendar", recordId: data.id, action: "INSERT", newValues: record, context: "Encodeur rapide" });
    }
    setAddStart(""); setAddEnd(""); setAddCode(""); setAddMinutes(""); setAddDays("");
    setSaving(false);
    fetchEntries();
  }

  async function handleDelete(entry: CalendarEntry) {
    if (!confirm("Supprimer cette absence ?")) return;
    const supabase = createClient();
    await supabase.from("year_calendar").delete().eq("id", entry.id);
    await auditLog({ tableName: "year_calendar", recordId: entry.id, action: "DELETE", oldValues: entry as unknown as Record<string, unknown>, context: "Encodeur rapide" });
    fetchEntries();
  }

  async function showHistoryFn(entryId: number) {
    setAuditRecordId(entryId);
    setShowAudit(true);
    const supabase = createClient();
    const { data } = await supabase.from("audit_log").select("id, action, old_values, new_values, changed_fields, performed_at, context").eq("table_name", "year_calendar").eq("record_id", entryId).order("performed_at", { ascending: false });
    if (data) setAuditHistory(data);
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
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-105"
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
                    return (
                      <div key={day} className={`aspect-square flex items-center justify-center rounded text-[10px] font-medium ${isWeekend ? "bg-slate-200 text-slate-400" : ""}`}
                        style={dayEntries.length > 0 ? { backgroundColor: getCodeColor(dayEntries[0].absence_code_id).bg, color: getCodeColor(dayEntries[0].absence_code_id).text } : {}}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Entries list */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Ce mois ({entries.length})</h4>
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
                            <button onClick={() => showHistoryFn(entry.id)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><History className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(entry)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3 h-3" /></button>
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
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[10px] text-slate-500">Début</label><input type="date" value={addStart} onChange={(e) => setAddStart(e.target.value)} className="w-full px-2 py-1 border rounded text-xs focus:border-emerald-500 focus:outline-none" /></div>
                  <div><label className="text-[10px] text-slate-500">Fin</label><input type="date" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className="w-full px-2 py-1 border rounded text-xs focus:border-emerald-500 focus:outline-none" /></div>
                </div>
                <select value={addCode} onChange={(e) => setAddCode(e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs focus:border-emerald-500 focus:outline-none">
                  <option value="">— Code absence —</option>
                  {codes.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.description}</option>)}
                </select>
                {isHours && <input type="number" value={addMinutes} onChange={(e) => setAddMinutes(e.target.value)} placeholder="Minutes (ex: 480 = 8h)" className="w-full px-2 py-1 border rounded text-xs focus:border-emerald-500 focus:outline-none" />}
                {!isHours && addCode && <input type="number" step="0.5" value={addDays} onChange={(e) => setAddDays(e.target.value)} placeholder="Jours (ex: 1)" className="w-full px-2 py-1 border rounded text-xs focus:border-emerald-500 focus:outline-none" />}
                <button onClick={handleAdd} disabled={saving || !addStart || !addCode} className="w-full py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  {saving ? "..." : "Enregistrer"}
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
              <h3 className="text-xs font-semibold text-slate-900">Historique #{auditRecordId}</h3>
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
