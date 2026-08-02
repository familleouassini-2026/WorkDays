"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, CheckCircle2, Clock, Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface StagingEmployee {
  id: number;
  sheet_name: string;
  last_name: string;
  first_name: string;
  hire_date: string | null;
  end_date: string | null;
  sector_code: string | null;
  contract_type: string | null;
  is_inactive: boolean;
  weekly_hours_lu: number | null;
  weekly_hours_ma: number | null;
  weekly_hours_me: number | null;
  weekly_hours_je: number | null;
  weekly_hours_ve: number | null;
  weekly_hours_sa: number | null;
  weekly_hours_di: number | null;
  full_time_hours: number | null;
  notes: string | null;
  raw_header: string | null;
  extracted_at: string | null;
}

interface VacationRight {
  id: number;
  employee_name: string;
  year: number | null;
  code: string | null;
  code_description: string | null;
  total_hours: number | null;
  total_days: number | null;
  raw_annotation: string | null;
  extracted_at: string | null;
}

interface AbsenceMonthly {
  id: number;
  employee_name: string;
  year: number | null;
  month: number | null;
  code: string | null;
  hours_taken: number | null;
  days_taken: number | null;
  raw_header: string | null;
  extracted_at: string | null;
}

interface EmployeeEvent {
  id: number;
  employee_name: string;
  event_date: string | null;
  event_type: string | null;
  description: string | null;
  raw_text: string | null;
  extracted_at: string | null;
}

interface SalaryChange {
  id: number;
  employee_name: string;
  year: number | null;
  month: number | null;
  change_type: string | null;
  description: string | null;
  raw_text: string | null;
  extracted_at: string | null;
}

export default function StagingReviewPage() {
  const [employees, setEmployees] = useState<StagingEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<StagingEmployee | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatedIds, setValidatedIds] = useState<Set<number>>(new Set());

  // Related data
  const [vacationRights, setVacationRights] = useState<VacationRight[]>([]);
  const [absences, setAbsences] = useState<AbsenceMonthly[]>([]);
  const [events, setEvents] = useState<EmployeeEvent[]>([]);
  const [salaryChanges, setSalaryChanges] = useState<SalaryChange[]>([]);

  // Edit state for employee
  const [editEmployee, setEditEmployee] = useState<Partial<StagingEmployee>>({});

  // Mobile selector
  const [showMobileSelector, setShowMobileSelector] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchRelatedData(selectedEmployee.sheet_name);
      setEditEmployee({ ...selectedEmployee });
    }
  }, [selectedEmployee]);

  async function fetchEmployees() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("staging_employees")
      .select("*")
      .order("last_name");
    if (data) setEmployees(data);
    setLoading(false);
  }

  async function fetchRelatedData(sheetName: string) {
    const supabase = createClient();
    const [vrRes, absRes, evRes, scRes] = await Promise.all([
      supabase.from("staging_vacation_rights").select("*").eq("employee_name", sheetName).order("year"),
      supabase.from("staging_absences_monthly").select("*").eq("employee_name", sheetName).order("year").order("month"),
      supabase.from("staging_employee_events").select("*").eq("employee_name", sheetName).order("event_date"),
      supabase.from("staging_salary_changes").select("*").eq("employee_name", sheetName).order("year").order("month"),
    ]);
    if (vrRes.data) setVacationRights(vrRes.data);
    if (absRes.data) setAbsences(absRes.data);
    if (evRes.data) setEvents(evRes.data);
    if (scRes.data) setSalaryChanges(scRes.data);
  }

  async function saveEmployee() {
    if (!selectedEmployee) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("staging_employees")
      .update({
        last_name: editEmployee.last_name,
        first_name: editEmployee.first_name,
        hire_date: editEmployee.hire_date,
        sector_code: editEmployee.sector_code,
        contract_type: editEmployee.contract_type,
        is_inactive: editEmployee.is_inactive,
        weekly_hours_lu: editEmployee.weekly_hours_lu,
        weekly_hours_ma: editEmployee.weekly_hours_ma,
        weekly_hours_me: editEmployee.weekly_hours_me,
        weekly_hours_je: editEmployee.weekly_hours_je,
        weekly_hours_ve: editEmployee.weekly_hours_ve,
        full_time_hours: editEmployee.full_time_hours,
        notes: editEmployee.notes,
      })
      .eq("id", selectedEmployee.id);
    if (!error) {
      const updated = { ...selectedEmployee, ...editEmployee } as StagingEmployee;
      setSelectedEmployee(updated);
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    }
    setSaving(false);
  }

  function markValidated() {
    if (!selectedEmployee) return;
    setValidatedIds((prev) => { const next = new Set(Array.from(prev)); next.add(selectedEmployee.id); return next; });
  }

  // CRUD helpers for vacation rights
  async function saveVacationRight(row: VacationRight) {
    const supabase = createClient();
    const { id, ...data } = row;
    if (id < 0) {
      const { data: inserted } = await supabase.from("staging_vacation_rights").insert({ ...data }).select("*").single();
      if (inserted) setVacationRights((prev) => prev.map((r) => (r.id === id ? inserted : r)));
    } else {
      await supabase.from("staging_vacation_rights").update(data).eq("id", id);
    }
  }

  async function deleteVacationRight(id: number) {
    if (!confirm("Supprimer cette ligne ?")) return;
    const supabase = createClient();
    if (id > 0) await supabase.from("staging_vacation_rights").delete().eq("id", id);
    setVacationRights((prev) => prev.filter((r) => r.id !== id));
  }

  function addVacationRight() {
    if (!selectedEmployee) return;
    const newRow: VacationRight = {
      id: -Date.now(),
      employee_name: selectedEmployee.sheet_name,
      year: new Date().getFullYear(),
      code: "",
      code_description: "",
      total_hours: 0,
      total_days: 0,
      raw_annotation: "",
      extracted_at: null,
    };
    setVacationRights((prev) => [...prev, newRow]);
  }

  // CRUD helpers for absences
  async function saveAbsence(row: AbsenceMonthly) {
    const supabase = createClient();
    const { id, ...data } = row;
    if (id < 0) {
      const { data: inserted } = await supabase.from("staging_absences_monthly").insert({ ...data }).select("*").single();
      if (inserted) setAbsences((prev) => prev.map((r) => (r.id === id ? inserted : r)));
    } else {
      await supabase.from("staging_absences_monthly").update(data).eq("id", id);
    }
  }

  async function deleteAbsence(id: number) {
    if (!confirm("Supprimer cette ligne ?")) return;
    const supabase = createClient();
    if (id > 0) await supabase.from("staging_absences_monthly").delete().eq("id", id);
    setAbsences((prev) => prev.filter((r) => r.id !== id));
  }

  function addAbsence() {
    if (!selectedEmployee) return;
    const newRow: AbsenceMonthly = {
      id: -Date.now(),
      employee_name: selectedEmployee.sheet_name,
      year: new Date().getFullYear(),
      month: 1,
      code: "",
      hours_taken: 0,
      days_taken: 0,
      raw_header: "",
      extracted_at: null,
    };
    setAbsences((prev) => [...prev, newRow]);
  }

  // CRUD helpers for events
  async function saveEvent(row: EmployeeEvent) {
    const supabase = createClient();
    const { id, ...data } = row;
    if (id < 0) {
      const { data: inserted } = await supabase.from("staging_employee_events").insert({ ...data }).select("*").single();
      if (inserted) setEvents((prev) => prev.map((r) => (r.id === id ? inserted : r)));
    } else {
      await supabase.from("staging_employee_events").update(data).eq("id", id);
    }
  }

  async function deleteEvent(id: number) {
    if (!confirm("Supprimer cette ligne ?")) return;
    const supabase = createClient();
    if (id > 0) await supabase.from("staging_employee_events").delete().eq("id", id);
    setEvents((prev) => prev.filter((r) => r.id !== id));
  }

  function addEvent() {
    if (!selectedEmployee) return;
    const newRow: EmployeeEvent = {
      id: -Date.now(),
      employee_name: selectedEmployee.sheet_name,
      event_date: "",
      event_type: "",
      description: "",
      raw_text: "",
      extracted_at: null,
    };
    setEvents((prev) => [...prev, newRow]);
  }

  // CRUD helpers for salary changes
  async function saveSalaryChange(row: SalaryChange) {
    const supabase = createClient();
    const { id, ...data } = row;
    if (id < 0) {
      const { data: inserted } = await supabase.from("staging_salary_changes").insert({ ...data }).select("*").single();
      if (inserted) setSalaryChanges((prev) => prev.map((r) => (r.id === id ? inserted : r)));
    } else {
      await supabase.from("staging_salary_changes").update(data).eq("id", id);
    }
  }

  async function deleteSalaryChange(id: number) {
    if (!confirm("Supprimer cette ligne ?")) return;
    const supabase = createClient();
    if (id > 0) await supabase.from("staging_salary_changes").delete().eq("id", id);
    setSalaryChanges((prev) => prev.filter((r) => r.id !== id));
  }

  function addSalaryChange() {
    if (!selectedEmployee) return;
    const newRow: SalaryChange = {
      id: -Date.now(),
      employee_name: selectedEmployee.sheet_name,
      year: new Date().getFullYear(),
      month: 1,
      change_type: "",
      description: "",
      raw_text: "",
      extracted_at: null,
    };
    setSalaryChanges((prev) => [...prev, newRow]);
  }

  const filtered = employees.filter(
    (e) =>
      e.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.sheet_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Validation donnees staging</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Reviser et valider les donnees extraites ({employees.length} employes)
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* LEFT PANEL: Employee selector */}
        {/* Mobile: dropdown selector */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileSelector(!showMobileSelector)}
            className="w-full px-4 py-3 bg-white border rounded-lg text-left text-sm font-medium text-slate-700 flex items-center justify-between"
          >
            <span>
              {selectedEmployee
                ? `${selectedEmployee.last_name} ${selectedEmployee.first_name}`
                : "Selectionner un employe"}
            </span>
            <Search className="w-4 h-4 text-slate-400" />
          </button>
          {showMobileSelector && (
            <div className="mt-2 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full px-3 py-2 text-sm border rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>
              {filtered.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setShowMobileSelector(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between ${
                    selectedEmployee?.id === emp.id ? "bg-blue-50 text-blue-700" : "text-slate-700"
                  }`}
                >
                  <span>{emp.last_name} {emp.first_name}</span>
                  {validatedIds.has(emp.id) && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: side panel */}
        <div className="hidden lg:block w-[300px] flex-shrink-0">
          <div className="bg-white border rounded-lg overflow-hidden sticky top-4">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un employe..."
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                filtered.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`w-full px-4 py-3 text-left border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
                      selectedEmployee?.id === emp.id
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {emp.last_name} {emp.first_name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {emp.sector_code || "Sans secteur"}
                        </p>
                      </div>
                      {validatedIds.has(emp.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Employee data */}
        <div className="flex-1 min-w-0">
          {!selectedEmployee ? (
            <div className="bg-white border rounded-lg p-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-500 mt-4">
                Selectionnez un employe pour voir ses donnees staging
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Section: Identite & Horaire */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Identite & Horaire
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nom</label>
                    <input
                      type="text"
                      value={editEmployee.last_name || ""}
                      onChange={(e) => setEditEmployee({ ...editEmployee, last_name: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Prenom</label>
                    <input
                      type="text"
                      value={editEmployee.first_name || ""}
                      onChange={(e) => setEditEmployee({ ...editEmployee, first_name: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date embauche</label>
                    <input
                      type="date"
                      value={editEmployee.hire_date || ""}
                      onChange={(e) => setEditEmployee({ ...editEmployee, hire_date: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Secteur</label>
                    <input
                      type="text"
                      value={editEmployee.sector_code || ""}
                      onChange={(e) => setEditEmployee({ ...editEmployee, sector_code: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Type contrat</label>
                    <input
                      type="text"
                      value={editEmployee.contract_type || ""}
                      onChange={(e) => setEditEmployee({ ...editEmployee, contract_type: e.target.value })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      checked={editEmployee.is_inactive || false}
                      onChange={(e) => setEditEmployee({ ...editEmployee, is_inactive: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <label className="text-sm text-slate-700">Inactif</label>
                  </div>
                </div>

                {/* Horaire grid */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Horaire hebdomadaire</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["lu", "ma", "me", "je", "ve"] as const).map((day) => {
                      const key = `weekly_hours_${day}` as keyof StagingEmployee;
                      return (
                        <div key={day}>
                          <label className="block text-xs text-slate-500 text-center mb-1 uppercase">{day}</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editEmployee[key] as number || ""}
                            onChange={(e) => setEditEmployee({ ...editEmployee, [key]: parseFloat(e.target.value) || null })}
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-center focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Heures temps plein</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editEmployee.full_time_hours || ""}
                      onChange={(e) => setEditEmployee({ ...editEmployee, full_time_hours: parseFloat(e.target.value) || null })}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                  <textarea
                    value={editEmployee.notes || ""}
                    onChange={(e) => setEditEmployee({ ...editEmployee, notes: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={saveEmployee}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </div>

              {/* Section: Droits de conges */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Droits de conges</h2>
                  <button
                    onClick={addVacationRight}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                {vacationRights.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Aucun droit de conge enregistre</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Code</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Description</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Heures</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Jours</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Annotation</th>
                          <th className="pb-2 text-xs font-medium text-slate-500 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {vacationRights.map((row) => (
                          <tr key={row.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.code || ""}
                                onChange={(e) => setVacationRights((prev) => prev.map((r) => r.id === row.id ? { ...r, code: e.target.value } : r))}
                                onBlur={() => saveVacationRight(row)}
                                className="w-20 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.code_description || ""}
                                onChange={(e) => setVacationRights((prev) => prev.map((r) => r.id === row.id ? { ...r, code_description: e.target.value } : r))}
                                onBlur={() => saveVacationRight(row)}
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                step="0.01"
                                value={row.total_hours ?? ""}
                                onChange={(e) => setVacationRights((prev) => prev.map((r) => r.id === row.id ? { ...r, total_hours: parseFloat(e.target.value) || 0 } : r))}
                                onBlur={() => saveVacationRight(row)}
                                className="w-16 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                step="0.01"
                                value={row.total_days ?? ""}
                                onChange={(e) => setVacationRights((prev) => prev.map((r) => r.id === row.id ? { ...r, total_days: parseFloat(e.target.value) || 0 } : r))}
                                onBlur={() => saveVacationRight(row)}
                                className="w-16 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.raw_annotation || ""}
                                onChange={(e) => setVacationRights((prev) => prev.map((r) => r.id === row.id ? { ...r, raw_annotation: e.target.value } : r))}
                                onBlur={() => saveVacationRight(row)}
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => deleteVacationRight(row.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section: Absences mensuelles */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Absences mensuelles</h2>
                  <button
                    onClick={addAbsence}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                {absences.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Aucune absence enregistree</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Mois</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Code</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Heures</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Jours</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">En-tete brut</th>
                          <th className="pb-2 text-xs font-medium text-slate-500 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {absences.map((row) => (
                          <tr key={row.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                min="1"
                                max="12"
                                value={row.month ?? ""}
                                onChange={(e) => setAbsences((prev) => prev.map((r) => r.id === row.id ? { ...r, month: parseInt(e.target.value) || null } : r))}
                                onBlur={() => saveAbsence(row)}
                                className="w-14 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.code || ""}
                                onChange={(e) => setAbsences((prev) => prev.map((r) => r.id === row.id ? { ...r, code: e.target.value } : r))}
                                onBlur={() => saveAbsence(row)}
                                className="w-20 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                step="0.01"
                                value={row.hours_taken ?? ""}
                                onChange={(e) => setAbsences((prev) => prev.map((r) => r.id === row.id ? { ...r, hours_taken: parseFloat(e.target.value) || 0 } : r))}
                                onBlur={() => saveAbsence(row)}
                                className="w-16 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                step="0.01"
                                value={row.days_taken ?? ""}
                                onChange={(e) => setAbsences((prev) => prev.map((r) => r.id === row.id ? { ...r, days_taken: parseFloat(e.target.value) || 0 } : r))}
                                onBlur={() => saveAbsence(row)}
                                className="w-16 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.raw_header || ""}
                                onChange={(e) => setAbsences((prev) => prev.map((r) => r.id === row.id ? { ...r, raw_header: e.target.value } : r))}
                                onBlur={() => saveAbsence(row)}
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => deleteAbsence(row.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section: Evenements */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Evenements</h2>
                  <button
                    onClick={addEvent}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                {events.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Aucun evenement enregistre</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Date</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Type</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Description</th>
                          <th className="pb-2 text-xs font-medium text-slate-500 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((row) => (
                          <tr key={row.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">
                              <input
                                type="date"
                                value={row.event_date || ""}
                                onChange={(e) => setEvents((prev) => prev.map((r) => r.id === row.id ? { ...r, event_date: e.target.value } : r))}
                                onBlur={() => saveEvent(row)}
                                className="rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.event_type || ""}
                                onChange={(e) => setEvents((prev) => prev.map((r) => r.id === row.id ? { ...r, event_type: e.target.value } : r))}
                                onBlur={() => saveEvent(row)}
                                className="w-32 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.description || ""}
                                onChange={(e) => setEvents((prev) => prev.map((r) => r.id === row.id ? { ...r, description: e.target.value } : r))}
                                onBlur={() => saveEvent(row)}
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => deleteEvent(row.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Section: Changements bareme */}
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Changements bareme</h2>
                  <button
                    onClick={addSalaryChange}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                </div>
                {salaryChanges.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Aucun changement de bareme enregistre</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Mois</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Type</th>
                          <th className="pb-2 pr-2 text-xs font-medium text-slate-500">Description</th>
                          <th className="pb-2 text-xs font-medium text-slate-500 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryChanges.map((row) => (
                          <tr key={row.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-2">
                              <input
                                type="number"
                                min="1"
                                max="12"
                                value={row.month ?? ""}
                                onChange={(e) => setSalaryChanges((prev) => prev.map((r) => r.id === row.id ? { ...r, month: parseInt(e.target.value) || null } : r))}
                                onBlur={() => saveSalaryChange(row)}
                                className="w-14 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.change_type || ""}
                                onChange={(e) => setSalaryChanges((prev) => prev.map((r) => r.id === row.id ? { ...r, change_type: e.target.value } : r))}
                                onBlur={() => saveSalaryChange(row)}
                                className="w-32 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input
                                type="text"
                                value={row.description || ""}
                                onChange={(e) => setSalaryChanges((prev) => prev.map((r) => r.id === row.id ? { ...r, description: e.target.value } : r))}
                                onBlur={() => saveSalaryChange(row)}
                                className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="py-2">
                              <button
                                onClick={() => deleteSalaryChange(row.id)}
                                className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Validate button */}
              <div className="flex justify-end">
                <button
                  onClick={markValidated}
                  disabled={validatedIds.has(selectedEmployee.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                    validatedIds.has(selectedEmployee.id)
                      ? "bg-emerald-100 text-emerald-700 cursor-default"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {validatedIds.has(selectedEmployee.id)
                    ? "Valide"
                    : "Marquer comme valide"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
