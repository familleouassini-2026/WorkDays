"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  UserX,
  Users,
  CalendarDays,
} from "lucide-react";

interface RecentAbsence {
  id: number;
  absence_date: string;
  employee_id: number;
  employees: { first_name: string; last_name: string } | null;
  absence_codes: { code: string; description: string } | null;
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
          .eq("absence_date", todayStr),
        supabase
          .from("year_calendar")
          .select("id", { count: "exact", head: true })
          .gte("absence_date", monthStart)
          .lte("absence_date", monthEnd),
        supabase
          .from("year_calendar")
          .select("id, absence_date, employee_id, employees!employee_id(first_name, last_name), absence_codes!absence_code_id(code, description)")
          .order("absence_date", { ascending: false })
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
      href: "/absences",
    },
    {
      title: "Absences ce mois",
      value: absencesMonth,
      icon: CalendarDays,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      href: "/absences",
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
            {kpiCards.map((card) => (
              <Link key={card.title} href={card.href}>
                <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
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
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Link href="/employees" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir le personnel &rarr;
            </Link>
            <Link href="/absences" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Voir les absences &rarr;
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
              <>
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
                          <Link
                            href={`/employees/${absence.employee_id}`}
                            className="text-sm font-medium text-slate-900 hover:text-blue-600"
                          >
                            {absence.employees
                              ? `${absence.employees.last_name}, ${absence.employees.first_name}`
                              : "Inconnu"}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {absence.absence_codes?.code} - {absence.absence_codes?.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(absence.absence_date + "T00:00:00").toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Link href="/absences" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Voir toutes les absences &rarr;
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
