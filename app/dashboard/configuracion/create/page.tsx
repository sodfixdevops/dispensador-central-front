import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";
import PerfilForm from "@/app/ui/perfila/create-form";
import MensajeForm from "@/app/ui/mensajes/create-form";
import ConceptoCabeceraForm from "@/app/ui/configuracion/create-form";

export default async function Page() {
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Configuracion", href: "/dashboard/configuracion" },
          {
            label: "Nuevo Concepto",
            href: "/dashboard/configuracion/create",
            active: true,
          },
        ]}
      />
      <ConceptoCabeceraForm></ConceptoCabeceraForm>
    </main>
  );
}
