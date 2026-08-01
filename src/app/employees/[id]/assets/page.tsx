"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Package,
  Car,
  Smartphone,
  Printer,
  Plus,
  UserMinus,
  ArrowLeft,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ---------- TYPES ----------

type AssetType = "VOITURES" | "MOBILES" | "IMPRIMANTES";

interface LeasingAsset {
  id: number;
  type: string;
  plate_number: string | null;
  model: string | null;
  color: string | null;
}

interface EmployeeLeasing {
  id: number;
  employee_id: number;
  leasing_id: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  leasing_assets: LeasingAsset;
}

// ---------- CONFIG ----------

const TYPE_CONFIG: Record<
  AssetType,
  { label: string; icon: typeof Car; color: string }
> = {
  VOITURES: { label: "Vehicule", icon: Car, color: "bg-blue-50 text-blue-600" },
  MOBILES: {
    label: "Telephone",
    icon: Smartphone,
    color: "bg-emerald-50 text-emerald-600",
  },
  IMPRIMANTES: {
    label: "Imprimante",
    icon: Printer,
    color: "bg-purple-50 text-purple-600",
  },
};

// ---------- HELPERS ----------

function formatDate(d: string | null) {
  if (!d) return "\u2014";
  return new Date(d + "T00:00:00").toLocaleDateString("fr-BE");
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ---------- PAGE ----------

export default function EmployeeAssetsPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [employeeName, setEmployeeName] = useState("");
  const [activeAssignments, setActiveAssignments] = useState<EmployeeLeasing[]>(
    []
  );
  const [historyAssignments, setHistoryAssignments] = useState<
    EmployeeLeasing[]
  >([]);
  const [availableAssets, setAvailableAssets] = useState<LeasingAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchData() {
    setLoading(true);

    const [empRes, activeRes, historyRes, allAssetsRes, allActiveAssignRes] =
      await Promise.all([
        supabase
          .from("employees")
          .select("first_name, last_name")
          .eq("id", id)
          .single(),
        supabase
          .from("employee_leasing")
          .select("*, leasing_assets(id, type, plate_number, model, color)")
          .eq("employee_id", id)
          .is("end_date", null),
        supabase
          .from("employee_leasing")
          .select("*, leasing_assets(id, type, plate_number, model, color)")
          .eq("employee_id", id)
          .not("end_date", "is", null)
          .order("end_date", { ascending: false }),
        supabase
          .from("leasing_assets")
          .select("id, type, plate_number, model, color")
          .order("type"),
        supabase
          .from("employee_leasing")
          .select("leasing_id")
          .is("end_date", null),
      ]);

    if (empRes.data) {
      setEmployeeName(`${empRes.data.first_name} ${empRes.data.last_name}`);
    }

    if (activeRes.data) {
      setActiveAssignments(activeRes.data as unknown as EmployeeLeasing[]);
    }

    if (historyRes.data) {
      setHistoryAssignments(historyRes.data as unknown as EmployeeLeasing[]);
    }

    // Compute available assets (not currently assigned to anyone)
    if (allAssetsRes.data && allActiveAssignRes.data) {
      const assignedIds = new Set(
        allActiveAssignRes.data.map((a: { leasing_id: number }) => a.leasing_id)
      );
      const available = allAssetsRes.data.filter(
        (asset) => !assignedIds.has(asset.id)
      );
      setAvailableAssets(available as LeasingAsset[]);
    }

    setLoading(false);
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssetId) return;
    setAssigning(true);

    await supabase.from("employee_leasing").insert({
      employee_id: Number(id),
      leasing_id: Number(selectedAssetId),
      start_date: todayISO(),
    });

    setSelectedAssetId("");
    setAssigning(false);
    fetchData();
  }

  async function handleUnassign(assignmentId: number) {
    if (!window.confirm("Retirer cet actif ?")) return;

    await supabase
      .from("employee_leasing")
      .update({ end_date: todayISO() })
      .eq("id", assignmentId);

    fetchData();
  }

  function getAssetLabel(asset: LeasingAsset): string {
    return asset.plate_number || asset.model || `Actif #${asset.id}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/employees/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Retour a la fiche
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Actifs assignes
            </h1>
            <p className="text-slate-500 mt-1">{employeeName}</p>
          </div>
        </div>
      </div>

      {/* Assign new asset */}
      <form
        onSubmit={handleAssign}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-4"
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Assigner un actif
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Selectionner un actif disponible...</option>
            {availableAssets.map((asset) => {
              const config =
                TYPE_CONFIG[asset.type as AssetType] || TYPE_CONFIG.VOITURES;
              return (
                <option key={asset.id} value={asset.id}>
                  {config.label} - {getAssetLabel(asset)}
                  {asset.color ? ` (${asset.color})` : ""}
                </option>
              );
            })}
          </select>
          <button
            type="submit"
            disabled={!selectedAssetId || assigning}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {assigning ? "Assignation..." : "Assigner"}
          </button>
        </div>
      </form>

      {/* Active assignments */}
      {activeAssignments.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucun actif assigne.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAssignments.map((assignment) => {
            const asset = assignment.leasing_assets;
            const config =
              TYPE_CONFIG[asset.type as AssetType] || TYPE_CONFIG.VOITURES;
            const Icon = config.icon;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {asset.plate_number || asset.model || `Actif #${asset.id}`}
                      </p>
                      {asset.model && asset.plate_number && (
                        <p className="text-xs text-slate-500">{asset.model}</p>
                      )}
                      {asset.color && (
                        <p className="text-xs text-slate-400">{asset.color}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Depuis {formatDate(assignment.start_date)}
                    </span>
                    <button
                      onClick={() => handleUnassign(assignment.id)}
                      title="Retirer"
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History section */}
      {historyAssignments.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Historique ({historyAssignments.length})
            </span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showHistory && (
            <div className="border-t border-slate-100 p-4 space-y-3">
              {historyAssignments.map((assignment) => {
                const asset = assignment.leasing_assets;
                const config =
                  TYPE_CONFIG[asset.type as AssetType] || TYPE_CONFIG.VOITURES;
                const Icon = config.icon;

                return (
                  <div
                    key={assignment.id}
                    className="flex items-center gap-3 opacity-60"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        {asset.plate_number || asset.model || `Actif #${asset.id}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        Du {formatDate(assignment.start_date)} au{" "}
                        {formatDate(assignment.end_date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
