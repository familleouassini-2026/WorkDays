"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Building2, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Organisation {
  id: number;
  name: string;
  vat_number: string | null;
  registration: string | null;
  comite_paritaire: string | null;
  address: string | null;
  post_code: string | null;
  city: string | null;
  country: string | null;
  commune: string | null;
  telephone: string | null;
  fax: string | null;
  full_time_hours: number;
  full_time_minutes: number;
}

export default function OrganisationPage() {
  const [org, setOrg] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);


  useEffect(() => { fetchOrg(); }, []);

  async function fetchOrg() {
    const supabase = createClient();
    const { data } = await supabase.from("organisations").select("*").limit(1).single();
    if (data) setOrg(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!org) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("organisations").update({
      name: org.name,
      vat_number: org.vat_number,
      registration: org.registration,
      comite_paritaire: org.comite_paritaire,
      address: org.address,
      post_code: org.post_code,
      city: org.city,
      country: org.country,
      commune: org.commune,
      telephone: org.telephone,
      fax: org.fax,
      full_time_hours: org.full_time_hours,
      full_time_minutes: org.full_time_minutes,
    }).eq("id", org.id);
    setSaving(false);
    if (error) { alert("Erreur: " + error.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateField(field: keyof Organisation, value: string | number) {
    if (!org) return;
    setOrg({ ...org, [field]: value });
  }


  if (loading) return <div className="p-12 text-center"><div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>;
  if (!org) return <div className="p-12 text-center text-slate-500">Aucune organisation configurée</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Organisation</h1>
          <p className="text-slate-500 text-sm mt-0.5">Informations de l&apos;entreprise</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Enregistré" : saving ? "..." : "Enregistrer"}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <CheckCircle2 className="w-4 h-4" /> Modifications enregistrées
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identité */}
        <div className="bg-white border rounded-lg p-5 md:col-span-2">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-blue-600" /> Identité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom" value={org.name} onChange={(v) => updateField("name", v)} />
            <Field label="N° TVA" value={org.vat_number || ""} onChange={(v) => updateField("vat_number", v)} placeholder="BE0xxx.xxx.xxx" />
            <Field label="N° d'enregistrement" value={org.registration || ""} onChange={(v) => updateField("registration", v)} />
            <Field label="Comité paritaire" value={org.comite_paritaire || ""} onChange={(v) => updateField("comite_paritaire", v)} />
          </div>
        </div>


        {/* Adresse */}
        <div className="bg-white border rounded-lg p-5 md:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Adresse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Rue et numéro" value={org.address || ""} onChange={(v) => updateField("address", v)} />
            </div>
            <Field label="Code postal" value={org.post_code || ""} onChange={(v) => updateField("post_code", v)} />
            <Field label="Ville" value={org.city || ""} onChange={(v) => updateField("city", v)} />
            <Field label="Commune" value={org.commune || ""} onChange={(v) => updateField("commune", v)} />
            <Field label="Pays" value={org.country || ""} onChange={(v) => updateField("country", v)} />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Contact</h3>
          <div className="space-y-4">
            <Field label="Téléphone" value={org.telephone || ""} onChange={(v) => updateField("telephone", v)} />
            <Field label="Fax" value={org.fax || ""} onChange={(v) => updateField("fax", v)} />
          </div>
        </div>

        {/* Temps de travail */}
        <div className="bg-white border rounded-lg p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Temps plein de référence</h3>
          <div className="space-y-4">
            <Field label="Heures/semaine" value={org.full_time_hours.toString()} onChange={(v) => updateField("full_time_hours", parseInt(v) || 0)} type="number" />
            <Field label="Minutes supplémentaires" value={org.full_time_minutes.toString()} onChange={(v) => updateField("full_time_minutes", parseInt(v) || 0)} type="number" />
            <p className="text-xs text-slate-500">Référence temps plein : {org.full_time_hours}h{org.full_time_minutes > 0 ? org.full_time_minutes.toString().padStart(2, "0") : ""}/semaine</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
