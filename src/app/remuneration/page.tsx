"use client";

import Link from "next/link";
import { BookOpen, TrendingUp, Calculator, AlertTriangle } from "lucide-react";

const tabs = [
  {
    label: "Baremes",
    href: "/remuneration/baremes",
    icon: BookOpen,
    description: "Grilles de remuneration par secteur et anciennete",
  },
  {
    label: "Indexations",
    href: "/remuneration/indexations",
    icon: TrendingUp,
    description: "Historique des coefficients d'indexation salariale",
  },
  {
    label: "Simulateur",
    href: "/remuneration/simulateur",
    icon: Calculator,
    description: "Calculer le salaire indexe d'un employe",
  },
  {
    label: "Alertes augmentation",
    href: "/remuneration/alertes",
    icon: AlertTriangle,
    description: "Employes dont l'anciennete atteint un nouveau palier cette annee",
  },
];

export default function RemunerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Remuneration</h1>
        <p className="text-slate-500 mt-1">
          Baremes, indexation et gestion salariale
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="p-3 bg-slate-100 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
              <tab.icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mt-4">
              {tab.label}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{tab.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
