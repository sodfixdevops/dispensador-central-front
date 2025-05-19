import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import ServicioForm from "@/app/ui/servicios/create-form";
import { FetchServicioById } from "@/app/lib/servicios-actions";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const query = "2";
  const currentPage = 1;
  const servicio = await FetchServicioById(Number(id));
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Servicios", href: "/dashboard/servicios" },
          {
            label: "Editar servicio",
            href: `/dashboard/subservicio/${id}/edit`,
            active: true,
          },
        ]}
      />
      <ServicioForm servicio={servicio} />
      <ToastContainer />
    </main>
  );
}
