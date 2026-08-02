"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface SeniorityScale {
  id: number;
  sector_id: number;
  years: number;
  base_salary: number;
  sectors: { name: string } | null;
}

interface Sector {
  id: number;
  name: string;
}

export default function BaremesPage() {
  const [scales, setScales] = useState<SeniorityScale[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editYears, setEditYears] = useState<number>(0);
  const [editSalary, setEditSalary] = useState<number>(0);
  const [addingSectorId, setAddingSectorId] = useState<number | null>(null);
  const [newYears, setNewYears] = useState<number>(0);
  const [newSalary, setNewSalary] = useState<number>(0);
  const [expandedSectors, setExpandedSectors] = useState<Set<number>>(new Set());

  async function fetchData() {
    const supabase = createClient();
    const [scalesRes, sectorsRes] = await Promise.all([
      supabase
        .from("seniority_scales")
        .select("id, sector_id, years, base_salary, sectors(name)")
        .order("sector_id")
        .order("years"),
      supabase.from("sectors").select("id, name").order("name"),
    ]);
    if (scalesRes.data) setScales(scalesRes.data as unknown as SeniorityScale[]);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  // Build map: sectorId -> scales[]
  const scalesBySectorId: Record<number, SeniorityScale[]> = {};
  scales.forEach((s) => {
    if (!scalesBySectorId[s.sector_id]) scalesBySectorId[s.sector_id] = [];
    scalesBySectorId[s.sector_id].push(s);
  });

  // Filter sectors if selector active
  const visibleSectors = selectedSector
    ? sectors.filter((s) => s.name === selectedSector)
    : sectors;

  // Sort alphabetically
  const sortedSectors = [...visibleSectors].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  async function handleAdd(sectorId: number) {
    if (newYears < 0 || newSalary <= 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("seniority_scales")
      .insert({ sector_id: sectorId, years: newYears, base_salary: newSalary });
    if (!error) {
      setNewYears(0);
      setNewSalary(0);
      await fetchData();
      // Keep addingSectorId set so user can continue adding
    }
  }

  async function handleEdit(id: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("seniority_scales")
      .update({ years: editYears, base_salary: editSalary })
      .eq("id", id);
    if (!error) { setEditingId(null); await fetchData(); }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer ce palier ? Cette action est irreversible.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("seniority_scales").delete().eq("id", id);
    if (!error) { await fetchData(); }
  }

  async function handleDeleteAll(sectorId: number) {
    const supabase = createClient();
    const { error } = await supabase.from("seniority_scales").delete().eq("sector_id", sectorId);
    if (!error) { await fetchData(); }
  }

  function startEdit(scale: SeniorityScale) {
    setEditingId(scale.id);
    setEditYears(scale.years);
    setEditSalary(scale.base_salary);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Baremes salariaux</h1>
          <p className="text-slate-500 mt-1">Grilles de remuneration par secteur et anciennete</p>
        </div>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tous les secteurs</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSectors.map((sector) => {
            const sectorScales = scalesBySectorId[sector.id] || [];
            const isAdding = addingSectorId === sector.id;
            const isExpanded = expandedSectors.has(sector.id);

            const minYears = sectorScales.length > 0 ? Math.min(...sectorScales.map((s) => s.years)) : 0;
            const maxYears = sectorScales.length > 0 ? Math.max(...sectorScales.map((s) => s.years)) : 0;
            const minSalary = sectorScales.length > 0 ? Math.min(...sectorScales.map((s) => s.base_salary)) : 0;
            const maxSalary = sectorScales.length > 0 ? Math.max(...sectorScales.map((s) => s.base_salary)) : 0;

            const formatSalary = (value: number) =>
              value.toLocaleString("fr-BE", { style: "currency", currency: "EUR" });

            return (
              <div key={sector.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                {/* Sector header */}
                <div
                  className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => {
                    setExpandedSectors((prev) => {
                      const next = new Set(prev);
                      if (next.has(sector.id)) {
                        next.delete(sector.id);
                      } else {
                        next.add(sector.id);
                      }
                      return next;
                    });
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">{sector.name}</h3>
                      <p className="text-xs text-slate-500">
                        {sectorScales.length > 0
                          ? `${sectorScales.length} palier${sectorScales.length > 1 ? "s" : ""} | Ancienneté: ${minYears}–${maxYears} ans | Salaire: ${formatSalary(minSalary)} – ${formatSalary(maxSalary)}`
                          : "Aucun palier"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddingSectorId(isAdding ? null : sector.id);
                      setNewYears(0);
                      setNewSalary(0);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      isAdding
                        ? "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isAdding ? (
                      <><X className="w-3.5 h-3.5" /> Fermer</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> Ajouter un palier</>
                    )}
                  </button>
                  {sectorScales.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Supprimer TOUS les ${sectorScales.length} paliers de "${sector.name}" ?`)) {
                          handleDeleteAll(sector.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Tout supprimer
                    </button>
                  )}
                </div>
                </div>

                {/* Add form */}
                {isExpanded && isAdding && (
                  <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      value={newYears}
                      onChange={(e) => setNewYears(Number(e.target.value))}
                      placeholder="Annees"
                      className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={newSalary || ""}
                      onChange={(e) => setNewSalary(Number(e.target.value))}
                      placeholder="Salaire de base"
                      className="w-36 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleAdd(sector.id)}
                      disabled={newSalary <= 0}
                      className="px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}

                {/* Table */}
                {isExpanded && sectorScales.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Anciennete (ans)</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Salaire de base</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sectorScales.map((scale) => (
                          <tr key={scale.id} className="hover:bg-slate-50">
                            {editingId === scale.id ? (
                              <>
                                <td className="px-4 py-2">
                                  <input type="number" min={0} value={editYears} onChange={(e) => setEditYears(Number(e.target.value))}
                                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <input type="number" min={0} step={0.01} value={editSalary} onChange={(e) => setEditSalary(Number(e.target.value))}
                                    className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:outline-none" />
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => handleEdit(scale.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-2 text-sm text-slate-700">{scale.years} an{scale.years > 1 ? "s" : ""}</td>
                                <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                                  {scale.base_salary.toLocaleString("fr-BE", { style: "currency", currency: "EUR" })}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => startEdit(scale)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Modifier"><Pencil className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDelete(scale.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty state for sector with no scales */}
                {isExpanded && sectorScales.length === 0 && !isAdding && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-400">Aucun palier configure pour ce secteur</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
