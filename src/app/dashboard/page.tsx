"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  UserX,
  Users,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

interface RecentAbsence {
  id: number;
  date: string;
  employee_id: number;
  employees: { first_name: string; last_name: string } | null;
  absence_codes: { code: string; label: string } | null;
}

export default function DashboardPage() {
  const [activeEmployees, setActiveEmployees] = useState<number>(0);
  const [absencesToday, setAbsencesToday] = useState<number>(0);
  const [absencesMonth, setAbsencesMonth] = useState<number>(0);
  const [recentAbsences, setRecentAbsences] = useState<RecentAbsence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = createClient();

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const [empRes, todayRes, monthRes, recentRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("is_inactive", false),
        supabase
          .from("year_calendar")
          .select("id", { count: "exact", head: true })
          .eq("date", todayStr),
        supabase
          .from("year_calendar")
          .select("id", { count: "exact", head: true })
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase
          .from("year_calendar")
          .select("id, date, employee_id, employees(first_name, last_name), absence_codes(code, label)")
          .order("date", { ascending: false })
          .limit(5),
      ]);

      setActiveEmployees(empRes.count || 0);
      setAbsencesToday(todayRes.count || 0);
      setAbsencesMonth(monthRes.count || 0);
      if (recentRes.data) setRecentAbsences(recentRes.data as unknown as RecentAbsence[]);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const kpiCards = [
    {
      title: "Employes actifs",
      value: activeEmployees,
      icon: Users,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      href: "/employees",
    },
    {
      title: "Absents aujourd'hui",
      value: absencesToday,
      icon: UserX,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      href: null,
    },
    {
      title: "Absences ce mois",
      value: absencesMonth,
      icon: CalendarDays,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">
          Vue d&apos;ensemble de la gestion du personnel
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-slate-500 mt-4">Chargement...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpiCards.map((card) => {
              const content = (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.iconBg}`}>
                    <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              );

              if (card.href) {
                return (
                  <Link key={card.title} href={card.href} className="card p-5 hover:shadow-md transition-shadow">
                    {content}
                  </Link>
                );
              }

              return (
                <div key={card.title} className="card p-5">
                  {content}
                </div>
              );
            })}
          </div>

          {/* Link to personnel */}
          <div className="flex justify-end">
            <Link href="/employees" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              Voir le personnel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Recent absences */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Dernieres absences
              </h2>
              <CalendarDays className="w-5 h-5 text-slate-400" />
            </div>
            {recentAbsences.length === 0 ? (
              <p className="text-slate-500 text-sm">Aucune absence enregistree.</p>
            ) : (
              <div className="space-y-3">
                {recentAbsences.map((absence) => (
                  <div
                    key={absence.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">
                          {absence.employees
                            ? `${absence.employees.first_name[0]}${absence.employees.last_name[0]}`
                            : "?"}
                        </span>
                      </div>
                      <div>
                        {absence.employees ? (
                          <Link
                            href={`/employees/${absence.employee_id}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {absence.employees.last_name}, {absence.employees.first_name}
                          </Link>
                        ) : (
                          <p className="text-sm font-medium text-slate-900">Inconnu</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {absence.absence_codes?.code} - {absence.absence_codes?.label}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(absence.date + "T00:00:00").toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Link to all absences */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href="/absences" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                Voir toutes les absences <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
