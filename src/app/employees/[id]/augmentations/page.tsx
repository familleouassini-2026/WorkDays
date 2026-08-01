"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TrendingUp, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";

// ---------- TYPES ----------

interface Indexation {
  id: number;
  employee_id: number;
  indexation_value: number;
  indexation_date: string;
  description?: string | null;
  created_at?: string;
}

interface IndexationForm {
  indexation_value: string;
  indexation_date: string;
  description: string;
}

// ---------- HELPERS ----------

function emptyForm(): IndexationForm {
  return {
    indexation_value: "",
    indexation_date: "",
    description: "",
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ---------- PAGE ----------

export default function AugmentationsPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [employeeName, setEmployeeName] = useState("");
  const [indexations, setIndexations] = useState<Indexation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<IndexationForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployee();
    fetchIndexations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  async function fetchIndexations() {
    setLoading(true);
    const { data } = await supabase
      .from("employee_indexations")
      .select("*")
      .eq("employee_id", id)
      .order("indexation_date", { ascending: false });
    if (data) {
      setIndexations(data as Indexation[]);
    }
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(false);
  }

  function startEdit(item: Indexation) {
    setEditingId(item.id);
    setForm({
      indexation_value: String(item.indexation_value),
      indexation_date: item.indexation_date,
      description: item.description || "",
    });
    setShowForm(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {
      employee_id: Number(id),
      indexation_value: parseFloat(form.indexation_value),
      indexation_date: form.indexation_date,
    };

    if (form.description.trim()) {
      payload.description = form.description.trim();
    } else {
      payload.description = null;
    }

    if (editingId) {
      await supabase
        .from("employee_indexations")
        .update(payload)
        .eq("id", editingId);
    } else {
      await supabase.from("employee_indexations").insert(payload);
    }

    resetForm();
    setSaving(false);
    fetchIndexations();
  }

  async function handleDelete(itemId: number) {
    if (!window.confirm("Supprimer cette augmentation ?")) return;
    await supabase.from("employee_indexations").delete().eq("id", itemId);
    fetchIndexations();
  }

  // ---------- TOTALS ----------

  const cumulativeTotal = indexations.reduce(
    (sum, item) => sum + Number(item.indexation_value),
    0
  );

  // ---------- STYLES ----------

  const inputClass =
    "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (loading && indexations.length === 0) {
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
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              Augmentations personnelles
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

      {/* Cumulative Total */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <div>
          <p className="text-sm text-emerald-700 font-medium">Total cumulatif</p>
          <p className="text-xl font-bold text-emerald-900">
            +{formatCurrency(cumulativeTotal)}
          </p>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Modifier l'augmentation" : "Nouvelle augmentation"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="indexation_value" className={labelClass}>
                Montant (EUR)
              </label>
              <input
                id="indexation_value"
                name="indexation_value"
                type="number"
                step="0.01"
                min="0"
                value={form.indexation_value}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="indexation_date" className={labelClass}>
                Date effective
              </label>
              <input
                id="indexation_date"
                name="indexation_date"
                type="date"
                value={form.indexation_date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="description" className={labelClass}>
                Description
              </label>
              <input
                id="description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                className={inputClass}
                placeholder="Optionnel"
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

      {/* Indexations List */}
      {indexations.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">
            Aucune augmentation enregistree.
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
                    Date effective
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    Montant
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    Description
                  </th>
                  <th className="px-4 py-2 text-right font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {indexations.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-2 text-slate-700">
                      {formatDate(item.indexation_date)}
                    </td>
                    <td className="px-4 py-2">
                      <span className="font-medium text-emerald-700">
                        +{formatCurrency(Number(item.indexation_value))}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          title="Modifier"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
            {indexations.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-4"
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-emerald-700 text-lg">
                    +{formatCurrency(Number(item.indexation_value))}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(item)}
                      title="Modifier"
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Supprimer"
                      className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Values */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Date :</span>
                    <span className="text-slate-700">
                      {formatDate(item.indexation_date)}
                    </span>
                  </div>
                  {item.description && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Description :</span>
                      <span className="text-slate-700">{item.description}</span>
                    </div>
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
