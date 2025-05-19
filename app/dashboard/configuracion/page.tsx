import Pagination from "@/app/ui/invoices/pagination";
import Search from "@/app/ui/search";
import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { CrearConcepto } from "@/app/ui/configuracion/Button";
import ConceptoCabeceraTable from "@/app/ui/configuracion/Table";

export default async function Page() {
  const query = "";
  const currentPage = 1;
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Configuracion</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="buscar sucursales..." />
        <CrearConcepto />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <ConceptoCabeceraTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
    </div>
  );
}
