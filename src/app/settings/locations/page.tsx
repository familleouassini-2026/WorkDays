"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Location {
  id: number;
  name: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("locations").select("id, name").order("name");
    if (data) setLocations(data);
    setLoading(false);
  }

  function startEdit(location: Location) {
    setEditingId(location.id);
    setFormName(location.name);
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setFormName("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName) return;
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      await supabase.from("locations").update({ name: formName }).eq("id", editingId);
    } else {
      await supabase.from("locations").insert({ name: formName });
    }

    resetForm();
    setSaving(false);
    fetchData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce site ?\n\nCette action est irreversible.")) return;
    const supabase = createClient();
    await supabase.from("locations").delete().eq("id", id);
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
            <p className="text-slate-500 mt-0.5 text-sm">{locations.length} site{locations.length > 1 ? "s" : ""} configure{locations.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" />Nouveau site</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">{editingId ? "Modifier le site" : "Creer un site"}</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Ex: Batiment A" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Creer"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /><p className="text-slate-500 mt-4">Chargement...</p></div>
      ) : locations.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center"><MapPin className="w-12 h-12 text-slate-300 mx-auto" /><p className="text-slate-500 mt-4">Aucun site configure.</p></div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Nom</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{loc.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(loc)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(loc.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
