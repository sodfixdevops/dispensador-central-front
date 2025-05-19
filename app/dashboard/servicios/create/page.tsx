import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";

export default async function Page() {
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Servicios", href: "/dashboard/servicios" },
          {
            label: "Nuevo Servicio",
            href: "/dashboard/servicios/create",
            active: true,
          },
        ]}
      />
      <ServicioForm />
      <ToastContainer />
    </main>
  );
}
