"use client";
import { useRouter } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";

export default function ReportesPage() {
  const router = useRouter();

  const irATransacciones = () => {
    router.push("/dashboard/reportes/retransacciones");
  };

  const irADesembolsos = () => {
    router.push("/dashboard/reportes/redesembolsos");
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className={`${lusitana.className} text-2xl`}>Reportes</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-start">
        <button
          onClick={irATransacciones}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700 transition"
        >
          Reporte de Transacciones
        </button>
        <button
          onClick={irADesembolsos}
          className="bg-green-600 text-white font-semibold py-2 px-6 rounded hover:bg-green-700 transition"
        >
          Reporte de Desembolsos
        </button>
      </div>
    </div>
  );
}
