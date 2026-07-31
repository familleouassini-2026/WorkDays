"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Shield,
  Calendar,
  Gavel,
  FileText,
  ArrowRight,
  Users,
  Clock,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface Meeting {
  id: number;
  meeting_date: string;
  description: string | null;
  type: string;
}

interface Decision {
  id: number;
  description: string;
  decision_date: string | null;
}

interface Request {
  id: number;
  description: string;
  request_date: string;
  status: string;
  requestor_id: number;
  employees: { first_name: string; last_name: string } | null;
}

// ============================================================
// COMPONENT
// ============================================================

export default function GovernancePage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [meetRes, decRes, reqRes] = await Promise.all([
        supabase
          .from("meetings")
          .select("id, meeting_date, description, type")
          .order("meeting_date", { ascending: false })
          .limit(5),
        supabase
          .from("decisions")
          .select("id, description, decision_date")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("requests")
          .select("id, description, request_date, status, requestor_id, employees(first_name, last_name)")
          .order("request_date", { ascending: false })
          .limit(5),
      ]);
      if (meetRes.data) setMeetings(meetRes.data as Meeting[]);
      if (decRes.data) setDecisions(decRes.data as Decision[]);
      if (reqRes.data) setRequests(reqRes.data as unknown as Request[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "PENDING").length;

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-800",
    ACCEPTED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-slate-100 text-slate-800",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    ACCEPTED: "Acceptee",
    REJECTED: "Refusee",
    IN_PROGRESS: "En cours",
    COMPLETED: "Terminee",
  };

  const meetingTypeLabels: Record<string, string> = {
    CA: "Conseil d'Administration",
    AG: "Assemblee Generale",
    ADHOC: "Ad Hoc",
    CE: "Comite d'Entreprise",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gouvernance</h1>
        <p className="text-slate-500 mt-1">
          Reunions, decisions et demandes du personnel
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/governance/meetings"
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {meetings.length > 0 ? meetings.length + "+" : "0"}
                </p>
                <p className="text-sm text-slate-600">Reunions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/governance/decisions"
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-purple-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {decisions.length > 0 ? decisions.length + "+" : "0"}
                </p>
                <p className="text-sm text-slate-600">Decisions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/governance/requests"
          className="bg-white rounded-lg border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {pendingRequests > 0 ? pendingRequests : requests.length}
                </p>
                <p className="text-sm text-slate-600">
                  {pendingRequests > 0
                    ? "Demandes en attente"
                    : "Demandes"}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Meetings */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Dernieres reunions
              </h3>
              <Link
                href="/governance/meetings"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {meetings.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500 text-center">
                  Aucune reunion enregistree.
                </p>
              ) : (
                meetings.map((m) => (
                  <div key={m.id} className="px-5 py-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {m.description || "Reunion sans titre"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {meetingTypeLabels[m.type] || m.type}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(m.meeting_date + "T00:00:00").toLocaleDateString(
                          "fr-FR",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Dernieres demandes
              </h3>
              <Link
                href="/governance/requests"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500 text-center">
                  Aucune demande enregistree.
                </p>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="px-5 py-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {r.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {r.employees
                            ? `${r.employees.last_name}, ${r.employees.first_name}`
                            : "Inconnu"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[r.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {statusLabels[r.status] || r.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Decisions */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-purple-600" />
                Dernieres decisions
              </h3>
              <Link
                href="/governance/decisions"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tout →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {decisions.length === 0 ? (
                <p className="px-5 py-6 text-sm text-slate-500 text-center">
                  Aucune decision enregistree.
                </p>
              ) : (
                decisions.map((d) => (
                  <div key={d.id} className="px-5 py-3 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900">
                        {d.description}
                      </p>
                      <span className="text-xs text-slate-500">
                        {d.decision_date
                          ? new Date(
                              d.decision_date + "T00:00:00"
                            ).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Date non definie"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
