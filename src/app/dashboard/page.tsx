"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UserX,
  Clock,
  CalendarCheck,
  Users,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface RecentAbsence {
  id: string;
  absence_date: string;
  employee: {
    first_name: string;
    last_name: string;
  };
  absence_code: {
    code: string;
    description: string;
    color_hex: string;
  };
}

interface DashboardData {
  activeEmployees: number;
  todayAbsences: number;
  pendingRequests: number;
  monthAbsences: number;
  recentAbsences: RecentAbsence[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient();

      // Use local date formatting to avoid timezone shift
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const startOfMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;

      // Fetch all data in parallel
      const [
        activeEmployeesResult,
        todayAbsencesResult,
        pendingRequestsResult,
        monthAbsencesResult,
        recentAbsencesResult,
      ] = await Promise.all([
        // Count active employees
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("is_inactive", false),

        // Count today's absences
        supabase
          .from("year_calendar")
          .select("id", { count: "exact", head: true })
          .eq("absence_date", today),

        // Count pending requests
        supabase
          .from("holiday_selections")
          .select("id", { count: "exact", head: true })
          .eq("status", "PENDING"),

        // Count this month's absences
        supabase
          .from("year_calendar")
          .select("id", { count: "exact", head: true })
          .gte("absence_date", startOfMonth)
          .lte("absence_date", today),

        // Fetch recent absences with employee and absence code info
        supabase
          .from("year_calendar")
          .select(
            `
            id,
            absence_date,
            employee:employees(first_name, last_name),
            absence_code:absence_codes(code, description, color_hex)
          `
          )
          .order("absence_date", { ascending: false })
          .limit(5),
      ]);

      setData({
        activeEmployees: activeEmployeesResult.count ?? 0,
        todayAbsences: todayAbsencesResult.count ?? 0,
        pendingRequests: pendingRequestsResult.count ?? 0,
        monthAbsences: monthAbsencesResult.count ?? 0,
        recentAbsences: (recentAbsencesResult.data as unknown as RecentAbsence[]) ?? [],
      });
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  const kpiCards = [
    {
      title: "Effectif actif",
      value: data?.activeEmployees ?? 0,
      subtitle: "Employes actifs",
      icon: Users,
      color: "text-emerald-600",
      iconBg: "bg-emerald-100",
    },
    {
      title: "Absents aujourd'hui",
      value: data?.todayAbsences ?? 0,
      subtitle: format(new Date(), "d MMMM yyyy", { locale: fr }),
      icon: UserX,
      color: "text-red-600",
      iconBg: "bg-red-100",
    },
    {
      title: "Demandes en attente",
      value: data?.pendingRequests ?? 0,
      subtitle: "A traiter",
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-100",
    },
    {
      title: "Absences ce mois",
      value: data?.monthAbsences ?? 0,
      subtitle: format(new Date(), "MMMM yyyy", { locale: fr }),
      icon: CalendarCheck,
      color: "text-blue-600",
      iconBg: "bg-blue-100",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">
            Vue d&apos;ensemble de la gestion du personnel
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-500 mt-4">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div key={card.title} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
                <p className="text-xs mt-2 text-slate-500">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absences recentes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Absences recentes
            </h2>
            <CalendarDays className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {data?.recentAbsences && data.recentAbsences.length > 0 ? (
              data.recentAbsences.map((absence) => {
                const employeeName = absence.employee
                  ? `${absence.employee.first_name} ${absence.employee.last_name}`
                  : "Inconnu";
                const initials = absence.employee
                  ? `${absence.employee.first_name?.[0] ?? ""}${absence.employee.last_name?.[0] ?? ""}`
                  : "?";
                const reason = absence.absence_code?.description ?? "Absence";
                const dateFormatted = absence.absence_date
                  ? format(new Date(absence.absence_date), "d MMM yyyy", {
                      locale: fr,
                    })
                  : "";
                const colorHex = absence.absence_code?.color_hex;

                return (
                  <div
                    key={absence.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-slate-600">
                          {initials}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {employeeName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {reason} &middot; {dateFormatted}
                        </p>
                      </div>
                    </div>
                    {colorHex && (
                      <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: colorHex }}
                        title={absence.absence_code?.code}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                Aucune absence recente
              </p>
            )}
          </div>
        </div>

        {/* Evenements a venir */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Evenements a venir
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Donnees d&apos;exemple
              </span>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              {
                title: "Fin de periode d'essai",
                detail: "Thomas Bernard - 20 juillet",
                type: "warning",
              },
              {
                title: "Anniversaire de travail",
                detail: "Claire Fontaine - 5 ans le 22 juillet",
                type: "info",
              },
              {
                title: "Echeance contrat CDD",
                detail: "Karim Benali - 31 juillet",
                type: "alert",
              },
              {
                title: "Formation obligatoire",
                detail: "Securite incendie - 25 juillet",
                type: "info",
              },
              {
                title: "Indexation salariale",
                detail: "Application prevue le 1er aout",
                type: "warning",
              },
            ].map((event) => (
              <div
                key={event.title}
                className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    event.type === "alert"
                      ? "bg-red-500"
                      : event.type === "warning"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
