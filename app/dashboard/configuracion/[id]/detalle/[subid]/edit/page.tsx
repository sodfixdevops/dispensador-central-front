import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers } from "@/app/lib/data";
import CreateFormServicio from "@/app/ui/servicios/create-form";
import ServicioForm from "@/app/ui/servicios/create-form";
import { ToastContainer } from "react-toastify";
import PerfilForm from "@/app/ui/perfila/create-form";
import MensajeForm from "@/app/ui/mensajes/create-form";
import ConceptoCabeceraForm from "@/app/ui/configuracion/create-form";
import ConceptoDetalleForm from "@/app/ui/configuracion/create-detalle-form";
import { FetchConceptosByUnique } from "@/app/lib/conceptos-actions";

export default async function Page({
  params,
}: {
  params: { id: number; subid: number };
}) {
  //const customers = await fetchCustomers();
  const pref = params.id;
  const corr = params.subid;
  const concepto = await FetchConceptosByUnique(pref, corr);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          {
            label: "Configuracion",
            href: `/dashboard/configuracion/`,
          },
          {
            label: "Detalle Concepto",
            href: `/dashboard/configuracion/${pref}/detalle/`,
            active: false,
          },
          {
            label: "Modificar Detalle",
            href: `/dashboard/configuracion/${pref}/detalle/${corr}/edit`,
            active: true,
          },
        ]}
      />
      <ConceptoDetalleForm prefijo={pref} concepto={concepto!} />
    </main>
  );
}
