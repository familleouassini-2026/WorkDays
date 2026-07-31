"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  FileText,
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface RequestRow {
  id: number;
  requestor_id: number;
  description: string;
  request_date: string;
  deadline: string | null;
  status: string;
  comment: string | null;
  employees: { first_name: string; last_name: string } | null;
}

type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "IN_PROGRESS" | "COMPLETED";

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "En attente", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  ACCEPTED: { label: "Acceptee", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED: { label: "Refusee", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
  IN_PROGRESS: { label: "En cours", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Loader2 className="w-3.5 h-3.5" /> },
  COMPLETED: { label: "Terminee", color: "bg-slate-100 text-slate-700 border-slate-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

// ============================================================
// COMPONENT
// ============================================================

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Form state
  const [formRequestorId, setFormRequestorId] = useState<string>("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formDeadline, setFormDeadline] = useState("");
  const [formComment, setFormComment] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();

    const [reqRes, empRes] = await Promise.all([
      supabase
        .from("requests")
        .select("id, requestor_id, description, request_date, deadline, status, comment, employees(first_name, last_name)")
        .order("request_date", { ascending: false }),
      supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("is_inactive", false)
        .order("last_name"),
    ]);

    if (reqRes.data) setRequests(reqRes.data as unknown as RequestRow[]);
    if (empRes.data) setEmployees(empRes.data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRequestorId || !formDescription || !formDate) return;
    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase.from("requests").insert({
      requestor_id: Number(formRequestorId),
      description: formDescription,
      request_date: formDate,
      deadline: formDeadline || null,
      comment: formComment || null,
      status: "PENDING",
    });

    if (error) {
      alert("Erreur: " + error.message);
      setSaving(false);
      return;
    }

    // Reset
    setFormRequestorId("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormDeadline("");
    setFormComment("");
    setShowForm(false);
    setSaving(false);
    fetchData();
  }

  async function updateStatus(requestId: number, newStatus: RequestStatus) {
    const supabase = createClient();
    await supabase
      .from("requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);
    fetchData();
  }

  // Filter
  const filtered =
    filterStatus === "ALL"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  // Stats
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const inProgress = requests.filter((r) => r.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/governance"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Demandes</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              {requests.length} demande{requests.length > 1 ? "s" : ""} —{" "}
              {pending > 0 && (
                <span className="text-amber-600 font-medium">
                  {pending} en attente
                </span>
              )}
              {pending > 0 && inProgress > 0 && ", "}
              {inProgress > 0 && (
                <span className="text-blue-600 font-medium">
                  {inProgress} en cours
                </span>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle demande
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "ALL", label: "Toutes" },
          { key: "PENDING", label: "En attente" },
          { key: "IN_PROGRESS", label: "En cours" },
          { key: "ACCEPTED", label: "Acceptees" },
          { key: "REJECTED", label: "Refusees" },
          { key: "COMPLETED", label: "Terminees" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterStatus(opt.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
              filterStatus === opt.key
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-2">
          {filtered.length} resultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-amber-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            Soumettre une demande
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Demandeur *
              </label>
              <select
                value={formRequestorId}
                onChange={(e) => setFormRequestorId(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="">Selectionner un employe</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.last_name}, {emp.first_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date de demande *
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                required
                placeholder="Ex: Recuperation des heures supplementaires"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date limite
              </label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Commentaire
              </label>
              <input
                type="text"
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Optionnel..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Soumettre"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune demande trouvee.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Demande
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Demandeur
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Date
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Deadline
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Statut
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => {
                const config = STATUS_CONFIG[req.status as RequestStatus] || STATUS_CONFIG.PENDING;
                const isOverdue =
                  req.deadline &&
                  new Date(req.deadline) < new Date() &&
                  req.status !== "COMPLETED" &&
                  req.status !== "ACCEPTED" &&
                  req.status !== "REJECTED";

                return (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">
                        {req.description}
                      </p>
                      {req.comment && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.comment}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {req.employees
                        ? `${req.employees.last_name}, ${req.employees.first_name}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 text-center">
                      {new Date(req.request_date + "T00:00:00").toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "short" }
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {req.deadline ? (
                        <span
                          className={`text-xs ${
                            isOverdue
                              ? "text-red-600 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          {isOverdue && (
                            <AlertCircle className="w-3 h-3 inline mr-0.5" />
                          )}
                          {new Date(req.deadline + "T00:00:00").toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short" }
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}
                      >
                        {config.icon}
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => updateStatus(req.id, "ACCEPTED")}
                            title="Accepter"
                            className="p-1.5 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(req.id, "REJECTED")}
                            title="Refuser"
                            className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {req.status === "ACCEPTED" && (
                        <button
                          onClick={() => updateStatus(req.id, "COMPLETED")}
                          title="Marquer termine"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {req.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => updateStatus(req.id, "COMPLETED")}
                          title="Marquer termine"
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
