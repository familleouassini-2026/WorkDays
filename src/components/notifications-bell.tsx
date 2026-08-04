"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
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

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-green-500",
  action: "bg-purple-500",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-BE", { day: "2-digit", month: "2-digit" });
}

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read selected employee from localStorage (set by self-service page)
    const stored = localStorage.getItem("workdays_selected_employee_id");
    if (stored) setEmployeeId(Number(stored));

    // Listen for changes to the selected employee
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "workdays_selected_employee_id") {
        setEmployeeId(e.newValue ? Number(e.newValue) : null);
      }
    };
    window.addEventListener("storage", handleStorage);

    // Also listen for custom event (same-tab updates)
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
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function fetchNotifications() {
    try {
      const supabase = createClient();
      let query = supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }
      const { data } = await query;
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch {
      // Silently fail - notifications are not critical
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
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4.5 h-4.5 min-w-[18px] px-1 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-slate-200 shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notif.is_read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                    if (notif.link) {
                      setOpen(false);
                      window.location.href = notif.link;
                    }
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        TYPE_COLORS[notif.type] || TYPE_COLORS.info
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-tight ${
                          !notif.is_read ? "font-semibold text-slate-900" : "text-slate-700"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Voir tout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
