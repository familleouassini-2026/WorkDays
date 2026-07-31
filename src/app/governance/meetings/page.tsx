"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
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
  agenda: string | null;
  type: string;
  attendees: Employee[];
}

type MeetingType = "CA" | "AG" | "ADHOC" | "CE";

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: "CA", label: "Conseil d'Administration" },
  { value: "AG", label: "Assemblee Generale" },
  { value: "ADHOC", label: "Ad Hoc" },
  { value: "CE", label: "Comite d'Entreprise" },
];

// ============================================================
// COMPONENT
// ============================================================

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<MeetingType>("CA");
  const [formDescription, setFormDescription] = useState("");
  const [formAgenda, setFormAgenda] = useState("");
  const [formAttendees, setFormAttendees] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = createClient();

    const [meetRes, empRes] = await Promise.all([
      supabase
        .from("meetings")
        .select("id, meeting_date, description, agenda, type")
        .order("meeting_date", { ascending: false }),
      supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("is_inactive", false)
        .order("last_name"),
    ]);

    if (empRes.data) setEmployees(empRes.data);

    if (meetRes.data) {
      // Fetch attendees for all meetings
      const meetingIds = meetRes.data.map((m) => m.id);
      const { data: attendeesData } = await supabase
        .from("meeting_attendees")
        .select("meeting_id, employee_id, employees(id, first_name, last_name)")
        .in("meeting_id", meetingIds.length > 0 ? meetingIds : [0]);

      const attendeesByMeeting = new Map<number, Employee[]>();
      if (attendeesData) {
        for (const a of attendeesData as any[]) {
          if (!attendeesByMeeting.has(a.meeting_id)) {
            attendeesByMeeting.set(a.meeting_id, []);
          }
          if (a.employees) {
            attendeesByMeeting.get(a.meeting_id)!.push(a.employees);
          }
        }
      }

      const enriched: Meeting[] = meetRes.data.map((m) => ({
        ...m,
        attendees: attendeesByMeeting.get(m.id) || [],
      }));
      setMeetings(enriched);
    }

    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formDate || !formDescription) return;
    setSaving(true);

    const supabase = createClient();

    // Insert meeting
    const { data: newMeeting, error } = await supabase
      .from("meetings")
      .insert({
        meeting_date: formDate,
        type: formType,
        description: formDescription,
        agenda: formAgenda || null,
      })
      .select("id")
      .single();

    if (error || !newMeeting) {
      alert("Erreur lors de la creation: " + (error?.message || ""));
      setSaving(false);
      return;
    }

    // Insert attendees
    if (formAttendees.length > 0) {
      await supabase.from("meeting_attendees").insert(
        formAttendees.map((empId) => ({
          meeting_id: newMeeting.id,
          employee_id: empId,
        }))
      );
    }

    // Reset form & refresh
    setFormDate("");
    setFormType("CA");
    setFormDescription("");
    setFormAgenda("");
    setFormAttendees([]);
    setShowForm(false);
    setSaving(false);
    fetchData();
  }

  function toggleAttendee(empId: number) {
    setFormAttendees((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  }

  const typeLabel = (type: string) =>
    MEETING_TYPES.find((t) => t.value === type)?.label || type;

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
            <h1 className="text-2xl font-bold text-slate-900">Reunions</h1>
            <p className="text-slate-500 mt-0.5 text-sm">
              {meetings.length} reunion{meetings.length > 1 ? "s" : ""}{" "}
              enregistree{meetings.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle reunion
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-blue-200 shadow-sm p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            Creer une reunion
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Type *
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as MeetingType)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                required
                placeholder="Ex: Reunion CA mensuelle"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Ordre du jour
            </label>
            <textarea
              value={formAgenda}
              onChange={(e) => setFormAgenda(e.target.value)}
              rows={3}
              placeholder="Points a discuter..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Participants ({formAttendees.length} selectionne
              {formAttendees.length > 1 ? "s" : ""})
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md bg-slate-50">
              {employees.map((emp) => {
                const isSelected = formAttendees.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => toggleAttendee(emp.id)}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white"
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
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Creer la reunion"}
            </button>
          </div>
        </form>
      )}

      {/* Meetings list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune reunion enregistree.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              {/* Meeting row */}
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === meeting.id ? null : meeting.id
                  )
                }
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      {meeting.description || "Reunion sans titre"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {typeLabel(meeting.type)} —{" "}
                      {new Date(
                        meeting.meeting_date + "T00:00:00"
                      ).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {meeting.attendees.length}
                  </span>
                  {expandedId === meeting.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === meeting.id && (
                <div className="border-t border-slate-200 px-5 py-4 bg-slate-50 space-y-3">
                  {meeting.agenda && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                        Ordre du jour
                      </p>
                      <div
                        className="text-sm text-slate-700 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: meeting.agenda }}
                      />
                    </div>
                  )}
                  {meeting.attendees.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                        Participants ({meeting.attendees.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {meeting.attendees.map((att) => (
                          <span
                            key={att.id}
                            className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs text-slate-700"
                          >
                            {att.last_name}, {att.first_name}
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
