"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Briefcase, Users, UserCheck, Plus, MapPin, Building2 } from "lucide-react";

interface JobOpening {
  id: number;
  title: string;
  sector_id: number | null;
  location_id: number | null;
  contract_type: string | null;
  status: string;
  created_at: string;
  sector_name?: string;
  location_name?: string;
  candidate_count?: number;
}

interface Sector {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  filled: "bg-blue-100 text-blue-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  filled: "Pourvu",
  cancelled: "Annule",
};

export default function RecruitmentDashboard() {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCount, setOpenCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [hiredThisMonth, setHiredThisMonth] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();

    const [openingsRes, sectorsRes, locationsRes, candidatesRes] = await Promise.all([
      supabase.from("job_openings").select("*").order("created_at", { ascending: false }),
      supabase.from("sectors").select("id, name"),
      supabase.from("locations").select("id, name"),
      supabase.from("candidates").select("id, job_opening_id, status, created_at"),
    ]);

    const sectors: Sector[] = sectorsRes.data || [];
    const locations: Location[] = locationsRes.data || [];
    const candidates = candidatesRes.data || [];

    const sectorMap = new Map(sectors.map((s) => [s.id, s.name]));
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));

    const enriched: JobOpening[] = (openingsRes.data || []).map((o: any) => ({
      ...o,
      sector_name: o.sector_id ? sectorMap.get(o.sector_id) : undefined,
      location_name: o.location_id ? locationMap.get(o.location_id) : undefined,
      candidate_count: candidates.filter((c) => c.job_opening_id === o.id).length,
    }));

    setOpenings(enriched);
    setOpenCount(enriched.filter((o) => o.status === "open").length);

    // Active candidates = not hired/rejected
    setActiveCount(
      candidates.filter((c) => !["hired", "rejected"].includes(c.status)).length
    );

    // Hired this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    setHiredThisMonth(
      candidates.filter(
        (c) => c.status === "hired" && c.created_at >= firstOfMonth
      ).length
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const openOpenings = openings.filter((o) => o.status === "open");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recrutement</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Gestion des postes ouverts et des candidatures
          </p>
        </div>
        <Link
          href="/recruitment/openings"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau poste
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{openCount}</p>
              <p className="text-xs text-slate-500">Postes ouverts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              <p className="text-xs text-slate-500">Candidatures en cours</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{hiredThisMonth}</p>
              <p className="text-xs text-slate-500">Embauch&eacute;s ce mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex gap-3">
        <Link
          href="/recruitment/openings"
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Tous les postes
        </Link>
        <Link
          href="/recruitment/candidates"
          className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          Tous les candidats
        </Link>
      </div>

      {/* Open positions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Postes ouverts ({openOpenings.length})
        </h2>
        {openOpenings.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500 mt-3">Aucun poste ouvert pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openOpenings.map((opening) => (
              <Link
                key={opening.id}
                href={`/recruitment/candidates?opening=${opening.id}`}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {opening.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[opening.status]}`}
                  >
                    {STATUS_LABELS[opening.status]}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {opening.sector_name && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {opening.sector_name}
                    </p>
                  )}
                  {opening.location_name && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {opening.location_name}
                    </p>
                  )}
                  {opening.contract_type && (
                    <p className="text-xs text-slate-500">{opening.contract_type}</p>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600 font-medium">
                    {opening.candidate_count} candidat{(opening.candidate_count || 0) > 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
