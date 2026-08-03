"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { auditLog } from "@/lib/audit";
import { ChevronLeft, ChevronRight, Plus, Trash2, History, X } from "lucide-react";
import Link from "next/link";

interface Employee { id: number; first_name: string; last_name: string; }
interface AbsenceCode { id: number; code: string; description: string; color_hex: string | null; text_color_hex: string | null; time_unit: string; }
interface CalendarEntry { id: number; absence_date: string; absence_code_id: number; absence_minutes: number | null; absence_days: number | null; reason: string | null; }
interface AuditEntry { id: number; action: string; old_values: Record<string, unknown> | null; new_values: Record<string, unknown> | null; changed_fields: string[] | null; performed_at: string; context: string | null; }

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function EncoderPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [codes, setCodes] = useState<AbsenceCode[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Add form
  const [addStart, setAddStart] = useState("");
  const [addEnd, setAddEnd] = useState("");
  const [addCode, setAddCode] = useState("");
  const [addMinutes, setAddMinutes] = useState("");
  const [addDays, setAddDays] = useState("");
  const [saving, setSaving] = useState(false);

  // Audit
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [auditRecordId, setAuditRecordId] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const [empRes, codeRes] = await Promise.all([
        supabase.from("employees").select("id, first_name, last_name").eq("is_inactive", false).order("last_name"),
        supabase.from("absence_codes").select("id, code, description, color_hex, text_color_hex, time_unit").order("sort_order").order("code"),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (codeRes.data) setCodes(codeRes.data);
    }
    init();
  }, []);

  useEffect(() => {
    if (selectedEmp) fetchEntries();
  }, [selectedEmp, month, year]);

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
      .gte("absence_date", startDate)
      .lte("absence_date", endDate)
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

  const selectedCode = codes.find((c) => String(c.id) === addCode);
  const isHours = selectedCode?.time_unit === "HOURS_MINUTES";

  async function handleAdd() {
    if (!selectedEmp || !addCode || !addStart) return;
    setSaving(true);
    const supabase = createClient();
    const start = new Date(addStart);
    const end = addEnd ? new Date(addEnd) : start;
    const daysToInsert: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) { // skip weekends
        daysToInsert.push(d.toISOString().split("T")[0]);
      }
    }

    for (const day of daysToInsert) {
      const record = {
        employee_id: selectedEmp.id,
        absence_date: day,
        absence_code_id: Number(addCode),
        absence_minutes: isHours ? (Number(addMinutes) || null) : null,
        absence_days: !isHours ? (Number(addDays) || 1) : null,
        year: Number(day.split("-")[0]),
      };
      const { data } = await supabase.from("year_calendar").insert(record).select("id").single();
      if (data) {
        await auditLog({ tableName: "year_calendar", recordId: data.id, action: "INSERT", newValues: record, context: "Encodeur rapide" });
      }
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

  async function showHistory(entryId: number) {
    setAuditRecordId(entryId);
    setShowAudit(true);
    const supabase = createClient();
    const { data } = await supabase.from("audit_log")
      .select("id, action, old_values, new_values, changed_fields, performed_at, context")
      .eq("table_name", "year_calendar")
      .eq("record_id", entryId)
      .order("performed_at", { ascending: false });
    if (data) setAuditHistory(data);
  }

  // Calendar rendering
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

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Encodeur rapide</h1>
          <p className="text-sm text-slate-500">Encoder et gérer les absences</p>
        </div>
        <Link href="/absences" className="text-sm text-blue-600 hover:text-blue-800">← Retour absences</Link>
      </div>

      {/* Step 1: Employee search */}
      <div className="bg-white border rounded-lg p-4">
        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Employé</label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (selectedEmp && e.target.value !== `${selectedEmp.last_name} ${selectedEmp.first_name}`) setSelectedEmp(null); }}
            placeholder="Tapez 2+ lettres pour filtrer..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {!selectedEmp && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filtered.map((emp) => (
                <button key={emp.id} onClick={() => selectEmployee(emp)} className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors">
                  {emp.last_name} {emp.first_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEmp && (
        <>
          {/* Step 2: Month navigation + mini calendar */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }} className="p-1.5 rounded hover:bg-slate-100"><ChevronLeft className="w-4 h-4" /></button>
              <h3 className="text-sm font-semibold text-slate-700">{MONTHS[month]} {year}</h3>
              <button onClick={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} className="p-1.5 rounded hover:bg-slate-100"><ChevronRight className="w-4 h-4" /></button>
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d, i) => <div key={i} className="text-center text-[10px] text-slate-400 font-medium py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEntries = entryByDate[dateStr] || [];
                const isWeekend = new Date(year, month, day).getDay() % 6 === 0;
                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded text-xs relative ${
                      isWeekend ? "bg-slate-100 text-slate-400" : dayEntries.length > 0 ? "" : "hover:bg-slate-50"
                    }`}
                    style={dayEntries.length > 0 ? { backgroundColor: getCodeColor(dayEntries[0].absence_code_id).bg, color: getCodeColor(dayEntries[0].absence_code_id).text } : {}}
                    title={dayEntries.length > 0 ? `${getCodeColor(dayEntries[0].absence_code_id).label}` : ""}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {entries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                {Array.from(new Set(entries.map((e) => e.absence_code_id))).map((codeId) => {
                  const c = getCodeColor(codeId);
                  return (
                    <span key={codeId} className="inline-flex items-center gap-1 text-[10px] font-medium">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.bg }} />
                      {c.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Existing entries list */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Absences {MONTHS[month]} ({entries.length})
            </h3>
            {loading ? (
              <div className="text-center py-4"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>
            ) : entries.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucune absence ce mois</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {entries.map((entry) => {
                  const c = getCodeColor(entry.absence_code_id);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-5 rounded text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: c.bg, color: c.text }}>{c.label}</span>
                        <span className="text-sm text-slate-700">{new Date(entry.absence_date + "T00:00:00").toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" })}</span>
                        {entry.absence_minutes && <span className="text-xs text-slate-500">{Math.floor(entry.absence_minutes/60)}h{(entry.absence_minutes%60).toString().padStart(2,"0")}</span>}
                        {entry.absence_days && <span className="text-xs text-slate-500">{entry.absence_days}j</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => showHistory(entry.id)} className="p-1 rounded hover:bg-slate-100 text-slate-400" title="Historique"><History className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(entry)} className="p-1 rounded hover:bg-red-50 text-red-400" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 4: Add form */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Ajouter une absence
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">Début *</label>
                <input type="date" value={addStart} onChange={(e) => setAddStart(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Fin (optionnel)</label>
                <input type="date" value={addEnd} onChange={(e) => setAddEnd(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500">Code *</label>
                <select value={addCode} onChange={(e) => setAddCode(e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm focus:border-blue-500 focus:outline-none">
                  <option value="">— Choisir —</option>
                  {codes.map((c) => <option key={c.id} value={c.id}>{c.code} - {c.description}</option>)}
                </select>
              </div>
              {isHours && (
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Minutes (ex: 480 = 8h)</label>
                  <input type="number" value={addMinutes} onChange={(e) => setAddMinutes(e.target.value)} placeholder="480" className="w-full px-2 py-1.5 border rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              )}
              {!isHours && addCode && (
                <div className="col-span-2">
                  <label className="text-xs text-slate-500">Jours</label>
                  <input type="number" step="0.5" value={addDays} onChange={(e) => setAddDays(e.target.value)} placeholder="1" className="w-full px-2 py-1.5 border rounded text-sm focus:border-blue-500 focus:outline-none" />
                </div>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !addStart || !addCode}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Plus className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </>
      )}

      {/* Audit modal */}
      {showAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAudit(false)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Historique (enregistrement #{auditRecordId})</h3>
              <button onClick={() => setShowAudit(false)} className="p-1 rounded hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            {auditHistory.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Aucun historique pour cette entrée.</p>
            ) : (
              <div className="space-y-3">
                {auditHistory.map((a) => (
                  <div key={a.id} className="border-l-2 border-blue-200 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        a.action === "INSERT" ? "bg-green-100 text-green-700" :
                        a.action === "DELETE" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{a.action}</span>
                      <span className="text-xs text-slate-400">{new Date(a.performed_at).toLocaleString("fr-BE")}</span>
                    </div>
                    {a.context && <p className="text-xs text-slate-500 mt-0.5">via {a.context}</p>}
                    {a.changed_fields && a.changed_fields.length > 0 && (
                      <p className="text-xs text-slate-600 mt-1">Champs: {a.changed_fields.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
