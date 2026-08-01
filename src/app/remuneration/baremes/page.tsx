"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, Plus, Pencil, Trash2, Check, X } from "lucide-react";

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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredScales = selectedSector
    ? scales.filter((s) => s.sectors?.name === selectedSector)
    : scales;

  const groupedBySector: Record<string, { sectorId: number; scales: SeniorityScale[] }> = {};
  filteredScales.forEach((scale) => {
    const sectorName = scale.sectors?.name || "Sans secteur";
    if (!groupedBySector[sectorName]) {
      groupedBySector[sectorName] = { sectorId: scale.sector_id, scales: [] };
    }
    groupedBySector[sectorName].scales.push(scale);
  });

  async function handleAdd(sectorId: number) {
    if (newYears < 0 || newSalary <= 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("seniority_scales")
      .insert({ sector_id: sectorId, years: newYears, base_salary: newSalary });
    if (!error) {
      setAddingSectorId(null);
      setNewYears(0);
      setNewSalary(0);
      await fetchData();
    }
  }

  async function handleEdit(id: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("seniority_scales")
      .update({ years: editYears, base_salary: editSalary })
      .eq("id", id);
    if (!error) {
      setEditingId(null);
      await fetchData();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer ce palier ? Cette action est irreversible.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("seniority_scales").delete().eq("id", id);
    if (!error) {
      await fetchData();
    }
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
          <h1 className="text-2xl font-bold text-slate-900">
            Baremes salariaux
          </h1>
          <p className="text-slate-500 mt-1">
            Grilles de remuneration par secteur et anciennete
          </p>
        </div>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tous les secteurs</option>
          {sectors.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredScales.length === 0 && (
            <div className="bg-white rounded-lg border p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 mt-3">Aucun bareme existant pour ce filtre.</p>
              <p className="text-xs text-slate-400 mt-1">Utilisez les boutons ci-dessous pour creer des paliers.</p>
            </div>
          )}
          {Object.entries(groupedBySector).map(([sectorName, { sectorId, scales: sectorScales }]) => (
            <div key={sectorName} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">{sectorName}</h3>
                  <p className="text-xs text-slate-500">{sectorScales.length} palier{sectorScales.length > 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => {
                    setAddingSectorId(addingSectorId === sectorId ? null : sectorId);
                    setNewYears(0);
                    setNewSalary(0);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter un palier
                </button>
              </div>

              {/* Add row form */}
              {addingSectorId === sectorId && (
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
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
                    onClick={() => handleAdd(sectorId)}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAddingSectorId(null)}
                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Anciennete (ans)
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Salaire de base
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectorScales.map((scale) => (
                      <tr key={scale.id} className="hover:bg-slate-50">
                        {editingId === scale.id ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min={0}
                                value={editYears}
                                onChange={(e) => setEditYears(Number(e.target.value))}
                                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={editSalary}
                                onChange={(e) => setEditSalary(Number(e.target.value))}
                                className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEdit(scale.id)}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-sm text-slate-700">
                              {scale.years} an{scale.years > 1 ? "s" : ""}
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                              {scale.base_salary.toLocaleString("fr-BE", {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => startEdit(scale)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Modifier"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(scale.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Sectors without any bareme */}
          {(() => {
            const sectorsWithBareme = new Set(Object.values(groupedBySector).map(g => g.sectorId));
            const sectorsWithout = sectors.filter(s => !sectorsWithBareme.has(s.id) && (!selectedSector || s.name === selectedSector));
            if (sectorsWithout.length === 0) return null;
            return (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Secteurs sans bareme</h3>
                <div className="space-y-2">
                  {sectorsWithout.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-600">{s.name}</span>
                      {addingSectorId === s.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={newYears}
                            onChange={(e) => setNewYears(Number(e.target.value))}
                            placeholder="Annees"
                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={newSalary || ""}
                            onChange={(e) => setNewSalary(Number(e.target.value))}
                            placeholder="Salaire"
                            className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <button onClick={() => handleAdd(s.id)} className="p-1 text-emerald-600 hover:bg-emerald-100 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setAddingSectorId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingSectorId(s.id); setNewYears(0); setNewSalary(0); }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Creer le bareme
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
