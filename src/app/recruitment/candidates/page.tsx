"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, Filter, Star, Plus } from "lucide-react";

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

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpening, setFilterOpening] = useState<string>(openingFilter || "all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (openingFilter) setFilterOpening(openingFilter);
  }, [openingFilter]);

  async function loadData() {
    const supabase = createClient();
    const [candidatesRes, openingsRes] = await Promise.all([
      supabase.from("candidates").select("id, job_opening_id, first_name, last_name, email, status, rating, created_at").order("created_at", { ascending: false }),
      supabase.from("job_openings").select("id, title").order("title"),
    ]);
    if (candidatesRes.data) setCandidates(candidatesRes.data);
    if (openingsRes.data) setOpenings(openingsRes.data);
    setLoading(false);
  }

  const openingMap = new Map(openings.map((o) => [o.id, o.title]));

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
      </div>

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
