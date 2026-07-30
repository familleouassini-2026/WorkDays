import { Package } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Actifs</h1>
        <p className="text-slate-500 mt-1">Gestion des véhicules, téléphones et imprimantes</p>
      </div>

      <div className="card p-12 text-center">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-medium text-slate-700 mt-4">Gestion des actifs</h3>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Attribuez et suivez les véhicules de société, téléphones mobiles et autres équipements.
        </p>
      </div>
    </div>
  );
}
