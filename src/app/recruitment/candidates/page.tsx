"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, Filter, Star, Plus, Upload, X } from "lucide-react";

interface Candidate {
  id: number;
  job_opening_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  rating: number | null;
  created_at: string;
}

interface JobOpening {
  id: number;
  title: string;
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  received: "bg-slate-100 text-slate-700",
  shortlisted: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offered: "bg-purple-100 text-purple-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  received: "Recu",
  shortlisted: "Preselectionne",
  interview: "Entretien",
  offered: "Offre",
  hired: "Embauche",
  rejected: "Refuse",
};

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-slate-400">-</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <CandidatesContent />
    </Suspense>
  );
}

function CandidatesContent() {
  const searchParams = useSearchParams();
  const openingFilter = searchParams.get("opening");
  const shouldOpenForm = searchParams.get("new") === "true";

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpening, setFilterOpening] = useState<string>(openingFilter || "all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formJobOpening, setFormJobOpening] = useState("");
  const [formNationality, setFormNationality] = useState("");
  const [formNationalRegistration, setFormNationalRegistration] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formPostalCode, setFormPostalCode] = useState("");
  const [formCvBase64, setFormCvBase64] = useState("");
  const [formCvFilename, setFormCvFilename] = useState("");
  const [formMotivation, setFormMotivation] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (openingFilter) setFilterOpening(openingFilter);
  }, [openingFilter]);

  useEffect(() => {
    if (shouldOpenForm && !loading) {
      setShowForm(true);
    }
  }, [shouldOpenForm, loading]);

  async function loadData() {
    const supabase = createClient();
    const [candidatesRes, openingsRes] = await Promise.all([
      supabase.from("candidates").select("id, job_opening_id, first_name, last_name, email, status, rating, created_at").order("created_at", { ascending: false }),
      supabase.from("job_openings").select("id, title, status").order("title"),
    ]);
    if (candidatesRes.data) setCandidates(candidatesRes.data);
    if (openingsRes.data) setOpenings(openingsRes.data);
    setLoading(false);
  }

  function resetForm() {
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPhone("");
    setFormJobOpening("");
    setFormNationality("");
    setFormNationalRegistration("");
    setFormAddress("");
    setFormCity("");
    setFormPostalCode("");
    setFormCvBase64("");
    setFormCvFilename("");
    setFormMotivation("");
    setShowForm(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("Le fichier ne doit pas depasser 2 Mo.");
      e.target.value = "";
      return;
    }

    // Only PDF and images
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Seuls les fichiers PDF et images sont acceptes.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setFormCvBase64(base64);
      setFormCvFilename(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formFirstName.trim() || !formLastName.trim()) return;
    setSaving(true);

    const supabase = createClient();
    const payload: Record<string, any> = {
      first_name: formFirstName.trim(),
      last_name: formLastName.trim(),
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
      job_opening_id: formJobOpening ? Number(formJobOpening) : null,
      nationality: formNationality.trim() || null,
      national_registration: formNationalRegistration.trim() || null,
      address: formAddress.trim() || null,
      city: formCity.trim() || null,
      postal_code: formPostalCode.trim() || null,
      cv_base64: formCvBase64 || null,
      cv_filename: formCvFilename || null,
      motivation: formMotivation.trim() || null,
      status: "received",
    };

    await supabase.from("candidates").insert(payload);
    resetForm();
    setSaving(false);
    // Refresh list
    setLoading(true);
    await loadData();
  }

  const openingMap = new Map(openings.map((o) => [o.id, o.title]));
  const openOpenings = openings.filter((o) => o.status === "open");

  const filtered = candidates.filter((c) => {
    if (filterOpening !== "all" && c.job_opening_id !== Number(filterOpening)) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

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
            <h1 className="text-2xl font-bold text-slate-900">Candidats</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              {candidates.length} candidat{candidates.length > 1 ? "s" : ""} au total
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau candidat
          </button>
        )}
      </div>

      {/* Add candidate form (inline) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Nouveau candidat</h2>
            <button type="button" onClick={resetForm} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Required fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prenom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prenom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telephone</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+32 ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Poste</label>
              <select
                value={formJobOpening}
                onChange={(e) => setFormJobOpening(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Aucun --</option>
                {openOpenings.map((o) => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nationalite</label>
              <input
                type="text"
                value={formNationality}
                onChange={(e) => setFormNationality(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Belge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">N° Registre National</label>
              <input
                type="text"
                value={formNationalRegistration}
                onChange={(e) => setFormNationalRegistration(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XX.XX.XX-XXX.XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rue ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bruxelles"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code postal</label>
              <input
                type="text"
                value={formPostalCode}
                onChange={(e) => setFormPostalCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1000"
              />
            </div>
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CV (PDF ou image, max 2 Mo)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                {formCvFilename || "Choisir un fichier"}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {formCvFilename && (
                <button
                  type="button"
                  onClick={() => { setFormCvBase64(""); setFormCvFilename(""); }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>

          {/* Motivation */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Motivation</label>
            <textarea
              value={formMotivation}
              onChange={(e) => setFormMotivation(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="Lettre de motivation ou notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !formFirstName.trim() || !formLastName.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Creation..." : "Creer"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={filterOpening}
          onChange={(e) => setFilterOpening(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les postes</option>
          {openings.map((o) => (
            <option key={o.id} value={o.id}>{o.title}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun candidat.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Poste</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/recruitment/candidates/${c.id}`}
                        className="text-sm font-medium text-blue-700 hover:underline"
                      >
                        {c.last_name} {c.first_name}
                      </Link>
                      {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {c.job_opening_id ? openingMap.get(c.job_opening_id) || "-" : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RatingStars rating={c.rating} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleDateString("fr-BE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
