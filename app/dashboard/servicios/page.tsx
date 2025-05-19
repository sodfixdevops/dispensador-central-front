"use client";
import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/servicios/table";
import { CrearServicio } from "@/app/ui/servicios/buttons";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense, useEffect, useState } from "react";
import { FetchServiciosTable } from "@/app/lib/servicios-actions";
import { ServiciosData } from "@/app/lib/definitions";
import { auth } from "@/auth";

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<any>([]);
  const query = "";
  const currentPage = 1;
  //const session = await auth();

  useEffect(() => {
    // Fetch de cajeros
    async function cargarServicios() {
      const data = await FetchServiciosTable(query, currentPage);
      setServicios(data);
    }
    cargarServicios();
  }, []);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Servicios</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="buscar servicios..." />
        <CrearServicio />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table servicios={servicios} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}
