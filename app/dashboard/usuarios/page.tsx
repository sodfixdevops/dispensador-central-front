import { Suspense } from "react";
import Search from "@/app/ui/search";
import Table from "@/app/ui/usuarios/table";
import { CreateBoton } from "@/app/ui/componentes/button";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query ?? "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Acceso de Usuarios</h1>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar usuarios..." />
        <CreateBoton
          Texto="Nuevo Usuario"
          Direccion="/dashboard/usuarios/create"
        />
      </div>

      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
