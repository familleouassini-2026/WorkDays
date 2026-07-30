import { Shield } from "lucide-react";

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gouvernance</h1>
        <p className="text-slate-500 mt-1">Réunions, décisions et demandes</p>
      </div>

      <div className="card p-12 text-center">
        <Shield className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 mt-4">Gouvernance</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Gérez les réunions du CA, les décisions prises, les demandes du personnel et le suivi des changements.
        </p>
      </div>
    </div>
  );
}
