"use client";

import {
  CircleStackIcon,
  HomeIcon,
  EyeIcon,
  CurrencyDollarIcon,
  FolderIcon,
  CubeIcon,
  UserIcon,
  MapPinIcon,
  EnvelopeIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import React from "react";
// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  {
    name: "Servicios",
    href: "/dashboard/servicios",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Sucursales",
    href: "/dashboard/sucursales",
    icon: CubeIcon,
  },
  {
    name: "Agencia",
    href: "/dashboard/agencias",
    icon: MapPinIcon,
  },
  {
    name: "Perfil Agencia",
    href: "/dashboard/perfila",
    icon: CircleStackIcon,
  },
  {
    name: "Mensajes",
    href: "/dashboard/mensajes",
    icon: EnvelopeIcon,
  },
  {
    name: "Videos",
    href: "/dashboard/videos",
    icon: EnvelopeIcon,
  },
  {
    name: "Monitor",
    href: "/dashboard/monitor",
    icon: EyeIcon,
  },
  {
    name: "Usuarios",
    href: "/dashboard/usuarios",
    icon: UserIcon,
  },
  {
    name: "Reportes",
    href: "/dashboard/reportes",
    icon: FolderIcon,
  },
  {
    name: "Configuracion",
    href: "/dashboard/configuracion",
    icon: Cog8ToothIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[38px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-2 text-xs font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
