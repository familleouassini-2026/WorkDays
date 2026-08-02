"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, TreePalm, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import Link from "next/link";

interface VacationPolicy {
  id: number;
  min_years: number;
  max_years: number | null;
  weeks_entitled: number;
  description: string | null;
}

export default function VacationPolicyPage() {
  const [policies, setPolicies] = useState<VacationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ min_years: 0, max_years: "" as string, weeks_entitled: 1, description: "" });


  useEffect(() => { fetchPolicies(); }, []);

  async function fetchPolicies() {
    const supabase = createClient();
    const { data } = await supabase.from("vacation_policies").select("*").order("min_years");
    if (data) setPolicies(data);
    setLoading(false);
  }

  function startEdit(p: VacationPolicy) {
    setEditingId(p.id);
    setForm({ min_years: p.min_years, max_years: p.max_years?.toString() || "", weeks_entitled: p.weeks_entitled, description: p.description || "" });
  }

  function startAdd() {
    setAdding(true);
    setForm({ min_years: 0, max_years: "", weeks_entitled: 1, description: "" });
  }

  function cancelEdit() { setEditingId(null); setAdding(false); }

  async function saveEdit() {
    const supabase = createClient();
    const payload = {
      min_years: form.min_years,
      max_years: form.max_years ? parseInt(form.max_years) : null,
      weeks_entitled: form.weeks_entitled,
      description: form.description.trim() || null,
    };
    if (adding) {
      const { error } = await supabase.from("vacation_policies").insert(payload);
      if (error) { alert("Erreur: " + error.message); return; }
    } else if (editingId) {
      const { error } = await supabase.from("vacation_policies").update(payload).eq("id", editingId);
      if (error) { alert("Erreur: " + error.message); return; }
    }
    cancelEdit();
    fetchPolicies();
  }

  async function deletePolicy(id: number) {
    if (!confirm("Supprimer cette tranche ?")) return;
    const supabase = createClient();
    await supabase.from("vacation_policies").delete().eq("id", id);
    fetchPolicies();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Politique de congés</h1>
          <p className="text-slate-500 text-sm mt-0.5">Semaines de congé par ancienneté (droit belge)</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>


      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <TreePalm className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">Politique belge de congés payés</p>
          <p className="text-sm text-blue-700 mt-1">
            Le nombre de semaines de congé augmente avec l&apos;ancienneté dans l&apos;entreprise.
            Ce tableau définit les tranches utilisées pour le calcul automatique des droits.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center"><div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Ancienneté min</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Ancienneté max</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Semaines</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adding && (
                <EditPolicyRow form={form} setForm={setForm} onSave={saveEdit} onCancel={cancelEdit} />
              )}
              {policies.map((p) =>
                editingId === p.id ? (
                  <EditPolicyRow key={p.id} form={form} setForm={setForm} onSave={saveEdit} onCancel={cancelEdit} />
                ) : (
                  <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{p.min_years} an(s)</td>
                    <td className="px-4 py-3 text-slate-600">{p.max_years != null ? `${p.max_years} an(s)` : "∞ (illimité)"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                        {p.weeks_entitled} sem.
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.description || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deletePolicy(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function EditPolicyRow({ form, setForm, onSave, onCancel }: {
  form: { min_years: number; max_years: string; weeks_entitled: number; description: string };
  setForm: (f: typeof form) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="border-b bg-blue-50/50">
      <td className="px-4 py-2">
        <input type="number" min={0} value={form.min_years} onChange={(e) => setForm({ ...form, min_years: parseInt(e.target.value) || 0 })} className="w-20 px-2 py-1 border rounded text-sm" />
      </td>
      <td className="px-4 py-2">
        <input type="number" min={0} value={form.max_years} onChange={(e) => setForm({ ...form, max_years: e.target.value })} placeholder="vide = illimité" className="w-28 px-2 py-1 border rounded text-sm" />
      </td>
      <td className="px-4 py-2">
        <input type="number" min={1} value={form.weeks_entitled} onChange={(e) => setForm({ ...form, weeks_entitled: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1 border rounded text-sm" />
      </td>
      <td className="px-4 py-2">
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Ex: Congé standard" />
      </td>
      <td className="px-4 py-2 text-right">
        <button onClick={onSave} className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><Check className="w-3.5 h-3.5" /></button>
        <button onClick={onCancel} className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 ml-1"><X className="w-3.5 h-3.5" /></button>
      </td>
    </tr>
  );
}
