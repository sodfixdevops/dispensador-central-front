"use client";

import { useState, useEffect } from "react";
import { lusitana } from "@/app/ui/fonts";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { generarReporteDineroAcumulado } from "@/app/lib/reportes-actions";
import { DineroAcumuladoDispositivoDto } from "@/app/lib/definitions";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

export default function ReporteDineroAcumuladoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dispositivos, setDispositivos] = useState<
    DineroAcumuladoDispositivoDto[]
  >([]);
  const [resumen, setResumen] = useState({
    totalDispositivosConDinero: 0,
    montoTotalAcumulado: "0",
    generadoEn: new Date("2000-01-01"), // Valor inicial fijo para evitar hidratación
  });

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const resultado = await generarReporteDineroAcumulado();

      if (resultado.success && resultado.data) {
        setDispositivos(resultado.data.dispositivos);

        // Calcular totales reales desde los datos (backend puede tener errores)
        const montoTotalCalculado = resultado.data.dispositivos.reduce(
          (sum, d) => sum + parseFloat(d.montoAcumulado || "0"),
          0,
        );

        setResumen({
          totalDispositivosConDinero: resultado.data.totalDispositivosConDinero,
          montoTotalAcumulado: montoTotalCalculado.toString(),
          generadoEn: resultado.data.generadoEn,
        });
        toast.success(
          `Reporte generado: ${resultado.data.totalDispositivosConDinero} dispositivos con dinero`,
        );
      } else {
        toast.error(resultado.error || "Error al generar el reporte");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const exportarExcel = () => {
    if (dispositivos.length === 0) {
      toast.warning("No hay datos para exportar");
      return;
    }

    const datosExcel = dispositivos.map((d) => ({
      Dispositivo: d.dptrndisp,
      "Total Transacciones": d.totalTransacciones,
      "Monto Acumulado": parseFloat(d.montoAcumulado).toFixed(2),
    }));

    // Agregar fila de totales
    datosExcel.push({
      Dispositivo: "TOTAL" as any,
      "Total Transacciones": dispositivos.reduce(
        (sum, d) =>
          sum +
          (typeof d.totalTransacciones === "string"
            ? parseInt(d.totalTransacciones)
            : d.totalTransacciones),
        0,
      ),
      "Monto Acumulado": parseFloat(resumen.montoTotalAcumulado).toFixed(2),
    });

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dinero Acumulado");

    // Generar nombre con formato REP__Acumulado_YYYYMMDD
    const fecha = new Date();
    const yyyymmdd = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}`;

    XLSX.writeFile(wb, `REP__Acumulado_${yyyymmdd}.xlsx`);
    toast.success("Excel exportado correctamente");
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h1 className={`${lusitana.className} text-2xl`}>
            Dinero Acumulado por Dispositivo
          </h1>
        </div>
        <button
          onClick={cargarReporte}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Dispositivos con Dinero</p>
          <p className="text-2xl font-bold text-blue-700">
            {resumen.totalDispositivosConDinero}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Monto Total Acumulado</p>
          <p className="text-2xl font-bold text-green-700">
            {parseFloat(resumen.montoTotalAcumulado).toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Generado</p>
          <p className="text-sm font-semibold text-gray-700">
            {new Date(resumen.generadoEn).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Botón de exportar */}
      {dispositivos.length > 0 && (
        <div className="mb-4">
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exportar a Excel
          </button>
        </div>
      )}

      {/* Tabla */}
      {dispositivos.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dispositivo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total Transacciones
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Monto Acumulado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dispositivos.map((d) => (
                  <tr key={d.dptrndisp} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Dispositivo {d.dptrndisp}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono">
                      {d.totalTransacciones}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-mono font-semibold text-green-600">
                      {parseFloat(d.montoAcumulado).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* Fila de totales */}
                <tr className="bg-gray-100 font-bold">
                  <td className="px-6 py-4 text-sm">TOTAL</td>
                  <td className="px-6 py-4 text-sm text-right">
                    {dispositivos.reduce(
                      (sum, d) =>
                        sum +
                        (typeof d.totalTransacciones === "string"
                          ? parseInt(d.totalTransacciones)
                          : d.totalTransacciones),
                      0,
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-700">
                    {parseFloat(resumen.montoTotalAcumulado).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500">
              No hay dispositivos con dinero acumulado pendiente de recolección
            </p>
          </div>
        )
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
