"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import Link from "next/link";

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  text_color_hex: string | null;
  time_unit: string;
  sort_order: number;
}

export default function AbsenceCodesPage() {
  const [codes, setCodes] = useState<AbsenceCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", color_hex: "#3b82f6", text_color_hex: "#ffffff", time_unit: "HOURS_MINUTES", sort_order: 0 });


  useEffect(() => { fetchCodes(); }, []);

  async function fetchCodes() {
    const supabase = createClient();
    const { data } = await supabase.from("absence_codes").select("*").order("sort_order").order("code");
    if (data) setCodes(data);
    setLoading(false);
  }

  function startEdit(c: AbsenceCode) {
    setEditingId(c.id);
    setForm({ code: c.code, description: c.description, color_hex: c.color_hex || "#3b82f6", text_color_hex: c.text_color_hex || "#ffffff", time_unit: c.time_unit, sort_order: c.sort_order });
  }

  function startAdd() {
    setAdding(true);
    setForm({ code: "", description: "", color_hex: "#3b82f6", text_color_hex: "#ffffff", time_unit: "HOURS_MINUTES", sort_order: codes.length });
  }

  function cancelEdit() {
    setEditingId(null);
    setAdding(false);
  }

  async function saveEdit() {
    const supabase = createClient();
    if (adding) {
      const { error } = await supabase.from("absence_codes").insert({
        code: form.code.toUpperCase().trim(),
        description: form.description.trim(),
        color_hex: form.color_hex,
        text_color_hex: form.text_color_hex,
        time_unit: form.time_unit,
        sort_order: form.sort_order,
      });
      if (error) { alert("Erreur: " + error.message); return; }
    } else if (editingId) {
      const { error } = await supabase.from("absence_codes").update({
        code: form.code.toUpperCase().trim(),
        description: form.description.trim(),
        color_hex: form.color_hex,
        text_color_hex: form.text_color_hex,
        time_unit: form.time_unit,
        sort_order: form.sort_order,
      }).eq("id", editingId);
      if (error) { alert("Erreur: " + error.message); return; }
    }
    cancelEdit();
    fetchCodes();
  }

  async function deleteCode(id: number) {
    if (!confirm("Supprimer ce code d'absence ? Cette action est irréversible.")) return;
    const supabase = createClient();
    await supabase.from("absence_codes").delete().eq("id", id);
    fetchCodes();
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Codes d&apos;absence</h1>
          <p className="text-slate-500 text-sm mt-0.5">Types d&apos;absence, couleurs, unités de temps</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center"><div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Couleur</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Unité</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Ordre</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adding && <EditRow form={form} setForm={setForm} onSave={saveEdit} onCancel={cancelEdit} />}
              {codes.map((c) => (
                editingId === c.id ? (
                  <EditRow key={c.id} form={form} setForm={setForm} onSave={saveEdit} onCancel={cancelEdit} />
                ) : (
                  <tr key={c.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span
                        className="inline-block w-8 h-6 rounded text-center text-xs font-bold leading-6"
                        style={{ backgroundColor: c.color_hex || "#e2e8f0", color: c.text_color_hex || "#000" }}
                      >
                        {c.code.slice(0, 3)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.code}</td>
                    <td className="px-4 py-3 text-slate-600">{c.description}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.time_unit === "DAYS" ? "Jours" : "Heures/Min"}</td>
                    <td className="px-4 py-3 text-slate-500">{c.sort_order}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteCode(c.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500 ml-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// Inline edit row component
function EditRow({ form, setForm, onSave, onCancel }: {
  form: { code: string; description: string; color_hex: string; text_color_hex: string; time_unit: string; sort_order: number };
  setForm: (f: typeof form) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <tr className="border-b bg-blue-50/50">
      <td className="px-4 py-2">
        <div className="flex gap-1">
          <input type="color" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="w-8 h-8 rounded cursor-pointer" title="Fond" />
          <input type="color" value={form.text_color_hex} onChange={(e) => setForm({ ...form, text_color_hex: e.target.value })} className="w-8 h-8 rounded cursor-pointer" title="Texte" />
        </div>
      </td>
      <td className="px-4 py-2">
        <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-20 px-2 py-1 border rounded text-sm font-mono" placeholder="V" />
      </td>
      <td className="px-4 py-2">
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Vacances annuelles" />
      </td>
      <td className="px-4 py-2">
        <select value={form.time_unit} onChange={(e) => setForm({ ...form, time_unit: e.target.value })} className="px-2 py-1 border rounded text-sm">
          <option value="HOURS_MINUTES">Heures/Min</option>
          <option value="DAYS">Jours</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-16 px-2 py-1 border rounded text-sm" />
      </td>
      <td className="px-4 py-2 text-right">
        <button onClick={onSave} className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={onCancel} className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 ml-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
