import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { Suspense } from "react";
import { ToastContainer } from "react-toastify";
import { CrearSubServicio } from "@/app/ui/servicios/buttons";
import SubservicioTable from "@/app/ui/servicios/subservicio-table";
import ConceptoDetalleTable from "@/app/ui/configuracion/DetalleTable";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { CrearConceptoDetalle } from "@/app/ui/configuracion/Button";

export default async function ConceptoDetallePage({
  params,
}: {
  params: { id: number };
}) {
  const query = "";
  const currentPage = 1;
  return (
    <div className="w-full">
      <Breadcrumbs
        breadcrumbs={[
          { label: "Configuracion", href: "/dashboard/configuracion" },
          {
            label: "Detalle Concepto",
            href: `/dashboard/configuracion/${params.id}/detalle`,
            active: true,
          },
        ]}
      />
      <div className="mt-4 flex items-center justify-end gap-2 md:mt-8 ">
        <CrearConceptoDetalle prefijo={params.id} />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <ConceptoDetalleTable prefijo={params.id} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        {/* <Pagination totalPages={totalPages} /> */}
      </div>
      <ToastContainer />
    </div>
  );
}
