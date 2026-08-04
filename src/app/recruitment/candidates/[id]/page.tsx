"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Star,
  Download,
  Upload,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  UserCheck,
} from "lucide-react";

// ---------- TYPES ----------

interface Candidate {
  id: number;
  job_opening_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  nationality: string | null;
  national_registration: string | null;
  cv_base64: string | null;
  cv_filename: string | null;
  motivation: string | null;
  notes: string | null;
  status: string;
  interview_date: string | null;
  interview_notes: string | null;
  rating: number | null;
  employee_id: number | null;
  created_at: string;
}

interface JobOpening {
  id: number;
  title: string;
  sector_id: number | null;
  location_id: number | null;
  contract_type: string | null;
}

// ---------- CONSTANTS ----------

const STATUS_OPTIONS = [
  { value: "received", label: "Recu" },
  { value: "shortlisted", label: "Preselectionne" },
  { value: "interview", label: "Entretien" },
  { value: "offered", label: "Offre" },
  { value: "hired", label: "Embauche" },
  { value: "rejected", label: "Refuse" },
];

const STATUS_COLORS: Record<string, string> = {
  received: "bg-slate-100 text-slate-700",
  shortlisted: "bg-blue-100 text-blue-700",
  interview: "bg-amber-100 text-amber-700",
  offered: "bg-purple-100 text-purple-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const MAX_CV_SIZE = 2 * 1024 * 1024;

// ---------- PAGE ----------

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [jobOpening, setJobOpening] = useState<JobOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHireForm, setShowHireForm] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Hire form state
  const [hireDateOfHire, setHireDateOfHire] = useState("");
  const [hireDateOfBirth, setHireDateOfBirth] = useState("");
  const [hiring, setHiring] = useState(false);
  const [hireError, setHireError] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  async function loadData() {
    const supabase = createClient();
    const { data: cand } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (cand) {
      setCandidate(cand as Candidate);
      if (cand.job_opening_id) {
        const { data: job } = await supabase
          .from("job_openings")
          .select("id, title, sector_id, location_id, contract_type")
          .eq("id", cand.job_opening_id)
          .single();
        if (job) setJobOpening(job as JobOpening);
      }
    }
    setLoading(false);
  }

  async function updateField(field: string, value: any) {
    if (!candidate) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("candidates").update({ [field]: value }).eq("id", candidate.id);
    setCandidate({ ...candidate, [field]: value });
    setSaving(false);
  }

  async function handleStatusChange(newStatus: string) {
    await updateField("status", newStatus);
  }

  async function handleRatingClick(rating: number) {
    const newRating = candidate?.rating === rating ? null : rating;
    await updateField("rating", newRating);
  }

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (file.size > MAX_CV_SIZE) {
      setUploadError("Le fichier depasse 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const supabase = createClient();
      await supabase
        .from("candidates")
        .update({ cv_base64: base64, cv_filename: file.name })
        .eq("id", candidate!.id);
      setCandidate({ ...candidate!, cv_base64: base64, cv_filename: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleCvDownload() {
    if (!candidate?.cv_base64 || !candidate?.cv_filename) return;
    const link = document.createElement("a");
    link.href = candidate.cv_base64;
    link.download = candidate.cv_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleNotesUpdate(field: "notes" | "motivation" | "interview_notes", value: string) {
    await updateField(field, value || null);
  }

  async function handleInterviewDateUpdate(value: string) {
    await updateField("interview_date", value || null);
  }

  async function handleHire() {
    if (!candidate || !hireDateOfHire) {
      setHireError("La date d'embauche est obligatoire.");
      return;
    }

    setHiring(true);
    setHireError("");
    const supabase = createClient();

    // Build employee payload from candidate + job opening
    const employeePayload: Record<string, any> = {
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      email: candidate.email || null,
      mobile_phone: candidate.phone || null,
      nationality: candidate.nationality || null,
      national_registration: candidate.national_registration || null,
      address: candidate.address || null,
      city: candidate.city || null,
      postal_code: candidate.postal_code || null,
      date_of_hire: hireDateOfHire,
      date_of_birth: hireDateOfBirth || null,
      contract_type: jobOpening?.contract_type || null,
      sector_id: jobOpening?.sector_id || null,
      location_id: jobOpening?.location_id || null,
      job_title: jobOpening?.title || null,
      country: "Belgique",
      is_inactive: false,
    };

    const { data: newEmployee, error: empError } = await supabase
      .from("employees")
      .insert(employeePayload)
      .select("id")
      .single();

    if (empError || !newEmployee) {
      setHireError("Erreur lors de la creation: " + (empError?.message || ""));
      setHiring(false);
      return;
    }

    // Update candidate status
    await supabase
      .from("candidates")
      .update({ status: "hired", employee_id: newEmployee.id })
      .eq("id", candidate.id);

    // Check if all candidates for this job are hired/rejected -> fill the position
    if (candidate.job_opening_id) {
      const { data: otherCandidates } = await supabase
        .from("candidates")
        .select("id, status")
        .eq("job_opening_id", candidate.job_opening_id);

      if (otherCandidates) {
        const allDone = otherCandidates.every(
          (c) => c.id === candidate.id || ["hired", "rejected"].includes(c.status)
        );
        if (allDone) {
          await supabase
            .from("job_openings")
            .update({ status: "filled" })
            .eq("id", candidate.job_opening_id);
        }
      }
    }

    setHiring(false);
    router.push(`/employees/${newEmployee.id}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Candidat introuvable.</p>
        <Link href="/recruitment/candidates" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Retour a la liste
        </Link>
      </div>
    );
  }

  const canHire = ["offered", "hired"].includes(candidate.status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back + Header */}
      <Link
        href="/recruitment/candidates"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux candidats
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {candidate.first_name} {candidate.last_name}
          </h1>
          {jobOpening && (
            <p className="text-sm text-slate-500 mt-0.5">
              Candidat pour : <span className="font-medium">{jobOpening.title}</span>
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[candidate.status]}`}>
          {STATUS_OPTIONS.find((s) => s.value === candidate.status)?.label}
        </span>
      </div>

      {/* Status + Rating */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
          <select
            value={candidate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={saving}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Rating</label>
          <div className="flex items-center gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => handleRatingClick(i)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    candidate.rating && i <= candidate.rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-slate-200 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Informations personnelles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {candidate.email && (
            <p className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" /> {candidate.email}
            </p>
          )}
          {candidate.phone && (
            <p className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" /> {candidate.phone}
            </p>
          )}
          {(candidate.address || candidate.city || candidate.postal_code) && (
            <p className="flex items-center gap-2 text-slate-600 sm:col-span-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              {[candidate.address, candidate.postal_code, candidate.city].filter(Boolean).join(", ")}
            </p>
          )}
          {candidate.nationality && (
            <p className="text-slate-600"><span className="text-slate-400 text-xs">Nationalite:</span> {candidate.nationality}</p>
          )}
          {candidate.national_registration && (
            <p className="text-slate-600"><span className="text-slate-400 text-xs">N registre nat.:</span> {candidate.national_registration}</p>
          )}
        </div>
      </div>

      {/* CV */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" /> CV
        </h2>
        {candidate.cv_filename ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{candidate.cv_filename}</span>
            <button
              onClick={handleCvDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100"
            >
              <Download className="w-3.5 h-3.5" /> Telecharger
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Aucun CV uploade.</p>
        )}
        <div className="mt-3">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            {candidate.cv_filename ? "Remplacer le CV" : "Uploader un CV"} (max 2 MB, PDF/images)
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleCvUpload}
            className="text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
        </div>
      </div>

      {/* Motivation & Notes */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Motivation</label>
          <textarea
            defaultValue={candidate.motivation || ""}
            onBlur={(e) => handleNotesUpdate("motivation", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Motivation du candidat..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea
            defaultValue={candidate.notes || ""}
            onBlur={(e) => handleNotesUpdate("notes", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Notes internes..."
          />
        </div>
      </div>

      {/* Interview */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Entretien
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date d entretien</label>
            <input
              type="datetime-local"
              defaultValue={candidate.interview_date ? candidate.interview_date.slice(0, 16) : ""}
              onBlur={(e) => handleInterviewDateUpdate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date de candidature</label>
            <p className="text-sm text-slate-600 pt-2">
              {new Date(candidate.created_at).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes d entretien</label>
          <textarea
            defaultValue={candidate.interview_notes || ""}
            onBlur={(e) => handleNotesUpdate("interview_notes", e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            placeholder="Notes de l'entretien..."
          />
        </div>
      </div>

      {/* Hire button */}
      {canHire && !showHireForm && (
        <button
          onClick={() => setShowHireForm(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <UserCheck className="w-5 h-5" />
          Embaucher ce candidat
        </button>
      )}

      {/* Hire form */}
      {showHireForm && (
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4" /> Creer l employe
          </h2>
          <p className="text-xs text-emerald-700">
            Les champs suivants seront copies automatiquement : prenom, nom, email, telephone, nationalite,
            registre national, adresse, ville, code postal, type de contrat, secteur, site, fonction.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date d embauche <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={hireDateOfHire}
                onChange={(e) => setHireDateOfHire(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date de naissance</label>
              <input
                type="date"
                value={hireDateOfBirth}
                onChange={(e) => setHireDateOfBirth(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 mb-2">Donnees pre-remplies :</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <span><b>Prenom:</b> {candidate.first_name}</span>
              <span><b>Nom:</b> {candidate.last_name}</span>
              {candidate.email && <span><b>Email:</b> {candidate.email}</span>}
              {candidate.phone && <span><b>Tel:</b> {candidate.phone}</span>}
              {candidate.nationality && <span><b>Nationalite:</b> {candidate.nationality}</span>}
              {candidate.national_registration && <span><b>Reg. nat.:</b> {candidate.national_registration}</span>}
              {jobOpening?.contract_type && <span><b>Contrat:</b> {jobOpening.contract_type}</span>}
              {jobOpening?.title && <span><b>Fonction:</b> {jobOpening.title}</span>}
            </div>
          </div>

          {hireError && (
            <p className="text-sm text-red-600">{hireError}</p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowHireForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              onClick={handleHire}
              disabled={hiring}
              className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {hiring ? "Creation en cours..." : "Creer l employe"}
            </button>
          </div>
        </div>
      )}

      {/* Link to employee if already hired */}
      {candidate.employee_id && (
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 text-center">
          <p className="text-sm text-emerald-700">
            Ce candidat a ete embauche.{" "}
            <Link href={`/employees/${candidate.employee_id}`} className="font-medium underline">
              Voir la fiche employe
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
