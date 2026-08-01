"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TreePalm, Plus, Pencil, Trash2, ArrowLeft, Calendar } from "lucide-react";

// ---------- TYPES ----------

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  text_color_hex?: string | null;
}

interface VacationRight {
  id: number;
  employee_id: number;
  absence_code_id: number;
  year: number;
  days: number;
  hours: number;
  minutes: number;
  absence_codes: AbsenceCode;
}

interface VacationRightForm {
  absence_code_id: string;
  year: string;
  days: string;
  hours: string;
  minutes: string;
}

// ---------- HELPERS ----------

function currentYear() {
  return new Date().getFullYear();
}

function getYearOptions(): number[] {
  const cur = currentYear();
  return [cur - 2, cur - 1, cur, cur + 1];
}

function emptyForm(year: number): VacationRightForm {
  return {
    absence_code_id: "",
    year: String(year),
    days: "0",
    hours: "0",
    minutes: "0",
  };
}

// ---------- PAGE ----------

export default function VacationRightsPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [employeeName, setEmployeeName] = useState("");
  const [rights, setRights] = useState<VacationRight[]>([]);
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [selectedYear, setSelectedYear] = useState(currentYear());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VacationRightForm>(emptyForm(currentYear()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployee();
    fetchAbsenceCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchRights();
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
      .select("id, code, description, color_hex")
      .order("code");
    if (data) {
      setAbsenceCodes(data as AbsenceCode[]);
    }
  }

  async function fetchRights() {
    setLoading(true);
    const { data } = await supabase
      .from("vacation_rights")
      .select("*, absence_codes(id, code, description, color_hex, text_color_hex)")
      .eq("employee_id", id)
      .eq("year", selectedYear);
    if (data) {
      setRights(data as unknown as VacationRight[]);
    }
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm(selectedYear));
    setShowForm(false);
  }

  function startEdit(right: VacationRight) {
    setEditingId(right.id);
    setForm({
      absence_code_id: String(right.absence_code_id),
      year: String(right.year),
      days: String(right.days || 0),
      hours: String(right.hours || 0),
      minutes: String(right.minutes || 0),
    });
    setShowForm(true);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      employee_id: Number(id),
      absence_code_id: Number(form.absence_code_id),
      year: Number(form.year),
      days: Number(form.days) || 0,
      hours: Number(form.hours) || 0,
      minutes: Number(form.minutes) || 0,
    };

    if (editingId) {
      await supabase.from("vacation_rights").update(payload).eq("id", editingId);
    } else {
      await supabase.from("vacation_rights").insert(payload);
    }

    resetForm();
    setSaving(false);
    fetchRights();
  }

  async function handleDelete(rightId: number) {
    if (!window.confirm("Supprimer ce droit de conge ?")) return;
    await supabase.from("vacation_rights").delete().eq("id", rightId);
    fetchRights();
  }

  // ---------- TOTALS ----------

  const totalDays = rights.reduce((sum, r) => sum + (r.days || 0), 0);
  const totalMinutesAll = rights.reduce(
    (sum, r) => sum + (r.hours || 0) * 60 + (r.minutes || 0),
    0
  );
  const totalHours = Math.floor(totalMinutesAll / 60);
  const totalMins = totalMinutesAll % 60;

  // ---------- STYLES ----------

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading && rights.length === 0) {
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
              <TreePalm className="w-6 h-6 text-green-600" />
              Droits de conges
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

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Modifier le droit" : "Nouveau droit de conge"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="sm:col-span-2 md:col-span-2">
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
              <label htmlFor="form-year" className={labelClass}>
                Annee
              </label>
              <input
                id="form-year"
                name="year"
                type="number"
                min={currentYear() - 5}
                max={currentYear() + 5}
                value={form.year}
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
                name="days"
                type="number"
                min="0"
                value={form.days}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="form-hours" className={labelClass}>
                Heures
              </label>
              <input
                id="form-hours"
                name="hours"
                type="number"
                min="0"
                value={form.hours}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label htmlFor="form-minutes" className={labelClass}>
                Minutes
              </label>
              <input
                id="form-minutes"
                name="minutes"
                type="number"
                min="0"
                max="59"
                value={form.minutes}
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

      {/* Rights List */}
      {rights.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <TreePalm className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucun droit de conge pour {selectedYear}.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full bg-white rounded-lg border border-slate-200 shadow-sm text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
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
                    Minutes
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rights.map((right) => (
                  <tr
                    key={right.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: right.absence_codes?.color_hex || "#e2e8f0",
                          color: right.absence_codes?.text_color_hex || "#1e293b",
                        }}
                      >
                        {right.absence_codes?.code} - {right.absence_codes?.description}
                      </span>
                    </td>
                    <td className="px-4 py-2">{right.days}</td>
                    <td className="px-4 py-2">{right.hours}</td>
                    <td className="px-4 py-2">{right.minutes}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(right)}
                          title="Modifier"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(right.id)}
                          title="Supprimer"
                          className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-slate-50 font-semibold border-t border-slate-200">
                  <td className="px-4 py-2 text-slate-700">Total</td>
                  <td className="px-4 py-2 text-slate-900">{totalDays}</td>
                  <td className="px-4 py-2 text-slate-900">{totalHours}</td>
                  <td className="px-4 py-2 text-slate-900">{totalMins}</td>
                  <td className="px-4 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {rights.map((right) => (
              <div
                key={right.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-4"
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: right.absence_codes?.color_hex || "#e2e8f0",
                      color: right.absence_codes?.text_color_hex || "#1e293b",
                    }}
                  >
                    {right.absence_codes?.code} - {right.absence_codes?.description}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(right)}
                      title="Modifier"
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(right.id)}
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
                    <span className="text-slate-400 text-xs">Jours</span>
                    <span className="font-medium text-slate-700">{right.days}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Heures</span>
                    <span className="font-medium text-slate-700">{right.hours}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-xs">Minutes</span>
                    <span className="font-medium text-slate-700">{right.minutes}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total card */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Total</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm mt-2">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Jours</span>
                  <span className="font-bold text-slate-900">{totalDays}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Heures</span>
                  <span className="font-bold text-slate-900">{totalHours}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Minutes</span>
                  <span className="font-bold text-slate-900">{totalMins}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
