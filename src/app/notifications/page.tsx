"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Filter, PlusCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: number;
  employee_id: number | null;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  info: { bg: "bg-blue-100", text: "text-blue-700", label: "Info" },
  warning: { bg: "bg-amber-100", text: "text-amber-700", label: "Alerte" },
  success: { bg: "bg-green-100", text: "text-green-700", label: "Succes" },
  action: { bg: "bg-purple-100", text: "text-purple-700", label: "Action" },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [testEmployees, setTestEmployees] = useState<{ id: number; first_name: string; last_name: string }[]>([]);
  const [testEmpId, setTestEmpId] = useState<number | null>(null);
  const [testSending, setTestSending] = useState(false);

  // Read selected employee from localStorage (same pattern as bell component)
  useEffect(() => {
    const stored = localStorage.getItem("workdays_selected_employee_id");
    if (stored) setEmployeeId(Number(stored));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "workdays_selected_employee_id") {
        setEmployeeId(e.newValue ? Number(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorage);

    const handleCustom = () => {
      const val = localStorage.getItem("workdays_selected_employee_id");
      setEmployeeId(val ? Number(val) : null);
    };
    window.addEventListener("workdays_employee_changed", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("workdays_employee_changed", handleCustom);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, employeeId]);

  // Load employees for the test notification dropdown
  useEffect(() => {
    async function loadTestEmployees() {
      const supabase = createClient();
      const { data } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("is_inactive", false)
        .order("last_name");
      if (data) setTestEmployees(data);
    }
    loadTestEmployees();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      if (filter === "unread") {
        query = query.eq("is_read", false);
      } else if (filter === "read") {
        query = query.eq("is_read", true);
      }
      const { data } = await query;
      if (data) setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
    setLoading(false);
  }

  async function markAllAsRead() {
    try {
      const supabase = createClient();
      let query = supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      await query;
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  async function markAsRead(id: number) {
    try {
      const supabase = createClient();
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silently fail
    }
  }

  async function createTestNotification(global = false) {
    if (!global && !testEmpId) return;
    setTestSending(true);
    try {
      const supabase = createClient();
      await supabase.from("notifications").insert({
        employee_id: global ? null : testEmpId,
        title: global ? "Notification globale de test" : "Notification de test",
        message: global
          ? "Ceci est une notification globale (sans employe) pour verifier le systeme en mode admin."
          : "Ceci est une notification de test creee manuellement pour verifier le systeme.",
        type: "info",
        is_read: false,
      });
      // Refresh the list
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to create test notification:", err);
    }
    setTestSending(false);
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {employeeId
              ? `Mode self-service (employe #${employeeId})`
              : "Mode administrateur (toutes les notifications)"}
            {" — "}
            {unreadCount > 0
              ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
              : "Toutes les notifications sont lues"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? "Toutes" : f === "unread" ? "Non lues" : "Lues"}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-500 mt-4">Aucune notification.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
          {notifications.map((notif) => {
            const typeCfg = TYPE_COLORS[notif.type] || TYPE_COLORS.info;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-4 py-3 hover:bg-slate-50 transition-colors ${
                  !notif.is_read ? "bg-blue-50/40" : ""
                }`}
              >
                {/* Type badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase mt-0.5 shrink-0 ${typeCfg.bg} ${typeCfg.text}`}
                >
                  {typeCfg.label}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      !notif.is_read ? "font-semibold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {notif.title}
                  </p>
                  {notif.message && (
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatDateTime(notif.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir
                    </Link>
                  )}
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                      title="Marquer comme lu"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Test notification section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-slate-500" />
          Creer une notification test
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="w-full sm:w-64">
            <label className="block text-xs text-slate-500 mb-1">Employe (optionnel)</label>
            <select
              value={testEmpId || ""}
              onChange={(e) => setTestEmpId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Notification globale --</option>
              {testEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.last_name} {emp.first_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createTestNotification(false)}
              disabled={!testEmpId || testSending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              Pour cet employe
            </button>
            <button
              onClick={() => createTestNotification(true)}
              disabled={testSending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              Globale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
