import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import SucursalForm from "@/app/ui/sucursales/create-form";
import { ToastContainer } from "react-toastify";

export default async function Page() {
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Sucursales", href: "/dashboard/sucursales" },
          {
            label: "Nueva Sucursal",
            href: "/dashboard/sucursales/create",
            active: true,
          },
        ]}
      />
      <SucursalForm />
      <ToastContainer />
    </main>
  );
}
