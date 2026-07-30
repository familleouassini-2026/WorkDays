import {
  UserX,
  Clock,
  AlertTriangle,
  Users,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

const kpiCards = [
  {
    title: "Absents aujourd'hui",
    value: "3",
    change: "-1 vs hier",
    changeType: "positive" as const,
    icon: UserX,
    color: "bg-red-50 text-red-600",
    iconBg: "bg-red-100",
  },
  {
    title: "Demandes en attente",
    value: "7",
    change: "+2 nouvelles",
    changeType: "neutral" as const,
    icon: Clock,
    color: "bg-amber-50 text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    title: "Alertes salaires",
    value: "2",
    change: "Index à vérifier",
    changeType: "negative" as const,
    icon: AlertTriangle,
    color: "bg-orange-50 text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    title: "Effectif actif",
    value: "48",
    change: "+3 ce mois",
    changeType: "positive" as const,
    icon: Users,
    color: "bg-emerald-50 text-emerald-600",
    iconBg: "bg-emerald-100",
  },
];

export default function DashboardPage() {
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
                <p
                  className={`text-xs mt-2 ${
                    card.changeType === "positive"
                      ? "text-emerald-600"
                      : card.changeType === "negative"
                      ? "text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {card.change}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                <card.icon className={`w-5 h-5 ${card.color.split(" ")[1]}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absences récentes */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Absences récentes
            </h2>
            <CalendarDays className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Marie Dupont",
                reason: "Congé annuel",
                dates: "14-18 juil.",
                status: "Approuvé",
              },
              {
                name: "Jean Martin",
                reason: "Maladie",
                dates: "15 juil.",
                status: "Justifié",
              },
              {
                name: "Sophie Leroy",
                reason: "RTT",
                dates: "16 juil.",
                status: "En attente",
              },
              {
                name: "Pierre Dubois",
                reason: "Congé parental",
                dates: "14-25 juil.",
                status: "Approuvé",
              },
            ].map((absence) => (
              <div
                key={absence.name}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-600">
                      {absence.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {absence.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {absence.reason} &middot; {absence.dates}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    absence.status === "Approuvé"
                      ? "bg-emerald-100 text-emerald-700"
                      : absence.status === "En attente"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {absence.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Événements à venir */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Événements à venir
            </h2>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {[
              {
                title: "Fin de période d'essai",
                detail: "Thomas Bernard - 20 juillet",
                type: "warning",
              },
              {
                title: "Anniversaire de travail",
                detail: "Claire Fontaine - 5 ans le 22 juillet",
                type: "info",
              },
              {
                title: "Échéance contrat CDD",
                detail: "Karim Benali - 31 juillet",
                type: "alert",
              },
              {
                title: "Formation obligatoire",
                detail: "Sécurité incendie - 25 juillet",
                type: "info",
              },
              {
                title: "Indexation salariale",
                detail: "Application prévue le 1er août",
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
