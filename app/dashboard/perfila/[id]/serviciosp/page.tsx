"use client";
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense, use, useEffect, useState } from "react";
import { CrearSucursal } from "@/app/ui/sucursales/button";
import SucursalesTable from "@/app/ui/sucursales/table";
import { NuevoPerfil } from "@/app/ui/perfila/button";
import PerfilesTable from "@/app/ui/perfila/table";
import PerfilServiciosTable from "@/app/ui/perfila/table-servicios";
import {
  FetchServiciosTable,
  FetchSubServiciosAccionTable,
  FetchSubServiciosTable,
} from "@/app/lib/servicios-actions";
import { ToastContainer } from "react-toastify";
import MessageBox from "@/app/ui/dashboard/MessageBox";
import TableServiciosHead from "@/app/ui/perfila/table-serv-head";

export default function Page({ params }: { params: { id: string } }) {
  const query = "";
  const currentPage = 1;
  const [perfil, tipo] = params.id.split("-");
  const [idServicioSelected, setIdServicioSelected] = useState(0);
  const [servicios, setServicios] = useState<any>();
  const [Subservicios, setSubServicios] = useState<any>();
  //let servicios = await FetchSubServiciosAccionTable();
  //const servicios_head = await FetchServiciosTable("", 1);

  const handleServicioSelected = async (idServicio: number) => {
    //setSelectedServicioId(idServicio);
    const subservicios = await FetchSubServiciosTable(idServicio);
    setSubServicios(subservicios);
    setIdServicioSelected(idServicio);
  };

  useEffect(() => {
    // Obtén las sucursales
    const fetchServicios = async () => {
      try {
        const servicios_head = await FetchServiciosTable("", 1);
        setServicios(servicios_head);
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
      <div className="flex flex-col md:flex-row gap-4">
        <Suspense
          key={query + currentPage}
          fallback={<InvoicesTableSkeleton />}
        >
          <div className="w-full md:w-1/2">
            <TableServiciosHead
              servicios={servicios}
              perfil={Number(perfil)}
              onRowClick={handleServicioSelected}
            />
          </div>
        </Suspense>
        <Suspense key={2} fallback={<InvoicesTableSkeleton />}>
          <div className="w-full md:w-1/2">
            <PerfilServiciosTable
              servicios={Subservicios}
              perfil={Number(perfil)}
              tipo={Number(tipo)}
              servicio={idServicioSelected}
            />
          </div>
        </Suspense>
      </div>

      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
      <MessageBox />
      <ToastContainer />
    </div>
  );
}
