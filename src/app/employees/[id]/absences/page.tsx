"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Plus, Pencil, Trash2, ArrowLeft, AlertCircle } from "lucide-react";

// ---------- TYPES ----------

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  text_color_hex: string | null;
  time_unit: string | null;
}

interface YearCalendarEntry {
  id: number;
  year: number;
  absence_date: string;
  employee_id: number;
  absence_code_id: number;
  absence_minutes: number | null;
  absence_days: number | null;
  reason: string | null;
  holiday_selection_id: number | null;
  absence_codes: AbsenceCode;
}

interface AbsenceForm {
  absence_code_id: string;
  absence_date: string;
  absence_days: string;
  absence_minutes: string;
  reason: string;
}

// ---------- HELPERS ----------

function currentYear() {
  return new Date().getFullYear();
}

function getYearOptions(): number[] {
  const cur = currentYear();
  return [cur - 5, cur - 4, cur - 3, cur - 2, cur - 1, cur, cur + 1];
}

function emptyForm(): AbsenceForm {
  return {
    absence_code_id: "",
    absence_date: "",
    absence_days: "",
    absence_minutes: "",
    reason: "",
  };
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function formatDateFrBe(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const label = d.toLocaleDateString("fr-BE", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupByMonth(entries: YearCalendarEntry[]): Record<string, YearCalendarEntry[]> {
  const groups: Record<string, YearCalendarEntry[]> = {};
  for (const entry of entries) {
    const key = entry.absence_date.substring(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

// ---------- PAGE ----------

export default function AbsencesPage() {
  const params = useParams();
  const id = params.id as string;
  // createBrowserClient from @supabase/ssr returns a singleton (memoized by URL+key),
  // so calling createClient() at component body level does not create multiple instances.
  const supabase = createClient();

  const [employeeName, setEmployeeName] = useState("");
  const [entries, setEntries] = useState<YearCalendarEntry[]>([]);
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AbsenceForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployee();
    fetchAbsenceCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedYear]);

  async function fetchEmployee() {
    const { data } = await supabase
      .from("employees")
      .select("first_name, last_name")
      .eq("id", id)
      .single();
    if (data) {
      setEmployeeName(`${data.first_name} ${data.last_name}`);
    }
  }

  async function fetchAbsenceCodes() {
    const { data } = await supabase
      .from("absence_codes")
      .select("id, code, description, color_hex, text_color_hex, time_unit")
      .order("code");
    if (data) {
      setAbsenceCodes(data as AbsenceCode[]);
    }
  }

  async function fetchEntries() {
    setLoading(true);
    const { data } = await supabase
      .from("year_calendar")
      .select("*, absence_codes(id, code, description, color_hex, text_color_hex, time_unit)")
      .eq("employee_id", id)
      .eq("year", selectedYear)
      .order("absence_date", { ascending: false });
    if (data) {
      setEntries(data as unknown as YearCalendarEntry[]);
    }
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(false);
    setError(null);
  }

  function startEdit(entry: YearCalendarEntry) {
    setEditingId(entry.id);
    setForm({
      absence_code_id: String(entry.absence_code_id),
      absence_date: entry.absence_date,
      absence_days: entry.absence_days !== null ? String(entry.absence_days) : "",
      absence_minutes: entry.absence_minutes !== null ? String(entry.absence_minutes) : "",
      reason: entry.reason || "",
    });
    setShowForm(true);
    setError(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.absence_code_id || !form.absence_date) {
      setError("Le code absence et la date sont obligatoires.");
      return;
    }

    setSaving(true);

    const yearFromDate = new Date(form.absence_date).getFullYear();

    const payload = {
      employee_id: Number(id),
      absence_code_id: Number(form.absence_code_id),
      absence_date: form.absence_date,
      year: yearFromDate,
      absence_days: form.absence_days ? Number(form.absence_days) : null,
      absence_minutes: form.absence_minutes ? Number(form.absence_minutes) : null,
      reason: form.reason || null,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("year_calendar")
        .update(payload)
        .eq("id", editingId);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: err } = await supabase
        .from("year_calendar")
        .insert(payload);
      if (err) {
        setError(err.message);
        setSaving(false);
        return;
      }
    }

    resetForm();
    setSaving(false);
    // If the year changed, update selectedYear to show the new entry
    if (yearFromDate !== selectedYear) {
      setSelectedYear(yearFromDate);
    } else {
      fetchEntries();
    }
  }

  async function handleDelete(entryId: number) {
    if (!window.confirm("Supprimer cette absence ?")) return;
    const { error: err } = await supabase.from("year_calendar").delete().eq("id", entryId);
    if (err) {
      setError(err.message);
      return;
    }
    fetchEntries();
  }

  // ---------- SUMMARY STATS ----------

  const totalEntries = entries.length;
  const totalDays = entries.reduce((sum, e) => sum + (e.absence_days || 0), 0);
  const totalMinutesAll = entries.reduce((sum, e) => sum + (e.absence_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutesAll / 60);
  const totalMins = totalMinutesAll % 60;

  // ---------- GROUPED DATA ----------

  const grouped = groupByMonth(entries);
  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  // ---------- STYLES ----------

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/employees/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Retour a la fiche
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Absences
            </h1>
            <p className="text-slate-500 mt-1">{employeeName}</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-slate-500" />
        <label htmlFor="year-select" className="text-sm font-medium text-slate-700">
          Annee :
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {getYearOptions().map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total absences</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalEntries}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Jours pris</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalDays}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Heures prises</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalHours}h{String(totalMins).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Modifier l'absence" : "Nouvelle absence"}
          </h3>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="absence_code_id" className={labelClass}>
                Code absence
              </label>
              <select
                id="absence_code_id"
                name="absence_code_id"
                value={form.absence_code_id}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">-- Choisir --</option>
                {absenceCodes.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.code} - {ac.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="form-date" className={labelClass}>
                Date
              </label>
              <input
                id="form-date"
                name="absence_date"
                type="date"
                value={form.absence_date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="form-days" className={labelClass}>
                Jours
              </label>
              <input
                id="form-days"
                name="absence_days"
                type="number"
                min="0"
                step="1"
                value={form.absence_days}
                onChange={handleChange}
                placeholder="Optionnel"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="form-minutes" className={labelClass}>
                Minutes
              </label>
              <input
                id="form-minutes"
                name="absence_minutes"
                type="number"
                min="0"
                value={form.absence_minutes}
                onChange={handleChange}
                placeholder="Optionnel"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label htmlFor="form-reason" className={labelClass}>
                Raison
              </label>
              <input
                id="form-reason"
                name="reason"
                type="text"
                value={form.reason}
                onChange={handleChange}
                placeholder="Optionnel"
                className={inputClass}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Enregistrement..."
                : editingId
                ? "Enregistrer"
                : "Ajouter"}
            </button>
          </div>
        </form>
      )}

      {/* Entries List */}
      {entries.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucune absence pour {selectedYear}.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table (md+) */}
          <div className="hidden md:block space-y-6">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  {getMonthLabel(grouped[monthKey][0].absence_date)}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg border border-slate-200 shadow-sm text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-2 text-left font-medium text-slate-600">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">
                          Code absence
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">
                          Jours
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">
                          Heures
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-slate-600">
                          Raison
                        </th>
                        <th className="px-4 py-2 text-right font-medium text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[monthKey].map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-slate-100 hover:bg-slate-50"
                          style={{
                            borderLeftWidth: "4px",
                            borderLeftColor: entry.absence_codes?.color_hex || "#e2e8f0",
                          }}
                        >
                          <td className="px-4 py-2 whitespace-nowrap">
                            {formatDateFrBe(entry.absence_date)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: entry.absence_codes?.color_hex || "#e2e8f0",
                                color: entry.absence_codes?.text_color_hex || "#1e293b",
                              }}
                            >
                              {entry.absence_codes?.code}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {entry.absence_days !== null ? entry.absence_days : "-"}
                          </td>
                          <td className="px-4 py-2">
                            {entry.absence_minutes !== null
                              ? formatMinutes(entry.absence_minutes)
                              : "-"}
                          </td>
                          <td className="px-4 py-2 text-slate-600 truncate max-w-[200px]">
                            {entry.reason || "-"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => startEdit(entry)}
                                title="Modifier"
                                className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                title="Supprimer"
                                className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-6">
            {monthKeys.map((monthKey) => (
              <div key={monthKey}>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  {getMonthLabel(grouped[monthKey][0].absence_date)}
                </h3>
                <div className="space-y-3">
                  {grouped[monthKey].map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white rounded-lg border border-slate-200 shadow-sm p-4"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: entry.absence_codes?.color_hex || "#e2e8f0",
                      }}
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: entry.absence_codes?.color_hex || "#e2e8f0",
                            color: entry.absence_codes?.text_color_hex || "#1e293b",
                          }}
                        >
                          {entry.absence_codes?.code} - {entry.absence_codes?.description}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(entry)}
                            title="Modifier"
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            title="Supprimer"
                            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Values */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs">Date</span>
                          <span className="font-medium text-slate-700">
                            {formatDateFrBe(entry.absence_date)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs">Jours</span>
                          <span className="font-medium text-slate-700">
                            {entry.absence_days !== null ? entry.absence_days : "-"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs">Heures</span>
                          <span className="font-medium text-slate-700">
                            {entry.absence_minutes !== null
                              ? formatMinutes(entry.absence_minutes)
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {entry.reason && (
                        <div className="mt-2 text-xs text-slate-500">
                          {entry.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
