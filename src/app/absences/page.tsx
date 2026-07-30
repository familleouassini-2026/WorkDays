import { CalendarDays } from "lucide-react";

export default function AbsencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Absences & Congés</h1>
        <p className="text-slate-500 mt-1">Calendrier des absences et gestion des congés</p>
      </div>

      <div className="card p-12 text-center">
        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 mt-4">Calendrier des absences</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Le module de gestion des absences et congés sera disponible prochainement.
          Vous pourrez réserver des absences, consulter les soldes et gérer les approbations.
        </p>
      </div>
    </div>
  );
}
