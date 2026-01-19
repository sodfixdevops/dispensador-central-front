"use client";

import { useState } from "react";
import NavLinks from "@/app/ui/dashboard/nav-links";
import { signOut } from "next-auth/react";
import {
  PowerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <aside
      className={`flex h-full flex-col bg-slate-950 text-slate-200 border-r border-slate-800
      transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-wide">
            Dispensador
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1 hover:bg-slate-800"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <ChevronLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Links */}
      <NavLinks collapsed={collapsed} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sign Out */}
      <div className="px-2 pb-3">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
            border border-slate-800 hover:bg-red-950 hover:border-red-700 hover:text-red-200
            ${collapsed ? "justify-center px-0" : ""}
          `}
          title="Cerrar sesión"
        >
          <PowerIcon className="w-5 h-5" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
