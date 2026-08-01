"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Clock, Plus, Pencil, Trash2, Check, ArrowLeft } from "lucide-react";

// ---------- TYPES ----------

interface Timesheet {
  id: number;
  employee_id: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  saturday_minutes: number | null;
  sunday_minutes: number | null;
  full_time_minutes: number;
  comment: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface TimesheetForm {
  monday_minutes: string;
  tuesday_minutes: string;
  wednesday_minutes: string;
  thursday_minutes: string;
  friday_minutes: string;
  saturday_minutes: string;
  sunday_minutes: string;
  full_time_minutes: string;
  start_date: string;
  end_date: string;
  comment: string;
}

const emptyForm: TimesheetForm = {
  monday_minutes: "0",
  tuesday_minutes: "0",
  wednesday_minutes: "0",
  thursday_minutes: "0",
  friday_minutes: "0",
  saturday_minutes: "0",
  sunday_minutes: "0",
  full_time_minutes: "2280",
  start_date: "",
  end_date: "",
  comment: "",
};

// ---------- HELPERS ----------

function minutesToHM(m: number | null) {
  if (!m) return "\u2014";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

function totalMinutes(ts: Timesheet): number {
  return (
    (ts.monday_minutes || 0) +
    (ts.tuesday_minutes || 0) +
    (ts.wednesday_minutes || 0) +
    (ts.thursday_minutes || 0) +
    (ts.friday_minutes || 0) +
    (ts.saturday_minutes || 0) +
    (ts.sunday_minutes || 0)
  );
}

function pctTemps(ts: Timesheet): number {
  if (!ts.full_time_minutes) return 0;
  return Math.round((totalMinutes(ts) / ts.full_time_minutes) * 100);
}

function formatDate(d: string | null) {
  if (!d) return "\u2014";
  return new Date(d + "T00:00:00").toLocaleDateString("fr-BE");
}

// ---------- PAGE ----------

export default function TimesheetsPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [employeeName, setEmployeeName] = useState("");
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TimesheetForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchData() {
    setLoading(true);

    const [empRes, tsRes] = await Promise.all([
      supabase
        .from("employees")
        .select("first_name, last_name")
        .eq("id", id)
        .single(),
      supabase
        .from("timesheets")
        .select("*")
        .eq("employee_id", id)
        .order("is_active", { ascending: false })
        .order("start_date", { ascending: false }),
    ]);

    if (empRes.data) {
      setEmployeeName(`${empRes.data.first_name} ${empRes.data.last_name}`);
    }
    if (tsRes.data) {
      setTimesheets(tsRes.data as Timesheet[]);
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function startEdit(ts: Timesheet) {
    setEditingId(ts.id);
    setForm({
      monday_minutes: String(ts.monday_minutes || 0),
      tuesday_minutes: String(ts.tuesday_minutes || 0),
      wednesday_minutes: String(ts.wednesday_minutes || 0),
      thursday_minutes: String(ts.thursday_minutes || 0),
      friday_minutes: String(ts.friday_minutes || 0),
      saturday_minutes: String(ts.saturday_minutes || 0),
      sunday_minutes: String(ts.sunday_minutes || 0),
      full_time_minutes: String(ts.full_time_minutes || 2280),
      start_date: ts.start_date || "",
      end_date: ts.end_date || "",
      comment: ts.comment || "",
    });
    setShowForm(true);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      employee_id: Number(id),
      monday_minutes: Number(form.monday_minutes) || 0,
      tuesday_minutes: Number(form.tuesday_minutes) || 0,
      wednesday_minutes: Number(form.wednesday_minutes) || 0,
      thursday_minutes: Number(form.thursday_minutes) || 0,
      friday_minutes: Number(form.friday_minutes) || 0,
      saturday_minutes: Number(form.saturday_minutes) || 0,
      sunday_minutes: Number(form.sunday_minutes) || 0,
      full_time_minutes: Number(form.full_time_minutes) || 2280,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      comment: form.comment || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from("timesheets").update(payload).eq("id", editingId);
    } else {
      await supabase.from("timesheets").insert(payload);
    }

    resetForm();
    setSaving(false);
    fetchData();
  }

  async function handleDelete(tsId: number) {
    if (!window.confirm("Supprimer cet horaire ?")) return;
    await supabase.from("timesheets").delete().eq("id", tsId);
    fetchData();
  }

  async function handleSetActive(tsId: number) {
    // Deactivate all timesheets for this employee
    await supabase
      .from("timesheets")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("employee_id", id);

    // Activate the selected one
    await supabase
      .from("timesheets")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", tsId);

    fetchData();
  }

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const dayLabels = [
    { key: "monday_minutes", label: "Lundi" },
    { key: "tuesday_minutes", label: "Mardi" },
    { key: "wednesday_minutes", label: "Mercredi" },
    { key: "thursday_minutes", label: "Jeudi" },
    { key: "friday_minutes", label: "Vendredi" },
    { key: "saturday_minutes", label: "Samedi" },
    { key: "sunday_minutes", label: "Dimanche" },
  ];

  if (loading) {
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
              <Clock className="w-6 h-6 text-blue-600" />
              Horaires
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

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Modifier l\u2019horaire" : "Nouvel horaire"}
          </h3>

          {/* Day inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {dayLabels.map((day) => (
              <div key={day.key}>
                <label htmlFor={day.key} className={labelClass}>
                  {day.label}
                </label>
                <input
                  id={day.key}
                  name={day.key}
                  type="number"
                  min="0"
                  max="1440"
                  value={form[day.key as keyof TimesheetForm]}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          {/* Other fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="full_time_minutes" className={labelClass}>
                Temps plein (min)
              </label>
              <input
                id="full_time_minutes"
                name="full_time_minutes"
                type="number"
                min="0"
                value={form.full_time_minutes}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="start_date" className={labelClass}>
                Date debut
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="end_date" className={labelClass}>
                Date fin
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="comment" className={labelClass}>
                Commentaire
              </label>
              <input
                id="comment"
                name="comment"
                type="text"
                maxLength={255}
                value={form.comment}
                onChange={handleChange}
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

      {/* Timesheets List */}
      {timesheets.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun horaire enregistre.</p>
        </div>
      ) : (
        <>
          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white rounded-lg border border-slate-200 shadow-sm text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Statut
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Lun
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Mar
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Mer
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Jeu
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Ven
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Sam
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Dim
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Total
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    %
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Debut
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Fin
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Commentaire
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {timesheets.map((ts) => (
                  <tr
                    key={ts.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      ts.is_active ? "bg-emerald-50/30" : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      {ts.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <Check className="w-3 h-3" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.monday_minutes)}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.tuesday_minutes)}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.wednesday_minutes)}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.thursday_minutes)}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.friday_minutes)}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.saturday_minutes)}
                    </td>
                    <td className="px-3 py-2">
                      {minutesToHM(ts.sunday_minutes)}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {minutesToHM(totalMinutes(ts))}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {pctTemps(ts)}%
                    </td>
                    <td className="px-3 py-2">
                      {formatDate(ts.start_date)}
                    </td>
                    <td className="px-3 py-2">{formatDate(ts.end_date)}</td>
                    <td className="px-3 py-2 max-w-[150px] truncate">
                      {ts.comment || "\u2014"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {!ts.is_active && (
                          <button
                            onClick={() => handleSetActive(ts.id)}
                            title="Definir comme actif"
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(ts)}
                          title="Modifier"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ts.id)}
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

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {timesheets.map((ts) => (
              <div
                key={ts.id}
                className={`bg-white rounded-lg border shadow-sm p-4 ${
                  ts.is_active
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-slate-200"
                }`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {ts.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <Check className="w-3 h-3" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Inactif
                      </span>
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {pctTemps(ts)}% temps
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!ts.is_active && (
                      <button
                        onClick={() => handleSetActive(ts.id)}
                        title="Definir comme actif"
                        className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(ts)}
                      title="Modifier"
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ts.id)}
                      title="Supprimer"
                      className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day grid */}
                <div className="grid grid-cols-4 gap-2 text-xs mb-3">
                  <div className="flex flex-col">
                    <span className="text-slate-400">Lun</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.monday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Mar</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.tuesday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Mer</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.wednesday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Jeu</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.thursday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Ven</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.friday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Sam</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.saturday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Dim</span>
                    <span className="font-medium text-slate-700">
                      {minutesToHM(ts.sunday_minutes)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold text-slate-900">
                      {minutesToHM(totalMinutes(ts))}
                    </span>
                  </div>
                </div>

                {/* Meta info */}
                <div className="border-t border-slate-100 pt-2 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Temps plein: {minutesToHM(ts.full_time_minutes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Du {formatDate(ts.start_date)} au{" "}
                      {formatDate(ts.end_date)}
                    </span>
                  </div>
                  {ts.comment && (
                    <p className="text-slate-400 italic truncate">
                      {ts.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
