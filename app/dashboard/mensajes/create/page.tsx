import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";
import PerfilForm from "@/app/ui/perfila/create-form";
import MensajeForm from "@/app/ui/mensajes/create-form";

export default async function Page() {
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Mensajes", href: "/dashboard/mensajes" },
          {
            label: "Nuevo Mensaje",
            href: "/dashboard/mensajes/create",
            active: true,
          },
        ]}
      />
      <MensajeForm></MensajeForm>
      <ToastContainer />
    </main>
  );
}
