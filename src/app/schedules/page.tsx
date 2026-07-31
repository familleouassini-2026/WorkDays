"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, Calculator } from "lucide-react";
import Link from "next/link";

interface TimesheetRow {
  id: number;
  is_active: boolean;
  monday_minutes: number | null;
  tuesday_minutes: number | null;
  wednesday_minutes: number | null;
  thursday_minutes: number | null;
  friday_minutes: number | null;
  saturday_minutes: number | null;
  sunday_minutes: number | null;
  full_time_minutes: number;
  employees: { id: number; first_name: string; last_name: string; job_title: string | null } | null;
}

function minutesToHM(m: number | null) {
  if (m === null || m === undefined) return "—";
  if (m === 0) return "0h00";
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h}h${min.toString().padStart(2, "0")}`;
}

export default function SchedulesPage() {
  const [timesheets, setTimesheets] = useState<TimesheetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase
        .from("timesheets")
        .select("*, employees(id, first_name, last_name, job_title)")
        .eq("is_active", true)
        .order("id");

      if (data) setTimesheets(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Horaires</h1>
          <p className="text-slate-500 mt-1">
            Horaires hebdomadaires des employés ({timesheets.length} horaire{timesheets.length > 1 ? "s" : ""} actif{timesheets.length > 1 ? "s" : ""})
          </p>
        </div>
        <Link
          href="/schedules/rtt"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          Calcul RTT
        </Link>
      </div>

      {timesheets.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun horaire défini.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Employé</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Lun</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Mar</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Mer</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Jeu</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Ven</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Sam</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Dim</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500 uppercase">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timesheets.map((ts) => {
                const total =
                  (ts.monday_minutes || 0) +
                  (ts.tuesday_minutes || 0) +
                  (ts.wednesday_minutes || 0) +
                  (ts.thursday_minutes || 0) +
                  (ts.friday_minutes || 0) +
                  (ts.saturday_minutes || 0) +
                  (ts.sunday_minutes || 0);
                const pct = Math.round((total / ts.full_time_minutes) * 100);

                return (
                  <tr key={ts.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">
                        {ts.employees?.last_name}, {ts.employees?.first_name}
                      </p>
                      <p className="text-xs text-slate-500">{ts.employees?.job_title || "—"}</p>
                    </td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.monday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.tuesday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.wednesday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.thursday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.friday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.saturday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm text-slate-700">{minutesToHM(ts.sunday_minutes)}</td>
                    <td className="text-center px-3 py-3 text-sm font-semibold text-slate-900">{minutesToHM(total)}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${pct === 100 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {pct}%
                      </span>
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
