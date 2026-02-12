"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
// Inline messages used instead of toast
import * as XLSX from "xlsx";
import { generarReporteTotalesGenerales } from "@/app/lib/reportes-actions";
import {
  ReporteTotalesGeneralesResponseDto,
  TotalesGeneralesDto,
} from "@/app/lib/definitions";

export default function ReporteTotalesGeneralesPage() {
  const router = useRouter();
  const pad = (n: number) => String(n).padStart(2, "0");
  const hoy = new Date();
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  const [filtros, setFiltros] = useState({
    fechaInicio: hoyIso,
    fechaFin: hoyIso,
    estado: "TODOS",
  });
  const [loading, setLoading] = useState(false);
  const [totales, setTotales] = useState<TotalesGeneralesDto[]>([]);
  const [resumen, setResumen] = useState({ totalMonedas: 0, sumaImporte: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleGenerar = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!filtros.fechaInicio || !filtros.fechaFin) {
      const msg = "Complete fecha inicio y fecha fin";
      setErrorMsg(msg);
      return;
    }

    // Validar orden de fechas
    const start = new Date(filtros.fechaInicio);
    const end = new Date(filtros.fechaFin);
    if (start > end) {
      const msg = "La fecha de inicio debe ser menor o igual a la fecha fin";
      setErrorMsg(msg);
      return;
    }

    setLoading(true);
    try {
      const res: ReporteTotalesGeneralesResponseDto =
        await generarReporteTotalesGenerales(
          filtros.fechaInicio,
          filtros.fechaFin,
          filtros.estado,
        );
      if (res.success && res.data) {
        setTotales(res.data.totales);
        setResumen({
          totalMonedas: res.data.totalMonedas,
          sumaImporte: res.data.sumaImporte,
        });
        setSuccessMsg(res.message || "Reporte generado");
      } else {
        const msg = res.error || res.message || "Error al generar reporte";
        setErrorMsg(msg);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    if (totales.length === 0) {
      setErrorMsg("No hay datos para exportar");
      return;
    }
    const filas = totales.map((t) => ({
      Moneda: t.moneda,
      TotalTransacciones: t.totalTransacciones,
      CantidadBilletes: t.cantidadBilletes,
      Importe: t.importe.toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TotalesGenerales");
    const fecha = new Date();
    const yyyymmdd = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}`;
    XLSX.writeFile(wb, `REP__Totales_Generales_${yyyymmdd}.xlsx`);
    setSuccessMsg("Excel exportado");
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl">Totales Generales</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaInicio: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) =>
                setFiltros({ ...filtros, fechaFin: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) =>
                setFiltros({ ...filtros, estado: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="TODOS">Todos</option>
              <option value="1">1: Pendiente</option>
              <option value="2">2: Pendiente Autorizacion</option>
              <option value="3">3: Autorizado</option>
              <option value="4">4: Desembolsado</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleGenerar}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>
          {totales.length > 0 && (
            <button
              onClick={exportarExcel}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Exportar a Excel
            </button>
          )}
        </div>
        {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}
        {successMsg && (
          <p className="mt-3 text-sm text-emerald-600">{successMsg}</p>
        )}
      </div>

      {totales.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Monedas</p>
              <p className="text-2xl font-bold text-blue-700">
                {resumen.totalMonedas}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Suma Importe</p>
              <p className="text-2xl font-bold text-green-700">
                {resumen.sumaImporte.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Moneda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total Transacciones
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cantidad Billetes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Importe
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {totales.map((t) => (
                  <tr key={`m-${t.moneda}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{t.moneda}</td>
                    <td className="px-4 py-3 text-sm">
                      {t.totalTransacciones}
                    </td>
                    <td className="px-4 py-3 text-sm">{t.cantidadBilletes}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {t.importe.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totales.length === 0 && !loading && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500">
            Complete los filtros y haga clic en "Generar Reporte" para ver los
            resultados
          </p>
        </div>
      )}
    </div>
  );
}
