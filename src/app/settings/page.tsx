import { Settings, Database, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500 mt-1">Configuration de l&apos;application</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Organisation</h3>
          <p className="text-sm text-slate-500 mt-1">Nom, adresse, logo, coordonnées</p>
        </div>
        <Link href="/settings/sectors" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-slate-900">Secteurs & Groupes RTT</h3>
          <p className="text-sm text-slate-500 mt-1">Gérer les secteurs et leurs groupes RTT</p>
        </Link>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Codes d&apos;absence</h3>
          <p className="text-sm text-slate-500 mt-1">Types d&apos;absence, couleurs, unités de temps</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Politique de congés</h3>
          <p className="text-sm text-slate-500 mt-1">Règles d&apos;attribution des congés par ancienneté</p>
        </div>
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Utilisateurs & Rôles</h3>
          <p className="text-sm text-slate-500 mt-1">Gérer les accès et permissions</p>
        </div>
        <Link href="/settings/holidays" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-slate-900">Jours fériés</h3>
          <p className="text-sm text-slate-500 mt-1">Configurer les jours fériés par année</p>
        </Link>
        <Link href="/settings/rtt-entitlements" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <h3 className="font-semibold text-slate-900">Barème RTT</h3>
          <p className="text-sm text-slate-500 mt-1">Heures RTT par tranche d&apos;age et par secteur</p>
        </Link>
        <Link href="/settings/staging-review" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Validation donnees staging</h3>
          </div>
          <p className="text-sm text-slate-500">Reviser et valider les donnees extraites avant import</p>
        </Link>
        <Link href="/settings/data-migration" className="card p-6 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Migration des donnees</h3>
          </div>
          <p className="text-sm text-slate-500">Transferer les donnees staging vers les tables de production</p>
        </Link>
      </div>
    </div>
  );
}
