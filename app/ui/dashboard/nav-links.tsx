"use client";

import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CurrencyDollarIcon,
  InboxArrowDownIcon,
  CheckBadgeIcon,
  Cog8ToothIcon,
  FolderIcon,
  UserIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import NavItem from "./NavItem";

export default function NavLinks({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  const links = [
    {
      name: "Home",
      href: "/dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      name: "Deposito",
      href: "/dashboard/deposito",
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
    },
    {
      name: "Recolectar",
      href: "/dashboard/recolectar",
      icon: <InboxArrowDownIcon className="w-5 h-5" />,
    },
    {
      name: "Autorizaciones",
      href: "/dashboard/autorizaciones",
      icon: <CheckBadgeIcon className="w-5 h-5" />,
    },
    {
      name: "Configuracion",
      href: "/dashboard/configuracion",
      icon: <Cog8ToothIcon className="w-5 h-5" />,
    },
    {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: <FolderIcon className="w-5 h-5" />,
    },
    {
      name: "Usuarios",
      href: "/dashboard/usuarios",
      icon: <UserIcon className="w-5 h-5" />,
    },
    {
      name: "Dispositivos",
      href: "/dashboard/dispositivos",
      icon: <CubeIcon className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="mt-3 flex flex-col gap-1 px-2">
      {links.map((l) => (
        <NavItem
          key={l.href}
          icon={l.icon}
          label={l.name}
          href={l.href}
          collapsed={collapsed}
          active={pathname === l.href}
        />
      ))}
    </nav>
  );
}
