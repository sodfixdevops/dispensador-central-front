import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";
import PerfilForm from "@/app/ui/perfila/create-form";

export default async function Page() {
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Perfiles", href: "/dashboard/perfila" },
          {
            label: "Nuevo Perfil",
            href: "/dashboard/perfila/create",
            active: true,
          },
        ]}
      />
      <PerfilForm />
      <ToastContainer />
    </main>
  );
}
