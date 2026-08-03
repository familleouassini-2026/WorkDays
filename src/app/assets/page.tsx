"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, Car, Smartphone, Printer, Plus, Users, Pencil, Trash2, UserMinus } from "lucide-react";
import SearchableSelect from "@/components/searchable-select";

interface Employee { id: number; first_name: string; last_name: string; }
interface AssetWithAssignment { id: number; type: string; plate_number: string | null; model: string | null; color: string | null; start_date: string | null; end_date: string | null; assignedTo: string | null; assignedEmployeeId: number | null; assignmentId: number | null; assignmentStart: string | null; }
type AssetType = "VOITURES" | "MOBILES" | "IMPRIMANTES";

const TYPE_CONFIG: Record<AssetType, { label: string; icon: any; color: string }> = {
  VOITURES: { label: "Vehicules", icon: Car, color: "bg-blue-50 text-blue-600" },
  MOBILES: { label: "Telephones", icon: Smartphone, color: "bg-emerald-50 text-emerald-600" },
  IMPRIMANTES: { label: "Imprimantes", icon: Printer, color: "bg-purple-50 text-purple-600" },
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetWithAssignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [formType, setFormType] = useState<AssetType>("VOITURES");
  const [formPlate, setFormPlate] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formAssignTo, setFormAssignTo] = useState<string>("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();
    const [assetsRes, assignRes, empRes] = await Promise.all([
      supabase.from("leasing_assets").select("id, type, plate_number, model, color, start_date, end_date").order("type").order("plate_number"),
      supabase.from("employee_leasing").select("id, employee_id, leasing_id, start_date, end_date, employees(first_name, last_name)").is("end_date", null),
      supabase.from("employees").select("id, first_name, last_name").eq("is_inactive", false).order("last_name"),
    ]);
    if (empRes.data) setEmployees(empRes.data);
    if (assetsRes.data) {
      const assignments = (assignRes.data || []) as any[];
      const enriched: AssetWithAssignment[] = assetsRes.data.map((asset) => {
        const assignment = assignments.find((a: any) => a.leasing_id === asset.id);
        return {
          ...asset,
          assignedTo: assignment?.employees ? `${assignment.employees.last_name}, ${assignment.employees.first_name}` : null,
          assignedEmployeeId: assignment?.employee_id || null,
          assignmentId: assignment?.id || null,
          assignmentStart: assignment?.start_date || null,
        };
      });
      setAssets(enriched);
    }
    setLoading(false);
  }

  function startEdit(asset: AssetWithAssignment) {
    setEditingId(asset.id);
    setFormType(asset.type as AssetType);
    setFormPlate(asset.plate_number || "");
    setFormModel(asset.model || "");
    setFormColor(asset.color || "");
    setFormAssignTo(asset.assignedEmployeeId?.toString() || "");
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setFormType("VOITURES"); setFormPlate(""); setFormModel(""); setFormColor(""); setFormAssignTo("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    if (editingId) {
      await supabase.from("leasing_assets").update({
        type: formType, plate_number: formPlate || null, model: formModel || null, color: formColor || null,
      }).eq("id", editingId);

      const currentAsset = assets.find((a) => a.id === editingId);
      const newAssignId = formAssignTo ? Number(formAssignTo) : null;
      const currentAssignId = currentAsset?.assignedEmployeeId || null;

      if (newAssignId !== currentAssignId) {
        if (currentAsset?.assignmentId) {
          await supabase.from("employee_leasing").update({ end_date: new Date().toISOString().split("T")[0] }).eq("id", currentAsset.assignmentId);
        }
        if (newAssignId) {
          await supabase.from("employee_leasing").insert({ employee_id: newAssignId, leasing_id: editingId, start_date: new Date().toISOString().split("T")[0] });
        }
      }
    } else {
      const { data: newAsset, error } = await supabase.from("leasing_assets").insert({
        type: formType, plate_number: formPlate || null, model: formModel || null, color: formColor || null,
      }).select("id").single();

      if (error || !newAsset) { alert("Erreur: " + (error?.message || "")); setSaving(false); return; }

      if (formAssignTo) {
        await supabase.from("employee_leasing").insert({ employee_id: Number(formAssignTo), leasing_id: newAsset.id, start_date: new Date().toISOString().split("T")[0] });
      }
    }

    resetForm();
    setSaving(false);
    fetchData();
  }

  async function handleDelete(assetId: number) {
    if (!confirm("Supprimer cet actif ?")) return;
    const supabase = createClient();
    await supabase.from("employee_leasing").delete().eq("leasing_id", assetId);
    await supabase.from("leasing_assets").delete().eq("id", assetId);
    fetchData();
  }

  async function handleUnassign(asset: AssetWithAssignment) {
    if (!asset.assignmentId) return;
    const supabase = createClient();
    await supabase.from("employee_leasing").update({ end_date: new Date().toISOString().split("T")[0] }).eq("id", asset.assignmentId);
    fetchData();
  }

  const filtered = filterType === "ALL" ? assets : assets.filter((a) => a.type === filterType);
  const totalAssets = assets.length;
  const assigned = assets.filter((a) => a.assignedTo).length;
  const available = totalAssets - assigned;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Actifs</h1>
          <p className="text-slate-500 mt-1">Vehicules, telephones et imprimantes — {totalAssets} actif{totalAssets > 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />Nouvel actif
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4"><div className="flex items-center gap-3"><Package className="w-5 h-5 text-slate-600" /><div><p className="text-2xl font-bold text-slate-900">{totalAssets}</p><p className="text-xs text-slate-600">Total actifs</p></div></div></div>
        <div className="bg-white rounded-lg border p-4"><div className="flex items-center gap-3"><Users className="w-5 h-5 text-emerald-600" /><div><p className="text-2xl font-bold text-slate-900">{assigned}</p><p className="text-xs text-slate-600">Assignes</p></div></div></div>
        <div className="bg-white rounded-lg border p-4"><div className="flex items-center gap-3"><Package className="w-5 h-5 text-amber-600" /><div><p className="text-2xl font-bold text-slate-900">{available}</p><p className="text-xs text-slate-600">Disponibles</p></div></div></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[{ key: "ALL", label: "Tous" }, { key: "VOITURES", label: "Vehicules" }, { key: "MOBILES", label: "Telephones" }, { key: "IMPRIMANTES", label: "Imprimantes" }].map((opt) => (
          <button key={opt.key} onClick={() => setFilterType(opt.key)} className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterType === opt.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>{opt.label}</button>
        ))}
        <span className="text-xs text-slate-500 ml-2">{filtered.length} resultat{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900">{editingId ? "Modifier l'actif" : "Ajouter un actif"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Type *</label><select value={formType} onChange={(e) => setFormType(e.target.value as AssetType)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"><option value="VOITURES">Vehicule</option><option value="MOBILES">Telephone</option><option value="IMPRIMANTES">Imprimante</option></select></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Plaque / Numero</label><input type="text" value={formPlate} onChange={(e) => setFormPlate(e.target.value)} placeholder="Ex: 1ABC234" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Modele</label><input type="text" value={formModel} onChange={(e) => setFormModel(e.target.value)} placeholder="Ex: Toyota Yaris" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Couleur</label><input type="text" value={formColor} onChange={(e) => setFormColor(e.target.value)} placeholder="Ex: Gris" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-medium text-slate-600 mb-1">Assigner a un employe</label><SearchableSelect options={[{value: "", label: "Non assigné (disponible)"}, ...employees.map((emp) => ({value: String(emp.id), label: `${emp.last_name}, ${emp.first_name}`}))]} value={formAssignTo} onChange={setFormAssignTo} placeholder="Rechercher un employé..." /></div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Annuler</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /><p className="text-slate-500 mt-4">Chargement...</p></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center"><Package className="w-12 h-12 text-slate-300 mx-auto" /><p className="text-slate-500 mt-4">Aucun actif enregistre.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => {
            const config = TYPE_CONFIG[asset.type as AssetType] || TYPE_CONFIG.VOITURES;
            const Icon = config.icon;
            return (
              <div key={asset.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{asset.plate_number || asset.model || `${config.label} #${asset.id}`}</p>
                      {asset.model && asset.plate_number && <p className="text-xs text-slate-500">{asset.model}</p>}
                      {asset.color && <p className="text-xs text-slate-400">{asset.color}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(asset)} title="Modifier" className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    {asset.assignedTo && <button onClick={() => handleUnassign(asset)} title="Desassigner" className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"><UserMinus className="w-3.5 h-3.5" /></button>}
                    <button onClick={() => handleDelete(asset.id)} title="Supprimer" className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {asset.assignedTo ? (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Users className="w-3 h-3" />{asset.assignedTo}{asset.assignmentStart && <span className="text-slate-400 ml-1">depuis {new Date(asset.assignmentStart + "T00:00:00").toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</span>}</p>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 italic">Disponible</p>
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
