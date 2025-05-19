"use client";
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense, useEffect, useState } from "react";
import { CrearSucursal } from "@/app/ui/sucursales/button";
import SucursalesTable from "@/app/ui/sucursales/table";
import { NuevoPerfil } from "@/app/ui/perfila/button";
import PerfilesTable from "@/app/ui/perfila/table";
import PerfilServiciosTable from "@/app/ui/perfila/table-servicios";
import { FetchSubServiciosAccionTable } from "@/app/lib/servicios-actions";
import PerfilAgenciasTable from "@/app/ui/perfila/table-agencias";
import { FetchAgencias } from "@/app/lib/agencia-actions";
import MessageBox from "@/app/ui/dashboard/MessageBox";

export default function Page({ params }: { params: { id: string } }) {
  const query = "";
  const currentPage = 1;
  const [agencias, setAgencias] = useState<any>();
  const [perfil, tipo] = params.id.split("-");

  useEffect(() => {
    // Obtén las sucursales
    const fetchServicios = async () => {
      try {
        const agencias = await FetchAgencias("", 1);
        setAgencias(agencias);
      } catch (error) {
        console.error("Error al obtener sucursales:", error);
      }
    };

    fetchServicios();
  }, []);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Perfiles</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="buscar perfiles..." />
        <NuevoPerfil />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <PerfilAgenciasTable
          agencias={agencias}
          perfil={Number(perfil)}
          tipo={Number(tipo)}
        />
      </Suspense>
      <MessageBox />
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}
