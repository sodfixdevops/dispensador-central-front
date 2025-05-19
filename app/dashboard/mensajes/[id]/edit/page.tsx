import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";
import PerfilForm from "@/app/ui/perfila/create-form";
import MensajeForm from "@/app/ui/mensajes/create-form";
import { FetchConceptosByUnique } from "@/app/lib/conceptos-actions";

export default async function Page({ params }: { params: { id: string } }) {
  //const customers = await fetchCustomers();
  const id = params.id;
  const concepto = await FetchConceptosByUnique(2, Number(id));
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Mensajes", href: "/dashboard/mensajes" },
          {
            label: "Editar Mensaje",
            href: `/dashboard/mensajes/${id}/edit`,
            active: true,
          },
        ]}
      />
      <MensajeForm mensaje={concepto!}></MensajeForm>
      <ToastContainer />
    </main>
  );
}
