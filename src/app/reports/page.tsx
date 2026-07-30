import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rapports</h1>
        <p className="text-slate-500 mt-1">Rapports d&apos;absences, de salaires et statistiques</p>
      </div>

      <div className="card p-12 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 mt-4">Centre de rapports</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Générez des rapports d&apos;absences par employé, des statistiques trimestrielles et des projections salariales. Export en PDF et Excel.
        </p>
      </div>
    </div>
  );
}
