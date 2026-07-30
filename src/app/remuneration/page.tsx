import { Wallet } from "lucide-react";

export default function RemunerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rémunération</h1>
        <p className="text-slate-500 mt-1">Barèmes, indexation et gestion salariale</p>
      </div>

      <div className="card p-12 text-center">
        <Wallet className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 mt-4">Gestion salariale</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Consultez les barèmes par secteur, l&apos;historique d&apos;indexation et les projections salariales.
        </p>
      </div>
    </div>
  );
}
