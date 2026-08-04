"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Pencil, Trash2, Briefcase, Filter } from "lucide-react";

interface Sector {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface JobOpening {
  id: number;
  title: string;
  sector_id: number | null;
  location_id: number | null;
  contract_type: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "open", label: "Ouvert" },
  { value: "filled", label: "Pourvu" },
  { value: "cancelled", label: "Annule" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  filled: "bg-blue-100 text-blue-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const CONTRACT_TYPES = ["CDI", "CDD", "INTERIM", "STAGE", "BENEVOLE"];

export default function OpeningsPage() {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSectorId, setFormSectorId] = useState("");
  const [formLocationId, setFormLocationId] = useState("");
  const [formContractType, setFormContractType] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState("open");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    const [openingsRes, sectorsRes, locationsRes] = await Promise.all([
      supabase.from("job_openings").select("*").order("created_at", { ascending: false }),
      supabase.from("sectors").select("id, name").order("name"),
      supabase.from("locations").select("id, name").order("name"),
    ]);
    if (openingsRes.data) setOpenings(openingsRes.data);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    if (locationsRes.data) setLocations(locationsRes.data);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setFormTitle("");
    setFormSectorId("");
    setFormLocationId("");
    setFormContractType("");
    setFormDescription("");
    setFormStatus("open");
    setShowForm(false);
  }

  function startEdit(opening: JobOpening) {
    setEditingId(opening.id);
    setFormTitle(opening.title);
    setFormSectorId(opening.sector_id?.toString() || "");
    setFormLocationId(opening.location_id?.toString() || "");
    setFormContractType(opening.contract_type || "");
    setFormDescription(opening.description || "");
    setFormStatus(opening.status);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload = {
      title: formTitle.trim(),
      sector_id: formSectorId ? Number(formSectorId) : null,
      location_id: formLocationId ? Number(formLocationId) : null,
      contract_type: formContractType || null,
      description: formDescription.trim() || null,
      status: formStatus,
    };

    if (editingId) {
      const { error } = await supabase.from("job_openings").update(payload).eq("id", editingId);
      if (error) alert("Erreur: " + error.message);
    } else {
      const { error } = await supabase.from("job_openings").insert(payload);
      if (error) alert("Erreur: " + error.message);
    }

    resetForm();
    setSaving(false);
    loadData();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce poste ?\n\nLes candidats associes ne seront pas supprimes.")) return;
    const supabase = createClient();
    await supabase.from("job_openings").delete().eq("id", id);
    loadData();
  }

  const filteredOpenings =
    filterStatus === "all" ? openings : openings.filter((o) => o.status === filterStatus);

  const sectorMap = new Map(sectors.map((s) => [s.id, s.name]));
  const locationMap = new Map(locations.map((l) => [l.id, l.name]));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/recruitment" className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Postes</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              {openings.length} poste{openings.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau poste
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Modifier le poste" : "Creer un poste"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Titre *</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                placeholder="Ex: Kinesitherapeute"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Secteur</label>
              <select
                value={formSectorId}
                onChange={(e) => setFormSectorId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Aucun --</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Site</label>
              <select
                value={formLocationId}
                onChange={(e) => setFormLocationId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Aucun --</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type de contrat</label>
              <select
                value={formContractType}
                onChange={(e) => setFormContractType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Aucun --</option>
                {CONTRACT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Description du poste..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Creer le poste"}
            </button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filteredOpenings.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun poste.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOpenings.map((opening) => (
            <div
              key={opening.id}
              className="bg-white rounded-lg border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{opening.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[opening.status]}`}>
                    {STATUS_OPTIONS.find((s) => s.value === opening.status)?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {opening.sector_id && <span>{sectorMap.get(opening.sector_id)}</span>}
                  {opening.location_id && <span>{locationMap.get(opening.location_id)}</span>}
                  {opening.contract_type && <span>{opening.contract_type}</span>}
                  <span>{new Date(opening.created_at).toLocaleDateString("fr-BE")}</span>
                </div>
                {opening.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{opening.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/recruitment/candidates?opening=${opening.id}`}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Candidats
                </Link>
                <button
                  onClick={() => startEdit(opening)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                  title="Modifier"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(opening.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-red-500"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
