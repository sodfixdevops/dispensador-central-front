"use client";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import AgenciaForm from "@/app/ui/agencias/create-form";
import {
  FetchSucursalById,
  FetchSucursales,
  fetchSucursales,
} from "@/app/lib/agencia-actions";
import { useState, useEffect } from "react";
import { AgenData } from "@/app/lib/definitions";
import MessageBox from "@/app/ui/dashboard/MessageBox";

export default function Page({ params }: { params: { id: number } }) {
  const [sucursales, setSucursales] = useState<AgenData[]>([]);
  const [agencia, setAgencia] = useState<AgenData>();
  useEffect(() => {
    // Fetch de cajeros
    async function cargarSucursales() {
      const data = await FetchSucursales("", 0);
      setSucursales(data);
    }

    async function cargarAgencia() {
      const data = await FetchSucursalById(params.id);
      setAgencia(data);
    }
    cargarAgencia();
    cargarSucursales();
  }, [params.id]);
  //const sucursales = await FetchSucursales("", 0);
  if (agencia == null) {
    // Esto se asegurará de no renderizar el formulario hasta que la agencia haya sido cargada
    return <div>Cargando...</div>;
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Agencias", href: "/dashboard/sucursales" },
          {
            label: "Moficiar Agencia",
            href: "/dashboard/sucursales/create",
            active: true,
          },
        ]}
      />
      <AgenciaForm agencia={agencia} sucursales={sucursales} />
      <MessageBox />
    </main>
  );
}
