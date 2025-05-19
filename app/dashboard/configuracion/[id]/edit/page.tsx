import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import ConceptoCabeceraForm from "@/app/ui/configuracion/create-form";
import { FetchConceptosByUnique } from "@/app/lib/conceptos-actions";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const concepto = await FetchConceptosByUnique(Number(id), 0);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Configuracion", href: "/dashboard/configuracion" },
          {
            label: "Editar Concepto",
            href: `/dashboard/configuracion/${id}/edit`,
            active: true,
          },
        ]}
      />
      <ConceptoCabeceraForm
        concepto={concepto!}
        prefijo={Number(id)}
        correlativo={0}
      />
      <ToastContainer />
    </main>
  );
}
