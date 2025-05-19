import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { CrearSubServicio } from "@/app/ui/servicios/buttons";
import SubservicioTable from "@/app/ui/servicios/subservicio-table";

export default async function SubserviciosPage({
  params,
}: {
  params: { id: number };
}) {
  const query = "";
  const currentPage = 1;
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Subservicios</h1>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 md:mt-8 ">
        <CrearSubServicio id={params.id} />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <SubservicioTable id={params.id} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
      <ToastContainer />
    </div>
  );
}
