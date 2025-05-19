import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import SucursalForm from "@/app/ui/sucursales/create-form";
import { FetchSucursalById } from "@/app/lib/agencia-actions";

export default async function Page({ params }: { params: { id: number } }) {
  const id = params.id;
  const query = "2";
  const currentPage = 1;
  const sucursal = await FetchSucursalById(Number(id));
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Sucursales", href: "/dashboard/sucursales" },
          {
            label: "Editar sucursal",
            href: `/dashboard/sucursales/${id}/edit`,
            active: true,
          },
        ]}
      />
      <SucursalForm sucursal={sucursal} idAgencia={id} />
      <ToastContainer />
    </main>
  );
}
