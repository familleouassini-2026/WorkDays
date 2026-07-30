import { Clock } from "lucide-react";

export default function SchedulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Horaires</h1>
        <p className="text-slate-500 mt-1">Gestion des horaires hebdomadaires et du temps de travail</p>
      </div>

      <div className="card p-12 text-center">
        <Clock className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 mt-4">Horaires de travail</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Gérez les horaires hebdomadaires, le pourcentage de temps plein et les catégories de travail.
        </p>
      </div>
    </div>
  );
}
