import { ArrowRightLeft, Building2, ListChecks, Calendar, Layers } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 mt-1">Configuration de l&apos;application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/settings/organisation" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Organisation</h3>
          </div>
          <p className="text-sm text-slate-500">Nom, adresse, logo, coordonnées</p>
        </Link>
        <Link href="/settings/sectors" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Secteurs</h3>
          </div>
          <p className="text-sm text-slate-500">Gérer les secteurs et leurs paramètres</p>
        </Link>
        <Link href="/settings/absence-codes" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-1">
            <ListChecks className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Codes d&apos;absence</h3>
          </div>
          <p className="text-sm text-slate-500">Types d&apos;absence, couleurs, unités de temps</p>
        </Link>

        <Link href="/settings/holidays" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Jours fériés</h3>
          </div>
          <p className="text-sm text-slate-500">Configurer les jours fériés par année</p>
        </Link>
        <Link href="/settings/rtt-entitlements" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-slate-900">Barème RTT</h3>
          <p className="text-sm text-slate-500 mt-1">Heures RTT par tranche d&apos;âge et par secteur</p>
        </Link>
        <Link href="/settings/data-migration" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Migration des données</h3>
          </div>
          <p className="text-sm text-slate-500">Checklist des données à vérifier et compléter</p>
        </Link>
        <Link href="/settings/feedback" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-slate-900">Feedbacks utilisateur</h3>
          </div>
          <p className="text-sm text-slate-500">Voir, trier et exporter les retours de la phase de test</p>
        </Link>
      </div>
    </div>
  );
}
