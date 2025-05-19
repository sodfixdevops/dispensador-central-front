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
import { Agenciafiltro, Sucursalfiltro } from "@/app/lib/definitions";
import { reporteResumenColas } from "@/app/lib/reportes-actions";
import { useRouter } from "next/navigation";

export default function ReportesPage() {
  const router = useRouter();
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
  const [reporData, setReportData] = useState<any[]>([]);

  const fromResumenColas = () => {
    router.push("/dashboard/reportes/resumencolas");
  };

  const fromReporteASfi = () => {
    router.push("/dashboard/reportes/asfi");
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Reportes</h1>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={fromResumenColas}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Reporte Resumen de colas
        </button>
        <button
          onClick={fromReporteASfi}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Reporte ASFI
        </button>
      </div>
    </div>
  );
}
