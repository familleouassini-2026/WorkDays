"use client";

import Link from "next/link";
import { BookOpen, TrendingUp, Calculator, AlertTriangle } from "lucide-react";

const cards = [
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
    description: "Employes atteignant un nouveau palier d'anciennete",
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

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="p-3 bg-slate-100 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
              <card.icon className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mt-4">
              {card.label}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
