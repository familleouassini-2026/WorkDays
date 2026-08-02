"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Layers, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RttGroup { id: number; name: string; }
interface Sector { id: number; name: string; code_bareme: string | null; mission: string | null; rtt_group_id: number | null; has_rtt: boolean; is_ific: boolean; ific_category: number | null; rtt_group_name: string | null; }

export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [rttGroups, setRttGroups] = useState<RttGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formMission, setFormMission] = useState("");
  const [formRttGroup, setFormRttGroup] = useState<string>("");
  const [formHasRtt, setFormHasRtt] = useState(true);
  const [formIsIfic, setFormIsIfic] = useState(false);
  const [formIficCat, setFormIficCat] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();
    const [secRes, rttRes] = await Promise.all([
      supabase.from("sectors").select("id, name, code_bareme, mission, rtt_group_id, has_rtt, is_ific, ific_category, rtt_groups(name)").order("name"),
      supabase.from("rtt_groups").select("id, name").order("name"),
    ]);
    if (rttRes.data) setRttGroups(rttRes.data);
    if (secRes.data) {
      setSectors(secRes.data.map((s: any) => ({ ...s, rtt_group_name: s.rtt_groups?.name || null })));
    }
    setLoading(false);
  }

  function startEdit(sector: Sector) {
    setEditingId(sector.id);
    setFormName(sector.name);
    setFormCode(sector.code_bareme || "");
    setFormMission(sector.mission || "");
    setFormRttGroup(sector.rtt_group_id?.toString() || "");
    setFormHasRtt(sector.has_rtt);
    setFormIsIfic(sector.is_ific);
    setFormIficCat(sector.ific_category?.toString() || "");
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setFormName(""); setFormCode(""); setFormMission(""); setFormRttGroup(""); setFormHasRtt(true); setFormIsIfic(false); setFormIficCat("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName) return;
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: formName,
      code_bareme: formCode || null,
      mission: formMission || null,
      rtt_group_id: formRttGroup ? Number(formRttGroup) : null,
      has_rtt: formHasRtt,
      is_ific: formIsIfic,
      ific_category: formIficCat ? Number(formIficCat) : null,
    };

    if (editingId) {
      await supabase.from("sectors").update(payload).eq("id", editingId);
    } else {
      await supabase.from("sectors").insert(payload);
    }

    resetForm();
    setSaving(false);
    fetchData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce secteur ?\n\n• Les barèmes liés seront supprimés\n• Les employés seront désassignés (sector_id = null)\n\nCette action est irréversible.")) return;
    const supabase = createClient();
    // Cascade: remove baremes + unassign employees
    await supabase.from("seniority_scales").delete().eq("sector_id", id);
    await supabase.from("employees").update({ sector_id: null }).eq("sector_id", id);
    await supabase.from("sectors").delete().eq("id", id);
    fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><ArrowLeft className="w-5 h-5 text-slate-500" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Secteurs</h1>
            <p className="text-slate-500 mt-0.5 text-sm">{sectors.length} secteur{sectors.length > 1 ? "s" : ""} configures</p>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"><Plus className="w-4 h-4" />Nouveau secteur</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">{editingId ? "Modifier le secteur" : "Creer un secteur"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="Ex: KINE BAR 1/80" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Code bareme</label><input type="text" value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="Ex: 1/80" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Groupe RTT</label><select value={formRttGroup} onChange={(e) => setFormRttGroup(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"><option value="">Aucun</option>{rttGroups.map((g) => (<option key={g.id} value={g.id}>{g.name}</option>))}</select></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Mission / description</label><input type="text" value={formMission} onChange={(e) => setFormMission(e.target.value)} placeholder="Optionnel" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={formHasRtt} onChange={(e) => setFormHasRtt(e.target.checked)} className="rounded border-slate-300" />RTT actif</label>
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={formIsIfic} onChange={(e) => setFormIsIfic(e.target.checked)} className="rounded border-slate-300" />IFIC</label>
            </div>
            {formIsIfic && <div><label className="block text-xs font-medium text-slate-600 mb-1">Categorie IFIC</label><input type="number" value={formIficCat} onChange={(e) => setFormIficCat(e.target.value)} placeholder="Ex: 14" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Creer"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /><p className="text-slate-500 mt-4">Chargement...</p></div>
      ) : sectors.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center"><Layers className="w-12 h-12 text-slate-300 mx-auto" /><p className="text-slate-500 mt-4">Aucun secteur configure.</p></div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Secteur</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Bareme</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Groupe RTT</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">IFIC</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectors.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{sec.name}</p>
                    {sec.mission && <p className="text-xs text-slate-500">{sec.mission}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 text-center">{sec.code_bareme || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {sec.rtt_group_name ? <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{sec.rtt_group_name}</span> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {sec.is_ific ? <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">Cat {sec.ific_category}</span> : <span className="text-xs text-slate-400">{sec.has_rtt ? "RTT" : "—"}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(sec)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(sec.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
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
