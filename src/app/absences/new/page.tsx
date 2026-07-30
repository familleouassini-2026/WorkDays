"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  text_color_hex: string | null;
  time_unit: string; // HOURS_MINUTES or DAYS
}

export default function NewAbsencePage() {
  const router = useRouter();
  const supabase = createClient();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    employee_id: "",
    absence_code_id: "",
    start_date: "",
    end_date: "",
    num_days: "",
    absence_hours: "",
    absence_minutes: "",
    reason: "",
  });

  const selectedCode = absenceCodes.find(
    (c) => c.id === Number(form.absence_code_id)
  );
  const isTimeUnit = selectedCode?.time_unit === "HOURS_MINUTES";

  useEffect(() => {
    async function fetchData() {
      const [empRes, codesRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase.from("absence_codes").select("*").order("sort_order"),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (codesRes.data) setAbsenceCodes(codesRes.data);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.employee_id) {
      setError("Veuillez selectionner un employe.");
      return;
    }
    if (!form.absence_code_id) {
      setError("Veuillez selectionner un type d'absence.");
      return;
    }
    if (!form.start_date) {
      setError("La date de debut est obligatoire.");
      return;
    }
    if (!form.end_date) {
      setError("La date de fin est obligatoire.");
      return;
    }

    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);
    if (endDate < startDate) {
      setError("La date de fin doit etre apres la date de debut.");
      return;
    }

    let totalMinutes: number | null = null;
    let numDays: number | null = null;

    if (isTimeUnit) {
      const hours = Number(form.absence_hours) || 0;
      const mins = Number(form.absence_minutes) || 0;
      totalMinutes = hours * 60 + mins;
      if (totalMinutes <= 0) {
        setError("Veuillez indiquer la duree en heures/minutes.");
        return;
      }
    } else {
      numDays = Number(form.num_days) || null;
      if (!numDays || numDays <= 0) {
        setError("Veuillez indiquer le nombre de jours.");
        return;
      }
    }

    setLoading(true);

    // Insert into holiday_selections
    const { data: selectionData, error: selectionError } = await supabase
      .from("holiday_selections")
      .insert([
        {
          employee_id: Number(form.employee_id),
          absence_code_id: Number(form.absence_code_id),
          start_date: form.start_date,
          end_date: form.end_date,
          num_days: numDays,
          absence_year: startDate.getFullYear(),
          absence_minutes: totalMinutes,
          reason: form.reason || null,
          status: "PENDING",
        },
      ])
      .select("id")
      .single();

    if (selectionError) {
      setError(selectionError.message);
      setLoading(false);
      return;
    }

    // Create year_calendar entries for each day in the range
    const calendarEntries: Array<{
      year: number;
      absence_date: string;
      employee_id: number;
      absence_code_id: number;
      absence_minutes: number | null;
      absence_days: number | null;
      reason: string | null;
      holiday_selection_id: number;
    }> = [];

    const current = new Date(form.start_date);
    const end = new Date(form.end_date);

    // Calculate per-day values
    let daysCount = 0;
    const tempDate = new Date(form.start_date);
    while (tempDate <= end) {
      const dayOfWeek = tempDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysCount++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const perDayMinutes = totalMinutes && daysCount > 0 ? Math.round(totalMinutes / daysCount) : null;
    const perDayDays = numDays && daysCount > 0 ? numDays / daysCount : null;

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        calendarEntries.push({
          year: current.getFullYear(),
          absence_date: current.toISOString().split("T")[0],
          employee_id: Number(form.employee_id),
          absence_code_id: Number(form.absence_code_id),
          absence_minutes: perDayMinutes,
          absence_days: perDayDays ? Math.round(perDayDays * 100) / 100 : null,
          reason: form.reason || null,
          holiday_selection_id: selectionData.id,
        });
      }
      current.setDate(current.getDate() + 1);
    }

    if (calendarEntries.length > 0) {
      const { error: calError } = await supabase
        .from("year_calendar")
        .insert(calendarEntries);

      if (calError) {
        setError(calError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      router.push("/absences");
    }, 1500);
  }

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass =
    "bg-white rounded-lg border border-gray-200 p-6 shadow-sm";

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="bg-green-50 rounded-lg border border-green-200 p-8">
          <div className="text-green-600 text-4xl mb-4">&#10003;</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Absence enregistree avec succes
          </h2>
          <p className="text-green-700 text-sm">
            La demande a ete creee avec le statut &quot;En attente&quot;.
            Redirection en cours...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Nouvelle absence
        </h1>
        <Link
          href="/absences"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Selection */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Employe
          </legend>
          <div>
            <label htmlFor="employee_id" className={labelClass}>
              Selectionner un employe <span className="text-red-500">*</span>
            </label>
            <select
              id="employee_id"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- Choisir un employe --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.last_name}, {emp.first_name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Absence Code */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Type d&apos;absence
          </legend>
          <div>
            <label htmlFor="absence_code_id" className={labelClass}>
              Code absence <span className="text-red-500">*</span>
            </label>
            <select
              id="absence_code_id"
              name="absence_code_id"
              value={form.absence_code_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- Choisir un type --</option>
              {absenceCodes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.code} - {code.description}
                </option>
              ))}
            </select>
          </div>
          {/* Color badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {absenceCodes.map((code) => (
              <button
                type="button"
                key={code.id}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    absence_code_id: String(code.id),
                  }))
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                  Number(form.absence_code_id) === code.id
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent"
                }`}
                style={{
                  backgroundColor: code.color_hex || "#e2e8f0",
                  color: code.text_color_hex || "#1e293b",
                }}
              >
                {code.code}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Dates */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Periode
          </legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="start_date" className={labelClass}>
                Date de debut <span className="text-red-500">*</span>
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
                Date de fin <span className="text-red-500">*</span>
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
          </div>
        </fieldset>

        {/* Duration */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Duree
          </legend>
          {isTimeUnit ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="absence_hours" className={labelClass}>
                  Heures
                </label>
                <input
                  id="absence_hours"
                  name="absence_hours"
                  type="number"
                  min="0"
                  max="999"
                  value={form.absence_hours}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="absence_minutes" className={labelClass}>
                  Minutes
                </label>
                <input
                  id="absence_minutes"
                  name="absence_minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={form.absence_minutes}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="num_days" className={labelClass}>
                Nombre de jours <span className="text-red-500">*</span>
              </label>
              <input
                id="num_days"
                name="num_days"
                type="number"
                min="0.5"
                step="0.5"
                value={form.num_days}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ex: 1, 0.5, 5"
              />
              <p className="mt-1 text-xs text-gray-500">
                Utilisez 0.5 pour une demi-journee
              </p>
            </div>
          )}
          {!selectedCode && (
            <p className="text-sm text-gray-400 italic mt-2">
              Selectionnez un type d&apos;absence pour voir les options de duree.
            </p>
          )}
        </fieldset>

        {/* Reason */}
        <fieldset className={sectionClass}>
          <legend className="mb-4 text-lg font-semibold text-gray-800">
            Motif
          </legend>
          <div>
            <label htmlFor="reason" className={labelClass}>
              Raison (facultatif)
            </label>
            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={3}
              className={inputClass}
              placeholder="Indiquez la raison si necessaire..."
            />
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/absences"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
