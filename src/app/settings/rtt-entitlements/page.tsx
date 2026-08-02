"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface RTTEntitlement {
  id: number;
  sector_id: number;
  seniority_start: number;
  hours_per_year: number;
  sectors: { name: string } | null;
}

interface Sector {
  id: number;
  name: string;
  has_rtt: boolean;
}

export default function RTTEntitlementsPage() {
  const [entitlements, setEntitlements] = useState<RTTEntitlement[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSeniorityStart, setEditSeniorityStart] = useState<number>(0);
  const [editHoursPerYear, setEditHoursPerYear] = useState<number>(0);
  const [addingSectorId, setAddingSectorId] = useState<number | null>(null);
  const [newSeniorityStart, setNewSeniorityStart] = useState<number>(0);
  const [newHoursPerYear, setNewHoursPerYear] = useState<number>(0);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  async function fetchData() {
    const supabase = createClient();
    const [entRes, sectorsRes] = await Promise.all([
      supabase
        .from("rtt_entitlements")
        .select("id, sector_id, seniority_start, hours_per_year, sectors(name)")
        .order("sector_id")
        .order("seniority_start"),
      supabase.from("sectors").select("id, name, has_rtt").order("name"),
    ]);
    if (entRes.data) setEntitlements(entRes.data as unknown as RTTEntitlement[]);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const rttSectors = sectors.filter((s) => s.has_rtt);

  const filteredEntitlements = selectedSector
    ? entitlements.filter((e) => e.sectors?.name === selectedSector)
    : entitlements;

  const groupedBySector: Record<string, { sectorId: number; entitlements: RTTEntitlement[] }> = {};
  filteredEntitlements.forEach((ent) => {
    const sectorName = ent.sectors?.name || "Sans secteur";
    if (!groupedBySector[sectorName]) {
      groupedBySector[sectorName] = { sectorId: ent.sector_id, entitlements: [] };
    }
    groupedBySector[sectorName].entitlements.push(ent);
  });

  function toggleSector(sectorName: string) {
    setExpandedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(sectorName)) {
        next.delete(sectorName);
      } else {
        next.add(sectorName);
      }
      return next;
    });
  }

  async function handleAdd(sectorId: number) {
    if (newSeniorityStart < 0 || newHoursPerYear <= 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("rtt_entitlements")
      .insert({ sector_id: sectorId, seniority_start: newSeniorityStart, hours_per_year: newHoursPerYear });
    if (!error) {
      setNewSeniorityStart(0);
      setNewHoursPerYear(0);
      await fetchData();
    }
  }

  async function handleEdit(id: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("rtt_entitlements")
      .update({ seniority_start: editSeniorityStart, hours_per_year: editHoursPerYear })
      .eq("id", id);
    if (!error) {
      setEditingId(null);
      await fetchData();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer cette tranche ? Cette action est irreversible.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("rtt_entitlements").delete().eq("id", id);
    if (!error) {
      await fetchData();
    }
  }

  function startEdit(ent: RTTEntitlement) {
    setEditingId(ent.id);
    setEditSeniorityStart(ent.seniority_start);
    setEditHoursPerYear(ent.hours_per_year);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bareme RTT</h1>
          <p className="text-slate-500 mt-1">
            Heures RTT par tranche d&apos;age et par secteur
          </p>
        </div>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Tous</option>
          {rttSectors.map((s) => (
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
          {filteredEntitlements.length === 0 && Object.keys(groupedBySector).length === 0 && (
            <div className="bg-white rounded-lg border p-8 text-center">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 mt-3">Aucune tranche RTT existante pour ce filtre.</p>
              <p className="text-xs text-slate-400 mt-1">Utilisez les boutons ci-dessous pour creer des tranches.</p>
            </div>
          )}

          {Object.entries(groupedBySector).sort(([a], [b]) => a.localeCompare(b, "fr")).map(([sectorName, { sectorId, entitlements: sectorEntitlements }]) => (
            <div key={sectorName} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div
                className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSector(sectorName)}
              >
                <div className="flex items-center gap-2">
                  {expandedSectors.has(sectorName) ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{sectorName} ({sectorEntitlements.length} tranche{sectorEntitlements.length > 1 ? "s" : ""})</h3>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingSectorId(addingSectorId === sectorId ? null : sectorId);
                    setNewSeniorityStart(0);
                    setNewHoursPerYear(0);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une tranche
                </button>
              </div>

              {/* Add row form */}
              {expandedSectors.has(sectorName) && addingSectorId === sectorId && (
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={newSeniorityStart}
                    onChange={(e) => setNewSeniorityStart(Number(e.target.value))}
                    placeholder="Age minimum"
                    className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={newHoursPerYear || ""}
                    onChange={(e) => setNewHoursPerYear(Number(e.target.value))}
                    placeholder="Heures/an"
                    className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
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

              {expandedSectors.has(sectorName) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Age minimum
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase">
                        Heures/an
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sectorEntitlements.map((ent) => (
                      <tr key={ent.id} className="hover:bg-slate-50">
                        {editingId === ent.id ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                min={0}
                                value={editSeniorityStart}
                                onChange={(e) => setEditSeniorityStart(Number(e.target.value))}
                                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <input
                                type="number"
                                min={0}
                                step={0.5}
                                value={editHoursPerYear}
                                onChange={(e) => setEditHoursPerYear(Number(e.target.value))}
                                className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleEdit(ent.id)}
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
                              {ent.seniority_start} ans
                            </td>
                            <td className="px-4 py-2 text-sm text-slate-900 font-medium text-right">
                              {ent.hours_per_year}h
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => startEdit(ent)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Modifier"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(ent.id)}
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
              )}
            </div>
          ))}

          {/* Sectors with has_rtt=true but no entries in rtt_entitlements */}
          {(() => {
            const sectorsWithEntitlements = new Set(Object.values(groupedBySector).map(g => g.sectorId));
            const sectorsWithout = rttSectors.filter(s => !sectorsWithEntitlements.has(s.id) && (!selectedSector || s.name === selectedSector));
            if (sectorsWithout.length === 0) return null;
            return (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Secteurs sans RTT</h3>
                <div className="space-y-2">
                  {sectorsWithout.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-600">{s.name}</span>
                      {addingSectorId === s.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={newSeniorityStart}
                            onChange={(e) => setNewSeniorityStart(Number(e.target.value))}
                            placeholder="Age min"
                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={newHoursPerYear || ""}
                            onChange={(e) => setNewHoursPerYear(Number(e.target.value))}
                            placeholder="Heures/an"
                            className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
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
                          onClick={() => { setAddingSectorId(s.id); setNewSeniorityStart(0); setNewHoursPerYear(0); }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Ajouter une tranche
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
