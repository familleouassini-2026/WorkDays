"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarHeart, Plus, Pencil, Trash2, X, Save } from "lucide-react";

interface Holiday {
  id: number;
  holiday_date: string;
  name: string;
  year: number;
}

interface FormData {
  id: number | null;
  holiday_date: string;
  name: string;
}

export default function HolidaysPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + 2 - i);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({ id: null, holiday_date: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);


  // Load holidays for selected year
  useEffect(() => {
    async function loadHolidays() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("holidays")
        .select("*")
        .eq("year", selectedYear)
        .order("holiday_date");
      if (data) setHolidays(data);
      setLoading(false);
    }
    loadHolidays();
  }, [selectedYear]);

  function openAdd() {
    setFormData({ id: null, holiday_date: "", name: "" });
    setShowForm(true);
  }

  function openEdit(holiday: Holiday) {
    setFormData({ id: holiday.id, holiday_date: holiday.holiday_date, name: holiday.name });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormData({ id: null, holiday_date: "", name: "" });
  }

  async function handleSave() {
    if (!formData.holiday_date || !formData.name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const year = new Date(formData.holiday_date + "T00:00:00").getFullYear();

    if (formData.id) {
      // Update
      await supabase
        .from("holidays")
        .update({ holiday_date: formData.holiday_date, name: formData.name.trim(), year })
        .eq("id", formData.id);
    } else {
      // Insert
      await supabase
        .from("holidays")
        .insert({ holiday_date: formData.holiday_date, name: formData.name.trim(), year });
    }

    setSaving(false);
    closeForm();
    // Reload
    const { data } = await supabase
      .from("holidays")
      .select("*")
      .eq("year", selectedYear)
      .order("holiday_date");
    if (data) setHolidays(data);
  }

  async function handleDelete(id: number) {
    const supabase = createClient();
    await supabase.from("holidays").delete().eq("id", id);
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    setDeleteConfirm(null);
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jours feries</h1>
          <p className="text-slate-500 mt-1">Configurer les jours feries par annee</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Year filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Annee :</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {holidays.length} jour{holidays.length !== 1 ? "s" : ""} ferie{holidays.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : holidays.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Jour</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nom</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.map((h) => {
                const date = new Date(h.holiday_date + "T00:00:00");
                const dayName = date.toLocaleDateString("fr-BE", { weekday: "long" });
                const dateStr = date.toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" });
                return (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{dateStr}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 capitalize">{dayName}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-medium">{h.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(h)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Modifier">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === h.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(h.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Oui</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Non</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(h.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <CalendarHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun jour ferie configure pour {selectedYear}</p>
          <button onClick={openAdd} className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            + Ajouter un jour ferie
          </button>
        </div>
      )}


      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {formData.id ? "Modifier le jour ferie" : "Ajouter un jour ferie"}
              </h3>
              <button onClick={closeForm} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.holiday_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, holiday_date: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Noel, Fete nationale..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.holiday_date || !formData.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {formData.id ? "Mettre a jour" : "Enregistrer"}
                </button>
                <button
                  onClick={closeForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
