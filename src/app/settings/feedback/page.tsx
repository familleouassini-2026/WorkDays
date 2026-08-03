"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Bug, Lightbulb, HelpCircle, Check, X, Copy, Trash2, Filter } from "lucide-react";
import Link from "next/link";

interface Feedback {
  id: number;
  page_url: string;
  feedback_type: string;
  message: string;
  status: string;
  reviewer_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const STATUS_OPTIONS = [
  { id: "new", label: "Nouveau", color: "bg-blue-100 text-blue-700" },
  { id: "accepted", label: "Accepté", color: "bg-green-100 text-green-700" },
  { id: "rejected", label: "Rejeté", color: "bg-red-100 text-red-700" },
  { id: "done", label: "Fait", color: "bg-slate-100 text-slate-600" },
];

const TYPE_ICONS: Record<string, typeof Bug> = { bug: Bug, suggestion: Lightbulb, question: HelpCircle };

export default function FeedbackAdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const supabase = createClient();
    const { data } = await supabase.from("user_feedback").select("*").order("created_at", { ascending: false });
    if (data) setFeedbacks(data);
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    const supabase = createClient();
    await supabase.from("user_feedback").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, status, reviewed_at: new Date().toISOString() } : f));
  }

  async function updateNotes(id: number, notes: string) {
    const supabase = createClient();
    await supabase.from("user_feedback").update({ reviewer_notes: notes }).eq("id", id);
    setFeedbacks((prev) => prev.map((f) => f.id === id ? { ...f, reviewer_notes: notes } : f));
  }

  async function deleteFeedback(id: number) {
    if (!confirm("Supprimer ce feedback ?")) return;
    const supabase = createClient();
    await supabase.from("user_feedback").delete().eq("id", id);
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  }

  function generatePrompt() {
    const accepted = feedbacks.filter((f) => f.status === "accepted");
    if (accepted.length === 0) { alert("Aucun feedback accepté à exporter."); return; }

    const grouped: Record<string, Feedback[]> = {};
    accepted.forEach((f) => {
      if (!grouped[f.page_url]) grouped[f.page_url] = [];
      grouped[f.page_url].push(f);
    });

    let prompt = `On continue — WorkDays corrections UAT.\n\n`;
    prompt += `${accepted.length} feedback(s) accepté(s) à traiter :\n\n`;

    Object.entries(grouped).forEach(([page, items]) => {
      prompt += `## Page: ${page}\n`;
      items.forEach((f, i) => {
        prompt += `${i + 1}. [${f.feedback_type.toUpperCase()}] ${f.message}`;
        if (f.reviewer_notes) prompt += `\n   → Note dev: ${f.reviewer_notes}`;
        prompt += `\n`;
      });
      prompt += `\n`;
    });

    prompt += `\nFichiers à NE PAS toucher :\n- (aucune restriction pour cette session)\n`;
    prompt += `\nContexte : phase UAT, l'utilisateur teste l'application. Corriger/implémenter les points ci-dessus.\n`;

    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  const filtered = feedbacks.filter((f) => {
    if (filterStatus && f.status !== filterStatus) return false;
    if (filterType && f.feedback_type !== filterType) return false;
    return true;
  });

  const countByStatus = (s: string) => feedbacks.filter((f) => f.status === s).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Feedbacks utilisateur</h1>
          <p className="text-slate-500 text-sm">{feedbacks.length} feedback(s) total — {countByStatus("new")} nouveau(x), {countByStatus("accepted")} accepté(s)</p>
        </div>
        <button
          onClick={generatePrompt}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copié !" : "Générer prompt"}
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus("")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filterStatus ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          Tous ({feedbacks.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s.id} onClick={() => setFilterStatus(filterStatus === s.id ? "" : s.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === s.id ? "bg-slate-900 text-white" : s.color + " hover:opacity-80"}`}>
            {s.label} ({countByStatus(s.id)})
          </button>
        ))}
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-1.5 rounded-full text-xs border border-slate-200 focus:outline-none">
          <option value="">Tous types</option>
          <option value="bug">Bug</option>
          <option value="suggestion">Suggestion</option>
          <option value="question">Question</option>
        </select>
      </div>

      {/* Feedback list */}
      {loading ? (
        <div className="p-12 text-center"><div className="animate-spin w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-slate-500">Aucun feedback {filterStatus ? `avec statut "${filterStatus}"` : ""}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const Icon = TYPE_ICONS[f.feedback_type] || Lightbulb;
            const statusOpt = STATUS_OPTIONS.find((s) => s.id === f.status);
            return (
              <div key={f.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${f.feedback_type === "bug" ? "text-red-500" : f.feedback_type === "question" ? "text-blue-500" : "text-amber-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusOpt?.color || "bg-slate-100"}`}>{statusOpt?.label || f.status}</span>
                      <span className="text-xs text-slate-400 font-mono">{f.page_url}</span>
                      <span className="text-xs text-slate-400 ml-auto">{new Date(f.created_at).toLocaleString("fr-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-slate-800">{f.message}</p>
                    {/* Notes input */}
                    <input
                      type="text"
                      placeholder="Note dev (contexte, précision)..."
                      defaultValue={f.reviewer_notes || ""}
                      onBlur={(e) => { if (e.target.value !== (f.reviewer_notes || "")) updateNotes(f.id, e.target.value); }}
                      className="mt-2 w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateStatus(f.id, "accepted")} title="Accepter" className={`p-1.5 rounded transition-colors ${f.status === "accepted" ? "bg-green-100 text-green-700" : "hover:bg-green-50 text-slate-400"}`}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateStatus(f.id, "rejected")} title="Rejeter" className={`p-1.5 rounded transition-colors ${f.status === "rejected" ? "bg-red-100 text-red-700" : "hover:bg-red-50 text-slate-400"}`}>
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteFeedback(f.id)} title="Supprimer" className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
