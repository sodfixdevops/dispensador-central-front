import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import UsuarioForm from "@/app/ui/usuarios/create-form";

export default async function Page() {
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Usuarios", href: "/dashboard/usuarios" },
          {
            label: "Nuevo Usuario",
            href: "/dashboard/usuarios/create",
            active: true,
          },
        ]}
      />
      <UsuarioForm />
      <ToastContainer />
    </main>
  );
}
