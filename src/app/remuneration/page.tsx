"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, TableProperties, TrendingUp, Calculator } from "lucide-react";

const tabs = [
  { label: "Baremes", href: "/remuneration/baremes", icon: TableProperties },
  { label: "Indexations", href: "/remuneration/indexations", icon: TrendingUp },
  { label: "Simulateur", href: "/remuneration/simulateur", icon: Calculator },
];

export default function RemunerationPage() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Remuneration</h1>
        <p className="text-slate-500 mt-1">
          Baremes, indexation et gestion salariale
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Default content - overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/remuneration/baremes"
          className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <TableProperties className="w-10 h-10 text-blue-500 mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">Baremes</h3>
          <p className="text-sm text-slate-500 mt-1">
            Consultez les echelles salariales par secteur et anciennete.
          </p>
        </Link>

        <Link
          href="/remuneration/indexations"
          className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <TrendingUp className="w-10 h-10 text-green-500 mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">Indexations</h3>
          <p className="text-sm text-slate-500 mt-1">
            Historique des indexations et facteur cumulatif actuel.
          </p>
        </Link>

        <Link
          href="/remuneration/simulateur"
          className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <Calculator className="w-10 h-10 text-purple-500 mb-3" />
          <h3 className="text-lg font-semibold text-slate-900">Simulateur</h3>
          <p className="text-sm text-slate-500 mt-1">
            Calculez le salaire indexe pour un employe donne.
          </p>
        </Link>
      </div>
    </div>
  );
}
