"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserX, Users, CalendarDays, AlertTriangle, Shield, Clock, Gavel } from "lucide-react";
import { ABSENTEEISM_EXCLUDED_CODES, getAbsenteeismAlertLevel } from "@/lib/calculations";

interface RecentAbsence { id: number; absence_date: string; employee_id: number; employees: { first_name: string; last_name: string } | null; absence_codes: { code: string; description: string } | null; }
interface Meeting { id: number; meeting_date: string; description: string | null; type: string; }
interface AbsenteeismAlert { employeeName: string; incidents: number; level: "warning" | "danger"; }

export default function DashboardPage() {
  const [activeEmployees, setActiveEmployees] = useState<number>(0);
  const [absencesToday, setAbsencesToday] = useState<number>(0);
  const [absencesMonth, setAbsencesMonth] = useState<number>(0);
  const [recentAbsences, setRecentAbsences] = useState<RecentAbsence[]>([]);
  const [absenteeismAlerts, setAbsenteeismAlerts] = useState<AbsenteeismAlert[]>([]);
  const [nextMeetings, setNextMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const supabase = createClient();
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const windowStart = new Date(now); windowStart.setMonth(windowStart.getMonth() - 6);
      const windowStartStr = windowStart.toISOString().split("T")[0];

      const [empRes, todayRes, monthRes, recentRes, meetRes, codesRes, calendarRes, empListRes] = await Promise.all([
        supabase.from("employees").select("id", { count: "exact", head: true }).eq("is_inactive", false),
        supabase.from("year_calendar").select("id", { count: "exact", head: true }).eq("absence_date", todayStr),
        supabase.from("year_calendar").select("id", { count: "exact", head: true }).gte("absence_date", monthStart).lte("absence_date", monthEnd),
        supabase.from("year_calendar").select("id, absence_date, employee_id, employees(first_name, last_name), absence_codes(code, description)").order("absence_date", { ascending: false }).limit(5),
        supabase.from("meetings").select("id, meeting_date, description, type").gte("meeting_date", todayStr).order("meeting_date").limit(3),
        supabase.from("absence_codes").select("id, code"),
        supabase.from("year_calendar").select("employee_id, absence_code_id, absence_date").gte("absence_date", windowStartStr).lte("absence_date", todayStr),
        supabase.from("employees").select("id, first_name, last_name").eq("is_inactive", false),
      ]);

      setActiveEmployees(empRes.count || 0);
      setAbsencesToday(todayRes.count || 0);
      setAbsencesMonth(monthRes.count || 0);
      if (recentRes.data) setRecentAbsences(recentRes.data as unknown as RecentAbsence[]);
      if (meetRes.data) setNextMeetings(meetRes.data as Meeting[]);

      // Calculate absenteeism alerts
      if (calendarRes.data && codesRes.data && empListRes.data) {
        const codes = codesRes.data as { id: number; code: string }[];
        const excludedIds = new Set(codes.filter((c) => ABSENTEEISM_EXCLUDED_CODES.includes(c.code)).map((c) => c.id));
        const relevant = (calendarRes.data as any[]).filter((e) => !excludedIds.has(e.absence_code_id));
        const byEmployee = new Map<number, Set<string>>();
        for (const entry of relevant) {
          if (!byEmployee.has(entry.employee_id)) byEmployee.set(entry.employee_id, new Set());
          byEmployee.get(entry.employee_id)!.add(entry.absence_date);
        }
        const alerts: AbsenteeismAlert[] = [];
        const empMap = new Map((empListRes.data as any[]).map((e) => [e.id, `${e.last_name}, ${e.first_name}`]));
        byEmployee.forEach((dates, empId) => {
          const incidents = dates.size;
          const { level } = getAbsenteeismAlertLevel(incidents);
          if (level !== "ok") {
            alerts.push({ employeeName: empMap.get(empId) || "?", incidents, level });
          }
        });
        alerts.sort((a, b) => b.incidents - a.incidents);
        setAbsenteeismAlerts(alerts);
      }

      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const kpiCards = [
    { title: "Employes actifs", value: activeEmployees, icon: Users, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", href: "/employees" },
    { title: "Absents aujourd'hui", value: absencesToday, icon: UserX, iconBg: "bg-red-100", iconColor: "text-red-600", href: "/absences" },
    { title: "Absences ce mois", value: absencesMonth, icon: CalendarDays, iconBg: "bg-blue-100", iconColor: "text-blue-600", href: "/absences" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-1">Vue d&apos;ensemble de la gestion du personnel</p>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" /><p className="text-slate-500 mt-4">Chargement...</p></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpiCards.map((card) => (
              <Link key={card.title} href={card.href}>
                <div className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${card.iconBg}`}><card.icon className={`w-5 h-5 ${card.iconColor}`} /></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Absenteeism Alerts */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Alertes absenteisme</h2>
                <Link href="/absences/absenteeism" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Voir detail →</Link>
              </div>
              {absenteeismAlerts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3"><Shield className="w-4 h-4" />Aucune alerte — tous les employes sont dans les seuils normaux.</div>
              ) : (
                <div className="space-y-2">
                  {absenteeismAlerts.map((alert, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-lg p-3 ${alert.level === "danger" ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
                      <span className="text-sm font-medium text-slate-900">{alert.employeeName}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${alert.level === "danger" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{alert.incidents} incident{alert.incidents > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Meetings */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Gavel className="w-4 h-4 text-purple-600" />Prochaines reunions</h2>
                <Link href="/governance/meetings" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Voir tout →</Link>
              </div>
              {nextMeetings.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune reunion planifiee.</p>
              ) : (
                <div className="space-y-2">
                  {nextMeetings.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{m.description || "Reunion"}</p>
                        <p className="text-xs text-slate-500">{m.type}</p>
                      </div>
                      <span className="text-xs text-slate-600 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(m.meeting_date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent absences */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-blue-600" />Dernieres absences</h2>
              <Link href="/absences" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Voir tout →</Link>
            </div>
            {recentAbsences.length === 0 ? (
              <p className="text-slate-500 text-sm">Aucune absence enregistree.</p>
            ) : (
              <div className="space-y-3">
                {recentAbsences.map((absence) => (
                  <div key={absence.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center"><span className="text-xs font-medium text-slate-600">{absence.employees ? `${absence.employees.first_name[0]}${absence.employees.last_name[0]}` : "?"}</span></div>
                      <div>
                        <Link href={`/employees/${absence.employee_id}`} className="text-sm font-medium text-slate-900 hover:text-blue-600">{absence.employees ? `${absence.employees.last_name}, ${absence.employees.first_name}` : "Inconnu"}</Link>
                        <p className="text-xs text-slate-500">{absence.absence_codes?.code} - {absence.absence_codes?.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(absence.absence_date + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
