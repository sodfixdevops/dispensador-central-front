"use client";
import Filters from "@/app/ui/reportes/filters";
import ReportTable from "@/app/ui/reportes/table";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { lusitana } from "@/app/ui/fonts";
import {
  FetchFiltrosAgencias,
  FetchFiltrosSucursales,
} from "@/app/lib/agencia-actions";
import {
  Agenciafiltro,
  ServicioFiltro,
  SubservicioFiltro,
  Sucursalfiltro,
} from "@/app/lib/definitions";
import { reporteAsfi, reporteResumenColas } from "@/app/lib/reportes-actions";
import {
  FetchFiltrosServicios,
  FetchFiltrosSubServicios,
} from "@/app/lib/servicios-actions";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";

export default function ReportesPage() {
  const [filters, setFilters] = useState({
    sucursales: [],
    agencias: [],
    servicios: [],
    subservicios: [],
    fechaInicio: new Date(),
    fechaFinal: new Date(),
    horaInicio: "08:30:00",
    horaFinal: "17:00:00",
  });
  const [sucursales, setSucursales] = useState<Sucursalfiltro[] | []>([]);
  const [agencias, setAgencias] = useState<Agenciafiltro[] | []>([]);
  const [servicios, setServicios] = useState<ServicioFiltro[] | []>([]);
  const [subservicios, setSubservicios] = useState<SubservicioFiltro[] | []>(
    []
  );
  const [reporData, setReportData] = useState<any[]>([]);
  useEffect(() => {
    // Obtén las sucursales
    const fetchSucursales = async () => {
      try {
        const filtroSucursales = await FetchFiltrosSucursales();
        setSucursales(filtroSucursales);
      } catch (error) {
        console.error("Error al obtener sucursales:", error);
      }
    };

    // Obtén las agencias (si ya las tienes disponibles, puedes obtenerlas aquí también)
    const fetchAgencias = async () => {
      try {
        const agenciasData = await FetchFiltrosAgencias(); // Llamada a la API de agencias
        setAgencias(agenciasData);
      } catch (error) {
        console.error("Error al obtener agencias:", error);
      }
    };

    const fetchServicios = async () => {
      try {
        const serviciosData = await FetchFiltrosServicios(); // Llamada a la API de agencias
        setServicios(serviciosData);
      } catch (error) {
        console.error("Error al obtener servicios:", error);
      }
    };

    const fetchSubservicios = async () => {
      try {
        const subserviciosData = await FetchFiltrosSubServicios(); // Llamada a la API de agencias
        setSubservicios(subserviciosData);
      } catch (error) {
        console.error("Error al obtener subservicios:", error);
      }
    };

    fetchSucursales();
    fetchAgencias();
    fetchServicios();
    fetchSubservicios();
  }, []);

  const fetchReportData = async (filters: any) => {
    try {
      console.log(filters);
      const datos = {
        sucursales: filters.sucursales,
        agencias: filters.agencias,
        servicios: filters.servicios,
        subservicios: filters.subservicios,
        fechaIni: filters.fechaInicio,
        fechaFin: filters.fechaFinal,
        horaIni: filters.horaInicio,
        horaFin: filters.horaFinal,
      };

      const responseBlob = await reporteAsfi(datos);

      // Crear una URL para el Blob
      const url = URL.createObjectURL(responseBlob);

      // Crear un enlace para descargar el archivo
      const a = document.createElement("a");
      a.href = url;
      a.download = "reporte.txt"; // Aquí le das el nombre al archivo a descargar
      document.body.appendChild(a);
      a.click(); // Simular el clic para iniciar la descarga
      document.body.removeChild(a); // Limpiar el enlace

      // Opcional: Revocar la URL para liberar recursos
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error en la llamada a la API:", error);
    }
  };

  const handleFiltersChange = async (newFilters: any) => {
    setFilters(newFilters); // Se actualizan los filtros al hacer clic en el botón
    await fetchReportData(newFilters); // Se hace la llamada a la API solo cuando el usuario decide procesar el reporte
  };

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Reportes", href: "/dashboard/reportes" },
          {
            label: "REporte ASFI",
            href: "/dashboard/reportes/asfi",
            active: true,
          },
        ]}
      />
      <div className="w-full">
        <div className="mt-4">
          <Filters
            onGenerateReport={handleFiltersChange}
            sucursales={sucursales}
            agencias={agencias}
            servicios={servicios}
            subservicios={subservicios}
          />
        </div>
      </div>
    </main>
  );
}
