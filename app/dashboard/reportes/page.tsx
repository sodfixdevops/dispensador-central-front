"use client";
import { useRouter } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import {
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function ReportesPage() {
  const router = useRouter();

  const reportes = [
    {
      id: "transacciones",
      titulo: "Reporte de Transacciones",
      descripcion:
        "Consulta transacciones por usuario en un rango de fechas específico",
      icono: DocumentTextIcon,
      ruta: "/dashboard/reportes/transacciones",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: "dinero-acumulado",
      titulo: "Dinero Acumulado por Dispositivo",
      descripcion:
        "Visualiza el dinero pendiente de recolección en cada dispositivo",
      icono: BanknotesIcon,
      ruta: "/dashboard/reportes/dinero-acumulado",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  return (
    <div className="w-full px-4 py-6">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className={`${lusitana.className} text-2xl`}>
          Reportes del Sistema
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportes.map((reporte) => {
          const IconoReporte = reporte.icono;
          return (
            <button
              key={reporte.id}
              onClick={() => router.push(reporte.ruta)}
              className={`${reporte.color} text-white rounded-lg p-6 text-left transition-all transform hover:scale-105 shadow-lg`}
            >
              <div className="flex items-start gap-4">
                <IconoReporte className="w-12 h-12 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2">{reporte.titulo}</h2>
                  <p className="text-blue-100">{reporte.descripcion}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
