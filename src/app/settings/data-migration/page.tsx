"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  Building2,
  CalendarDays,
  DollarSign,
  Timer,
  TrendingUp,
  Car,
  ExternalLink,
} from "lucide-react";

interface ChecklistStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  links: { href: string; label: string }[];
}

const steps: ChecklistStep[] = [
  {
    step: 1,
    title: "Employes",
    description:
      "Mettre a jour les donnees des employes : date de naissance, date d'entree en service, anciennete accordee, augmentations individuelles, coordonnees...",
    icon: <Users className="w-5 h-5" />,
    links: [{ href: "/employees", label: "Liste des employes" }],
  },
  {
    step: 2,
    title: "Horaires",
    description:
      "Configurer l'horaire hebdomadaire de chaque employe (minutes par jour, temps plein de reference)",
    icon: <Clock className="w-5 h-5" />,
    links: [{ href: "/schedules", label: "Horaires" }],
  },
  {
    step: 3,
    title: "Secteurs",
    description:
      "Assigner les employes aux bons secteurs et verifier la configuration des secteurs (RTT, IFIC, bareme)",
    icon: <Building2 className="w-5 h-5" />,
    links: [
      { href: "/settings/sectors", label: "Secteurs" },
      { href: "/employees", label: "Employes → modifier secteur" },
    ],
  },
  {
    step: 4,
    title: "Droits aux conges",
    description:
      "Encoder les droits aux conges par employe pour l'annee en cours (jours CA, heures RTT, etc.)",
    icon: <CalendarDays className="w-5 h-5" />,
    links: [
      { href: "/absences/balances", label: "Soldes conges" },
      { href: "/settings/vacation-policy", label: "Politique conges" },
    ],
  },
  {
    step: 5,
    title: "Baremes salariaux",
    description:
      "Verifier les baremes par secteur (paliers d'anciennete → salaire de base)",
    icon: <DollarSign className="w-5 h-5" />,
    links: [{ href: "/remuneration/baremes", label: "Baremes" }],
  },
  {
    step: 6,
    title: "RTT",
    description:
      "Configurer les paliers RTT par secteur (age → heures par an)",
    icon: <Timer className="w-5 h-5" />,
    links: [{ href: "/settings/rtt-entitlements", label: "Baremes RTT" }],
  },
  {
    step: 7,
    title: "Indexations",
    description:
      "Mettre a jour les indexations generales (organisation) et sectorielles",
    icon: <TrendingUp className="w-5 h-5" />,
    links: [{ href: "/remuneration/indexations", label: "Indexations" }],
  },
  {
    step: 8,
    title: "Actifs / Leasing",
    description:
      "Encoder les actifs (vehicules, telephones...) et les assigner aux employes",
    icon: <Car className="w-5 h-5" />,
    links: [{ href: "/assets", label: "Actifs" }],
  },
];

export default function DataMigrationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mise a jour des donnees
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Checklist des donnees a verifier et completer
          </p>
        </div>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-white border rounded-lg shadow-sm p-5"
          >
            <div className="flex items-start gap-4">
              {/* Step badge + icon */}
              <div className="flex flex-col items-center gap-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {item.step}
                </span>
                <div className="text-slate-400">{item.icon}</div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-base">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {item.description}
                </p>

                {/* Links */}
                <div className="flex flex-wrap gap-3 mt-3">
                  {item.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
