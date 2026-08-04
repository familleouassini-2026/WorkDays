"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, CalendarDays, LayoutDashboard, Users, Clock, Wallet, Package, Shield, BarChart3, Settings, UserCircle, UserPlus } from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Personnel", href: "/employees", icon: Users },
  { name: "Absences & Congés", href: "/absences", icon: CalendarDays },
  { name: "Horaires", href: "/schedules", icon: Clock },
  { name: "Rémunération", href: "/remuneration", icon: Wallet },
  { name: "Actifs", href: "/assets", icon: Package },
  { name: "Recrutement", href: "/recruitment", icon: UserPlus },
  { name: "Journal interne", href: "/governance", icon: Shield },
  { name: "Rapports", href: "/reports", icon: BarChart3 },
  { name: "Self-service", href: "/self-service", icon: UserCircle },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}>
        {/* Logo + close button */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">WorkDays</h1>
              <p className="text-xs text-slate-400">Gestion RH Belgique</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-slate-400 truncate">admin@workdays.be</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
