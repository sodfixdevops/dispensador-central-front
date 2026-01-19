"use client";

import { useSession } from "next-auth/react";
import TableAutorizaciones from "@/app/ui/autorizaciones/TableAutorizaciones";
import { lusitana } from "@/app/ui/fonts";

export default function Page() {
  const { data: session } = useSession();
  const usuario = session?.user?.username || "";

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          AUTORIZAR SOLICITUDES
        </h1>
      </div>

      {/* Usuario */}
      {usuario && (
        <div className="mt-2 inline-block rounded-md bg-purple-600 px-3 py-1 text-sm font-semibold text-white shadow-sm">
          Usuario conectado: {usuario}
        </div>
      )}

      {/* Texto explicativo */}
      <div className="mt-4 text-sm text-gray-700 font-medium">
        Mostrando solicitudes pendientes de autorización
      </div>

      {/* Tabla */}
      <div className="mt-4">
        <TableAutorizaciones usuario={usuario} />
      </div>
    </div>
  );
}
