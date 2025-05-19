import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import ServicioForm from "@/app/ui/servicios/create-form";

export default async function Page({ params }: { params: { id: number } }) {
  const id = params.id;
  //const customers = await fetchCustomers();
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Sub-servicios",
            href: `/dashboard/servicios/subservicio/${id}/create`,
          },
          {
            label: "Nuevo Sub-servicio",
            href: "/dashboard/servicios/create",
            active: true,
          },
        ]}
      />
      <ServicioForm idServicio={id} />
    </main>
  );
}
