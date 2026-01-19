"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import clsx from "clsx";

interface Props {
  icon: ReactNode;
  label: string;
  href: string;
  collapsed: boolean;
  active?: boolean;
}

export default function NavItem({
  icon,
  label,
  href,
  collapsed,
  active,
}: Props) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={href}
        className={clsx(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
          "hover:bg-slate-800 hover:text-white",
          active ? "bg-slate-800 text-white" : "text-slate-200",
          collapsed && "justify-center px-0"
        )}
      >
        {icon}
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>

      {/* Tooltip / Popover en modo colapsado */}
      {collapsed && hover && (
        <div
          className="
            absolute left-[76px] top-1/2 -translate-y-1/2
            whitespace-nowrap rounded-md
            bg-slate-900 text-slate-100
            border border-slate-700 shadow-xl
            px-3 py-2 text-sm z-50
          "
        >
          {label}
        </div>
      )}
    </div>
  );
}
