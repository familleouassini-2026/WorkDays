"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Filter } from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      let url = "/api/notifications?limit=100";
      if (filter === "unread") url += "&is_read=false";
      if (filter === "read") url += "&is_read=true";
      const res = await fetch(url);
      const json = await res.json();
      if (json.data) setNotifications(json.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
    setLoading(false);
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all_read: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  async function markAsRead(id: number) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // Silently fail
    }
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
    </div>
  );
}
