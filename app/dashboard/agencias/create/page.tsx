"use client";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import AgenciaForm from "@/app/ui/agencias/create-form";
import { FetchSucursales, fetchSucursales } from "@/app/lib/agencia-actions";
import { useState, useEffect } from "react";
import { AgenData } from "@/app/lib/definitions";

export default function Page() {
  const [sucursales, setSucursales] = useState<AgenData[]>([]);
  useEffect(() => {
    // Fetch de cajeros
    async function cargarSucursales() {
      const data = await FetchSucursales("", 0);
      setSucursales(data);
    }
    cargarSucursales();
  }, []);
  //const sucursales = await FetchSucursales("", 0);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Agencias", href: "/dashboard/sucursales" },
          {
            label: "Nueva Sucursal",
            href: "/dashboard/sucursales/create",
            active: true,
          },
        ]}
      />
      <AgenciaForm sucursales={sucursales} />
    </main>
  );
}
