import { Settings } from "lucide-react";

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
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Secteurs & Groupes RTT</h3>
          <p className="text-sm text-slate-500 mt-1">Gérer les secteurs et leurs groupes RTT</p>
        </div>
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
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900">Jours fériés</h3>
          <p className="text-sm text-slate-500 mt-1">Configurer les jours fériés par année</p>
        </div>
      </div>
    </div>
  );
}
