"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Upload,
  Download,
  Trash2,
  FileText,
  Filter,
} from "lucide-react";

// ---------- TYPES ----------

interface Document {
  id: number;
  employee_id: number;
  name: string;
  file_type: string | null;
  file_size: number | null;
  file_base64: string;
  category: string;
  uploaded_at: string;
  notes: string | null;
}

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

// ---------- CONSTANTS ----------

const CATEGORIES = [
  { value: "contrat", label: "Contrat" },
  { value: "avenant", label: "Avenant" },
  { value: "attestation", label: "Attestation" },
  { value: "fiche_paie", label: "Fiche de paie" },
  { value: "medical", label: "Medical" },
  { value: "formation", label: "Formation" },
  { value: "other", label: "Autre" },
];

const ACCEPTED_TYPES = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.docx,.doc";
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// ---------- HELPERS ----------

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function categoryLabel(value: string): string {
  const cat = CATEGORIES.find((c) => c.value === value);
  return cat ? cat.label : value;
}

function categoryColor(value: string): string {
  switch (value) {
    case "contrat":
      return "bg-blue-100 text-blue-700";
    case "avenant":
      return "bg-purple-100 text-purple-700";
    case "attestation":
      return "bg-green-100 text-green-700";
    case "fiche_paie":
      return "bg-amber-100 text-amber-700";
    case "medical":
      return "bg-red-100 text-red-700";
    case "formation":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

// ---------- PAGE ----------

export default function EmployeeDocumentsPage() {
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("other");
  const [uploadNotes, setUploadNotes] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  async function loadData() {
    const supabase = createClient();

    const { data: emp } = await supabase
      .from("employees")
      .select("id, first_name, last_name")
      .eq("id", employeeId)
      .single();
    if (emp) setEmployee(emp);

    const { data: docs } = await supabase
      .from("employee_documents")
      .select("*")
      .eq("employee_id", employeeId)
      .order("uploaded_at", { ascending: false });
    if (docs) setDocuments(docs as Document[]);

    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (file.size > MAX_SIZE_BYTES) {
      setUploadError("Le fichier depasse 2 MB.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const supabase = createClient();

      const docName = uploadName.trim() || file.name;

      const { error } = await supabase.from("employee_documents").insert({
        employee_id: Number(employeeId),
        name: docName,
        file_type: file.type || null,
        file_size: file.size,
        file_base64: base64,
        category: uploadCategory,
        notes: uploadNotes.trim() || null,
      });

      if (error) {
        setUploadError("Erreur lors de l'upload: " + error.message);
      } else {
        setUploadName("");
        setUploadCategory("other");
        setUploadNotes("");
        await loadData();
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function handleDownload(doc: Document) {
    const link = document.createElement("a");
    link.href = doc.file_base64;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleDelete(id: number) {
    const supabase = createClient();
    await supabase.from("employee_documents").delete().eq("id", id);
    setDeleteId(null);
    await loadData();
  }

  const filteredDocuments =
    filterCategory === "all"
      ? documents
      : documents.filter((d) => d.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/employees/${employeeId}`}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au profil
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Documents
          </h1>
          {employee && (
            <p className="text-sm text-slate-500">
              {employee.first_name} {employee.last_name}
            </p>
          )}
        </div>
      </div>

      {/* Upload form */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" /> Ajouter un document
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nom du document
            </label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="Nom (optionnel)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Categorie
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={uploadNotes}
              onChange={(e) => setUploadNotes(e.target.value)}
              placeholder="Notes (optionnel)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Fichier (max 2 MB)
            </label>
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleUpload}
              disabled={uploading}
              className="w-full text-sm text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
            />
          </div>
        </div>
        {uploadError && (
          <p className="text-sm text-red-600 mt-2">{uploadError}</p>
        )}
        {uploading && (
          <p className="text-sm text-blue-600 mt-2">Upload en cours...</p>
        )}
      </div>

      {/* Filter + Document list */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Documents ({filteredDocuments.length})
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            Aucun document{filterCategory !== "all" ? " dans cette categorie" : ""}.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {doc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColor(
                          doc.category
                        )}`}
                      >
                        {categoryLabel(doc.category)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(doc.uploaded_at)}
                      </span>
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">{doc.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Telecharger
                  </button>
                  {deleteId === doc.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(doc.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
    </div>
  );
}
