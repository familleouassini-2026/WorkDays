"use client";

import { useEffect, useState } from "react";
import { createNotification } from "@/lib/notifications";
import { CheckSquare, Clock, CheckCircle, XCircle, X } from "lucide-react";

interface LeaveRequest {
  id: number;
  employee_id: number;
  absence_code_id: number;
  start_date: string;
  end_date: string;
  total_days: number | null;
  total_minutes: number | null;
  reason: string | null;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  employees: {
    id: number;
    first_name: string;
    last_name: string;
    manager_id: number | null;
  } | null;
  absence_codes: {
    id: number;
    code: string;
    description: string;
    color_hex: string | null;
    time_unit: string;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "En attente", color: "bg-amber-100 text-amber-800", icon: Clock },
  approved: { label: "Approuve", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "Refuse", color: "bg-red-100 text-red-800", icon: XCircle },
  cancelled: { label: "Annule", color: "bg-slate-100 text-slate-600", icon: X },
};

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [processing, setProcessing] = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<LeaveRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Read "logged in" employee from localStorage for approved_by tracking
  const getApproverId = (): number | null => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("workdays_selected_employee_id");
    return stored ? Number(stored) : null;
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/leave-requests${params}`);
      const json = await res.json();
      if (json.data) setRequests(json.data);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
    }
    setLoading(false);
  }

  async function handleApprove(request: LeaveRequest) {
    setProcessing(request.id);
    try {
      const res = await fetch("/api/leave-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          action: "approve",
          approved_by: getApproverId(),
        }),
      });

      if (res.ok) {
        // Notify the employee (non-blocking, log on failure)
        if (request.employees) {
          createNotification({
            employeeId: request.employee_id,
            title: "Demande approuvee",
            message: `Votre demande de conge (${request.absence_codes?.code || ""}) du ${formatDate(request.start_date)} au ${formatDate(request.end_date)} a ete approuvee.`,
            type: "success",
            link: "/self-service",
          }).catch((err) => console.warn("Failed to create approval notification:", err));
        }
        fetchRequests();
      }
    } catch (err) {
      console.error("Approval failed:", err);
    }
    setProcessing(null);
  }

  async function handleReject() {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    try {
      const res = await fetch("/api/leave-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectModal.id,
          action: "reject",
          approved_by: getApproverId(),
          rejection_reason: rejectionReason || null,
        }),
      });

      if (res.ok) {
        // Notify the employee (non-blocking, log on failure)
        if (rejectModal.employees) {
          createNotification({
            employeeId: rejectModal.employee_id,
            title: "Demande refusee",
            message: `Votre demande de conge (${rejectModal.absence_codes?.code || ""}) du ${formatDate(rejectModal.start_date)} au ${formatDate(rejectModal.end_date)} a ete refusee.${rejectionReason ? ` Motif: ${rejectionReason}` : ""}`,
            type: "warning",
            link: "/self-service",
          }).catch((err) => console.warn("Failed to create rejection notification:", err));
        }
        setRejectModal(null);
        setRejectionReason("");
        fetchRequests();
      }
    } catch (err) {
      console.error("Rejection failed:", err);
    }
    setProcessing(null);
  }

  function formatDate(d: string): string {
    return new Date(d).toLocaleDateString("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function daysBetween(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-blue-600" />
          Approbations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerez les demandes de conge en attente d&apos;approbation.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "pending", label: "En attente" },
          { value: "approved", label: "Approuvees" },
          { value: "rejected", label: "Refusees" },
          { value: "", label: "Toutes" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune demande trouvee.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map((req) => {
            const statusCfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={req.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {req.employees
                        ? `${req.employees.last_name} ${req.employees.first_name}`
                        : `Employe #${req.employee_id}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Soumise le {formatDate(req.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Details */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {req.absence_codes?.color_hex && (
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: req.absence_codes.color_hex }}
                      />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      {req.absence_codes
                        ? `${req.absence_codes.code} - ${req.absence_codes.description}`
                        : "—"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Du <span className="font-medium">{formatDate(req.start_date)}</span> au{" "}
                    <span className="font-medium">{formatDate(req.end_date)}</span>
                    <span className="text-slate-400 ml-2">
                      ({daysBetween(req.start_date, req.end_date)} jours calendrier)
                    </span>
                  </p>
                  {req.total_days && (
                    <p className="text-xs text-slate-500">
                      Jours ouvrables: {req.total_days}
                    </p>
                  )}
                  {req.reason && (
                    <p className="text-xs text-slate-500 italic">
                      Motif: {req.reason}
                    </p>
                  )}
                  {req.rejection_reason && (
                    <p className="text-xs text-red-600 font-medium">
                      Motif du refus: {req.rejection_reason}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={processing === req.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {processing === req.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => setRejectModal(req)}
                      disabled={processing === req.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRejectModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Refuser la demande
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Demande de{" "}
              <span className="font-medium">
                {rejectModal.employees
                  ? `${rejectModal.employees.first_name} ${rejectModal.employees.last_name}`
                  : `#${rejectModal.employee_id}`}
              </span>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Motif du refus (optionnel)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={processing === rejectModal.id}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
