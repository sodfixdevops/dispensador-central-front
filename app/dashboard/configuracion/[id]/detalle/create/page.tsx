import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";
import PerfilForm from "@/app/ui/perfila/create-form";
import MensajeForm from "@/app/ui/mensajes/create-form";
import ConceptoCabeceraForm from "@/app/ui/configuracion/create-form";
import ConceptoDetalleForm from "@/app/ui/configuracion/create-detalle-form";

export default async function Page({ params }: { params: { id: number } }) {
  //const customers = await fetchCustomers();
  const id = params.id;
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Configuracion",
            href: `/dashboard/configuracion/`,
          },
          {
            label: "Detalle Concepto",
            href: `/dashboard/configuracion/${id}/detalle/`,
            active: false,
          },
          {
            label: "Nuevo Detalle",
            href: `/dashboard/configuracion/${id}/detalle/create`,
            active: true,
          },
        ]}
      />
      <ConceptoDetalleForm prefijo={id} />
    </main>
  );
}
