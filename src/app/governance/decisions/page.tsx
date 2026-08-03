"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Gavel,
  Plus,
  Users,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  LinkIcon,
  Pencil,
  Trash2,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
}

interface Meeting {
  id: number;
  meeting_date: string;
  description: string | null;
  type: string;
}

interface Request {
  id: number;
  description: string;
  request_date: string;
}

interface Decision {
  id: number;
  description: string;
  decision_date: string | null;
  meeting_id: number | null;
  request_id: number | null;
  meeting: Meeting | null;
  request: Request | null;
  makers: Employee[];
}

// ============================================================
// COMPONENT
// ============================================================

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formMeetingId, setFormMeetingId] = useState<string>("");
  const [formRequestId, setFormRequestId] = useState<string>("");
  const [formMakers, setFormMakers] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();

    const [decRes, empRes, meetRes, reqRes] = await Promise.all([
      supabase
        .from("decisions")
        .select("id, description, decision_date, meeting_id, request_id, meetings(id, meeting_date, description, type), requests(id, description, request_date)")
        .order("created_at", { ascending: false }),
      supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("is_inactive", false)
        .order("last_name"),
      supabase
        .from("meetings")
        .select("id, meeting_date, description, type")
        .order("meeting_date", { ascending: false }),
      supabase
        .from("requests")
        .select("id, description, request_date")
        .order("request_date", { ascending: false }),
    ]);

    if (empRes.data) setEmployees(empRes.data);
    if (meetRes.data) setMeetings(meetRes.data as Meeting[]);
    if (reqRes.data) setRequests(reqRes.data as Request[]);

    if (decRes.data) {
      const decisionIds = decRes.data.map((d) => d.id);
      const { data: makersData } = await supabase
        .from("decision_makers")
        .select("decision_id, employee_id, employees(id, first_name, last_name)")
        .in("decision_id", decisionIds.length > 0 ? decisionIds : [0]);

      const makersByDecision = new Map<number, Employee[]>();
      if (makersData) {
        for (const m of makersData as any[]) {
          if (!makersByDecision.has(m.decision_id)) {
            makersByDecision.set(m.decision_id, []);
          }
          if (m.employees) {
            makersByDecision.get(m.decision_id)!.push(m.employees);
          }
        }
      }

      const enriched: Decision[] = decRes.data.map((d: any) => ({
        id: d.id,
        description: d.description,
        decision_date: d.decision_date,
        meeting_id: d.meeting_id,
        request_id: d.request_id,
        meeting: d.meetings || null,
        request: d.requests || null,
        makers: makersByDecision.get(d.id) || [],
      }));
      setDecisions(enriched);
    }

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formDescription) return;
    setSaving(true);

    const supabase = createClient();

    if (editingId) {
      // Update existing decision
      const { error } = await supabase
        .from("decisions")
        .update({
          description: formDescription,
          decision_date: formDate || null,
          meeting_id: formMeetingId ? Number(formMeetingId) : null,
          request_id: formRequestId ? Number(formRequestId) : null,
        })
        .eq("id", editingId);

      if (error) {
        alert("Erreur: " + error.message);
        setSaving(false);
        return;
      }

      // Replace makers
      await supabase.from("decision_makers").delete().eq("decision_id", editingId);
      if (formMakers.length > 0) {
        await supabase.from("decision_makers").insert(
          formMakers.map((empId) => ({
            decision_id: editingId,
            employee_id: empId,
          }))
        );
      }
    } else {
      // Create new decision
      const { data: newDecision, error } = await supabase
        .from("decisions")
        .insert({
          description: formDescription,
          decision_date: formDate || null,
          meeting_id: formMeetingId ? Number(formMeetingId) : null,
          request_id: formRequestId ? Number(formRequestId) : null,
        })
        .select("id")
        .single();

      if (error || !newDecision) {
        alert("Erreur: " + (error?.message || ""));
        setSaving(false);
        return;
      }

      if (formMakers.length > 0) {
        await supabase.from("decision_makers").insert(
          formMakers.map((empId) => ({
            decision_id: newDecision.id,
            employee_id: empId,
          }))
        );
      }
    }

    // Reset
    resetForm();
    setSaving(false);
    fetchData();
  }

  function startEdit(dec: Decision) {
    setEditingId(dec.id);
    setFormDescription(dec.description);
    setFormDate(dec.decision_date || "");
    setFormMeetingId(dec.meeting_id?.toString() || "");
    setFormRequestId(dec.request_id?.toString() || "");
    setFormMakers(dec.makers.map((m) => m.id));
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setFormDescription("");
    setFormDate("");
    setFormMeetingId("");
    setFormRequestId("");
    setFormMakers([]);
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette decision ?\n\nCette action est irreversible.")) return;
    const supabase = createClient();
    await supabase.from("decision_makers").delete().eq("decision_id", id);
    await supabase.from("decisions").delete().eq("id", id);
    fetchData();
  }

  function toggleMaker(empId: number) {
    setFormMakers((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-900">Decisions</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              {decisions.length} decision{decisions.length > 1 ? "s" : ""}{" "}
              enregistree{decisions.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle decision
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-purple-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {editingId ? "Modifier la decision" : "Enregistrer une decision"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                required
                placeholder="Ex: Engagement d'un kine"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date de decision
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Liee a une reunion
              </label>
              <select
                value={formMeetingId}
                onChange={(e) => setFormMeetingId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="">Aucune</option>
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.description || "Reunion"} ({new Date(m.meeting_date + "T00:00:00").toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Liee a une demande
              </label>
              <select
                value={formRequestId}
                onChange={(e) => setFormRequestId(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="">Aucune</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.description} ({new Date(r.request_date + "T00:00:00").toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Decideurs ({formMakers.length} selectionne
              {formMakers.length > 1 ? "s" : ""})
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
              {employees.map((emp) => {
                const isSelected = formMakers.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleMaker(emp.id)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-purple-600 text-white"
                        : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {emp.last_name}, {emp.first_name}
                    {isSelected && <X className="w-3 h-3 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Creer la decision"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : decisions.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Gavel className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune decision enregistree.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {decisions.map((dec) => (
            <div
              key={dec.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === dec.id ? null : dec.id)
                }
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      {dec.description}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {dec.decision_date && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(dec.decision_date + "T00:00:00").toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {dec.meeting && (
                        <span className="text-xs text-blue-600 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Reunion
                        </span>
                      )}
                      {dec.request && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Demande
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {dec.makers.length}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(dec); }}
                    className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(dec.id); }}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedId === dec.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedId === dec.id && (
                <div className="border-t border-slate-200 px-5 py-4 bg-slate-50 space-y-3">
                  {dec.meeting && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-700">
                        Reunion :{" "}
                        <strong>{dec.meeting.description}</strong> (
                        {new Date(dec.meeting.meeting_date + "T00:00:00").toLocaleDateString("fr-FR")})
                      </span>
                    </div>
                  )}
                  {dec.request && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-slate-700">
                        Demande :{" "}
                        <strong>{dec.request.description}</strong> (
                        {new Date(dec.request.request_date + "T00:00:00").toLocaleDateString("fr-FR")})
                      </span>
                    </div>
                  )}
                  {dec.makers.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                        Decideurs ({dec.makers.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {dec.makers.map((maker) => (
                          <span
                            key={maker.id}
                            className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs text-slate-700"
                          >
                            {maker.last_name}, {maker.first_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
