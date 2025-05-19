import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import ServicioForm from "@/app/ui/servicios/create-form";
import { FetchServicioById } from "@/app/lib/servicios-actions";

export default async function Page({
  params,
}: {
  params: { id: number; subid: number };
}) {
  const id = params.subid;
  const subservicio = await FetchServicioById(params.subid);
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Subservicios",
            href: `/dashboard/servicios/${params.id}/subservicios`,
          },
          {
            label: "Modificar Subservicio",
            href: `/dashboard/servicios/${params.id}/subservicios/${params.subid}/edit`,
            active: true,
          },
        ]}
      />
      <ServicioForm servicio={subservicio} idServicio={params.subid} />
      <ToastContainer />
    </main>
  );
}
