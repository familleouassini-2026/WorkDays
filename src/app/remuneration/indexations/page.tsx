"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Building2, Layers, Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface OrgIndexation {
  id: number;
  indexation_value: number;
  indexation_date: string;
}

interface SectorIndexation {
  id: number;
  sector_id: number;
  indexation_value: number;
  indexation_date: string;
  sectors?: { name: string } | null;
}

interface Sector {
  id: number;
  name: string;
}

export default function IndexationsPage() {
  const [tab, setTab] = useState<"org" | "sector">("org");
  const [orgIndexations, setOrgIndexations] = useState<OrgIndexation[]>([]);
  const [sectorIndexations, setSectorIndexations] = useState<SectorIndexation[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(1);
  const [editDate, setEditDate] = useState<string>("");
  const [editSectorId, setEditSectorId] = useState<number>(0);

  // Add state
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState<number>(1);
  const [newDate, setNewDate] = useState<string>("");
  const [newSectorId, setNewSectorId] = useState<number>(0);

  async function fetchData() {
    const supabase = createClient();
    const [orgRes, secRes, sectorsRes] = await Promise.all([
      supabase
        .from("organisation_indexations")
        .select("id, indexation_value, indexation_date")
        .order("indexation_date", { ascending: true }),
      supabase
        .from("sector_indexations")
        .select("id, sector_id, indexation_value, indexation_date, sectors(name)")
        .order("indexation_date", { ascending: true }),
      supabase.from("sectors").select("id, name").order("name"),
    ]);
    if (orgRes.data) setOrgIndexations(orgRes.data);
    if (secRes.data) setSectorIndexations(secRes.data as unknown as SectorIndexation[]);
    if (sectorsRes.data) setSectors(sectorsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  // DProduct calculations
  function computeDProduct(items: { indexation_value: number }[]): number {
    return items.reduce((acc, i) => acc * i.indexation_value, 1);
  }

  const orgDProduct = computeDProduct(orgIndexations);
  const sectorDProducts: Record<number, number> = {};
  for (const si of sectorIndexations) {
    if (!sectorDProducts[si.sector_id]) sectorDProducts[si.sector_id] = 1;
    sectorDProducts[si.sector_id] *= si.indexation_value;
  }

  // ORG CRUD
  async function handleAddOrg() {
    if (!newDate || newValue <= 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("organisation_indexations")
      .insert({ indexation_value: newValue, indexation_date: newDate, organisation_id: 1 });
    if (!error) {
      setAdding(false);
      setNewValue(1);
      setNewDate("");
      await fetchData();
    }
  }

  async function handleEditOrg(id: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("organisation_indexations")
      .update({ indexation_value: editValue, indexation_date: editDate })
      .eq("id", id);
    if (!error) {
      setEditingId(null);
      await fetchData();
    }
  }

  async function handleDeleteOrg(id: number) {
    if (!window.confirm("Supprimer cette indexation ? Cette action est irreversible.")) return;
    const supabase = createClient();
    await supabase.from("organisation_indexations").delete().eq("id", id);
    await fetchData();
  }

  // SECTOR CRUD
  async function handleAddSector() {
    if (!newDate || newValue <= 0 || !newSectorId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("sector_indexations")
      .insert({ sector_id: newSectorId, indexation_value: newValue, indexation_date: newDate });
    if (!error) {
      setAdding(false);
      setNewValue(1);
      setNewDate("");
      setNewSectorId(0);
      await fetchData();
    }
  }

  async function handleEditSector(id: number) {
    const supabase = createClient();
    const { error } = await supabase
      .from("sector_indexations")
      .update({ sector_id: editSectorId, indexation_value: editValue, indexation_date: editDate })
      .eq("id", id);
    if (!error) {
      setEditingId(null);
      await fetchData();
    }
  }

  async function handleDeleteSector(id: number) {
    if (!window.confirm("Supprimer cette indexation sectorielle ? Cette action est irreversible.")) return;
    const supabase = createClient();
    await supabase.from("sector_indexations").delete().eq("id", id);
    await fetchData();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Indexations</h1>
          <p className="text-slate-500 mt-1">
            Gestion des coefficients d&apos;indexation salariale
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => { setTab("org"); setAdding(false); setEditingId(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "org" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Generales
        </button>
        <button
          onClick={() => { setTab("sector"); setAdding(false); setEditingId(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "sector" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          Sectorielles
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">DProduct org</p>
          <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{orgDProduct.toFixed(6)}</p>
          <p className="text-xs text-slate-500">{orgIndexations.length} indexation{orgIndexations.length > 1 ? "s" : ""}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-slate-500 font-medium uppercase">Indexations sectorielles</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{sectorIndexations.length}</p>
          <p className="text-xs text-slate-500">{Object.keys(sectorDProducts).length} secteur{Object.keys(sectorDProducts).length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : tab === "org" ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Indexations generales (organisation)</h3>
            <button
              onClick={() => { setAdding(!adding); setNewValue(1); setNewDate(""); }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {adding && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
              <input
                type="number"
                min={0}
                step={0.000001}
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                placeholder="Coefficient"
                className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button onClick={handleAddOrg} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setAdding(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date d&apos;effet</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Coefficient</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">DProduct cumule</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orgIndexations.map((idx, i) => {
                const cumulative = orgIndexations.slice(0, i + 1).reduce((acc, x) => acc * x.indexation_value, 1);
                return (
                  <tr key={idx.id} className="hover:bg-slate-50">
                    {editingId === idx.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" step={0.000001} value={editValue} onChange={(e) => setEditValue(Number(e.target.value))} className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:outline-none" />
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-slate-400 font-mono">-</td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditOrg(idx.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                          {new Date(idx.indexation_date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900 font-mono text-right">{idx.indexation_value.toFixed(6)}</td>
                        <td className="px-4 py-3 text-sm text-emerald-700 font-mono text-right font-medium">{cumulative.toFixed(6)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingId(idx.id); setEditValue(idx.indexation_value); setEditDate(idx.indexation_date); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Modifier"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteOrg(idx.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orgIndexations.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-500">Aucune indexation generale enregistree.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">Indexations sectorielles</h3>
            <button
              onClick={() => { setAdding(!adding); setNewValue(1); setNewDate(""); setNewSectorId(sectors[0]?.id || 0); }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {adding && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-wrap">
              <select
                value={newSectorId}
                onChange={(e) => setNewSectorId(Number(e.target.value))}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value={0}>Choisir secteur...</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                step={0.000001}
                value={newValue}
                onChange={(e) => setNewValue(Number(e.target.value))}
                placeholder="Coefficient"
                className="w-32 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
              />
              <button onClick={handleAddSector} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setAdding(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date d&apos;effet</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Secteur</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Coefficient</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">DProduct secteur</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectorIndexations.map((idx) => {
                const dProduct = sectorDProducts[idx.sector_id] || 1;
                return (
                  <tr key={idx.id} className="hover:bg-slate-50">
                    {editingId === idx.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none" />
                        </td>
                        <td className="px-4 py-2">
                          <select value={editSectorId} onChange={(e) => setEditSectorId(Number(e.target.value))} className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none">
                            {sectors.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" step={0.000001} value={editValue} onChange={(e) => setEditValue(Number(e.target.value))} className="w-28 rounded-md border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:outline-none" />
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-slate-400 font-mono">-</td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEditSector(idx.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                          {new Date(idx.indexation_date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{idx.sectors?.name || `Secteur ${idx.sector_id}`}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 font-mono text-right">{idx.indexation_value.toFixed(6)}</td>
                        <td className="px-4 py-3 text-sm text-emerald-700 font-mono text-right font-medium">{dProduct.toFixed(6)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditingId(idx.id); setEditValue(idx.indexation_value); setEditDate(idx.indexation_date); setEditSectorId(idx.sector_id); }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Modifier"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteSector(idx.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sectorIndexations.length === 0 && (
            <p className="text-center py-6 text-sm text-slate-500">Aucune indexation sectorielle enregistree.</p>
          )}
        </div>
      )}
    </div>
  );
}
