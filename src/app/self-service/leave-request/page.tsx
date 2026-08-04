"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/notifications";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  manager_id: number | null;
}

interface AbsenceCode {
  id: number;
  code: string;
  description: string;
  color_hex: string | null;
  time_unit: string;
}

export default function LeaveRequestPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [codes, setCodes] = useState<AbsenceCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [absenceCodeId, setAbsenceCodeId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const [empRes, codeRes] = await Promise.all([
        supabase
          .from("employees")
          .select("id, first_name, last_name, manager_id")
          .eq("is_inactive", false)
          .order("last_name"),
        supabase
          .from("absence_codes")
          .select("id, code, description, color_hex, time_unit")
          .order("sort_order")
          .order("code"),
      ]);
      if (empRes.data) setEmployees(empRes.data);
      if (codeRes.data) setCodes(codeRes.data);
      setLoading(false);
    }
    init();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId || !absenceCodeId || !startDate || !endDate) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          absence_code_id: Number(absenceCodeId),
          start_date: startDate,
          end_date: endDate,
          reason: reason || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Leave request creation failed:", data.error);
        setSubmitting(false);
        return;
      }

      // Notify the manager (fire-and-forget, non-blocking)
      const employee = employees.find((emp) => emp.id === employeeId);
      if (employee?.manager_id) {
        const code = codes.find((c) => String(c.id) === absenceCodeId);
        createNotification({
          employeeId: employee.manager_id,
          title: "Nouvelle demande de conge",
          message: `${employee.first_name} ${employee.last_name} demande un conge (${code?.code || ""}) du ${startDate} au ${endDate}.`,
          type: "action",
          link: "/absences/approvals",
        }).catch((err) => console.warn("Notification failed (non-blocking):", err));
      }

      setSuccess(true);
    } catch (err) {
      console.error("Leave request error:", err);
    }

    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-green-800">Demande envoyee</h2>
          <p className="text-sm text-green-600 mt-2">
            Votre demande de conge a ete soumise avec succes. Vous serez notifie de la decision.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link
              href="/self-service"
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Retour au portail
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setAbsenceCodeId("");
                setStartDate("");
                setEndDate("");
                setReason("");
              }}
              className="px-4 py-2 rounded-lg border border-green-300 text-green-700 text-sm font-medium hover:bg-green-50"
            >
              Nouvelle demande
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/self-service"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Demander un conge</h1>
          <p className="text-sm text-slate-500">
            Soumettez une demande qui sera envoyee a votre responsable pour approbation.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Employee */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Employe
          </label>
          <select
            value={employeeId || ""}
            onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : null)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Selectionner --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.last_name} {emp.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Absence code */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Type d&apos;absence
          </label>
          <select
            value={absenceCodeId}
            onChange={(e) => setAbsenceCodeId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Selectionner --</option>
            {codes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.description}
              </option>
            ))}
          </select>
        </div>

        {/* Start date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date debut
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              min={startDate}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Motif <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Indiquez un motif si necessaire..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !employeeId || !absenceCodeId || !startDate || !endDate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Soumettre la demande
            </>
          )}
        </button>
      </form>
    </div>
  );
}
