"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, ArrowLeft } from "lucide-react";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface AbsenceCode {
  id: number;
  code: string;
  label: string;
  time_unit: string;
  default_days: number | null;
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const sectionClass = "bg-white rounded-lg border border-slate-200 p-6 shadow-sm";

export default function NewAbsencePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absenceCodes, setAbsenceCodes] = useState<AbsenceCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hours, setHours] = useState<string>("");

  const selectedAbsenceCode = absenceCodes.find(
    (c) => c.id === Number(selectedCode)
  );
  const isHours = selectedAbsenceCode?.time_unit === "H";

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [empRes, codesRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase
          .from("absence_codes")
          .select("id, code, label, time_unit, default_days")
          .order("code"),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (codesRes.data) setAbsenceCodes(codesRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  function calculateDuration(): number {
    if (isHours) {
      return Number(hours) || 0;
    }
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const duration = calculateDuration();

    if (!selectedEmployee || !selectedCode || !startDate || !endDate) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setSubmitting(false);
      return;
    }

    if (duration <= 0) {
      setError("La durée doit être supérieure à 0.");
      setSubmitting(false);
      return;
    }

    // Insert into holiday_selections
    const { data: holidayData, error: holidayError } = await supabase
      .from("holiday_selections")
      .insert({
        employee_id: Number(selectedEmployee),
        absence_code_id: Number(selectedCode),
        start_date: startDate,
        end_date: endDate,
        duration: duration,
      })
      .select("id")
      .single();

    if (holidayError || !holidayData) {
      setError(
        `Erreur lors de la creation: ${holidayError?.message || "Inconnue"}`
      );
      setSubmitting(false);
      return;
    }

    // Insert into year_calendar for each day of the range
    const calendarEntries = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      calendarEntries.push({
        employee_id: Number(selectedEmployee),
        date: dateStr,
        absence_code_id: Number(selectedCode),
      });
    }

    const { error: calError } = await supabase
      .from("year_calendar")
      .insert(calendarEntries);

    if (calError) {
      // Rollback: delete the holiday_selection we just created
      await supabase
        .from("holiday_selections")
        .delete()
        .eq("id", holidayData.id);
      setError(
        `Erreur lors de l'insertion au calendrier: ${calError.message}. La reservation a ete annulee.`
      );
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => {
      router.push("/absences");
    }, 2000);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-500 mt-4">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/absences")}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nouvelle absence
          </h1>
          <p className="text-slate-500 mt-1">
            Enregistrer une absence pour un employe
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800">
          Absence enregistree avec succes ! Redirection en cours...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={sectionClass}>
        <div className="space-y-5">
          {/* Employee selection */}
          <div>
            <label className={labelClass}>Employe *</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Selectionner un employe</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.last_name}, {emp.first_name}
                </option>
              ))}
            </select>
          </div>

          {/* Absence code selection */}
          <div>
            <label className={labelClass}>Code d&apos;absence *</label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Selectionner un code</option>
              {absenceCodes.map((code) => (
                <option key={code.id} value={code.id}>
                  {code.code} - {code.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date de debut *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Date de fin *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Hours field if time_unit is H */}
          {isHours && (
            <div>
              <label className={labelClass}>Nombre d&apos;heures *</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={inputClass}
                placeholder="Ex: 4"
                required
              />
            </div>
          )}

          {/* Duration display */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Duree calculee :</span>{" "}
              {calculateDuration()}{" "}
              {isHours ? "heure(s)" : "jour(s)"}
            </p>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting || success}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              {submitting ? "Enregistrement..." : "Enregistrer l'absence"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
