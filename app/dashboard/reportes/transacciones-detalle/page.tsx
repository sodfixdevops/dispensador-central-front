"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { generarReporteTransaccionesDetalle } from "@/app/lib/reportes-actions";
import {
  ReporteTransaccionDetalleResponseDto,
  TransaccionDetalleDto,
} from "@/app/lib/definitions";
// Inline messages used instead of toast
import * as XLSX from "xlsx";

export default function ReporteTransaccionesDetallePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transacciones, setTransacciones] = useState<TransaccionDetalleDto[]>(
    [],
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  const hoy = new Date();
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  const [filtros, setFiltros] = useState({
    fechaInicio: hoyIso,
    fechaFin: hoyIso,
  });
  const [resumen, setResumen] = useState({ total: 0, sumaMonto: 0 });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const formatDateForDisplay = (s?: string) => {
    if (!s) return "";
    // Accept formats like YYYY-MM-DD or full ISO
    // Try parsing; fallback to manual split
    const asIso = s.split("T")[0];
    const parts = asIso.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const formatTimeForDisplay = (s?: string) => {
    if (!s) return "";
    // Match HH:MM:SS
    const m = s.match(/(\d{2}:\d{2}:\d{2})/);
    if (m) return m[1];
    // fallback: remove fractional seconds
    return s.split(".")[0];
  };

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
      const res: ReporteTransaccionDetalleResponseDto =
        await generarReporteTransaccionesDetalle(
          filtros.fechaInicio,
          filtros.fechaFin,
        );

      if (res.success && res.data) {
        setTransacciones(res.data.transacciones);
        setResumen({ total: res.data.total, sumaMonto: res.data.sumaMonto });
        setSuccessMsg(`Se encontraron ${res.data.total} transacciones`);
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
    if (transacciones.length === 0) {
      setErrorMsg("No hay datos para exportar");
      return;
    }

    const filas: any[] = [];
    transacciones.forEach((t) => {
      const displayUsuario = t.usuario_nombre || t.usuario;
      filas.push({
        Usuario: displayUsuario,
        Terminal: t.dptrndisp,
        "Nombre Terminal": t.addispnomb || "",
        NOperacion: t.dptrnntra,
        "Cuenta Destino": t.adbankncta || "",
        Monto: Number(t.dptrnimpo).toFixed(2),
        Fecha: formatDateForDisplay(t.fecha),
        Hora: formatTimeForDisplay(t.hora),
        Detalle: "--",
      });
      t.detalles.forEach((d) => {
        filas.push({
          Usuario: displayUsuario,
          Terminal: t.dptrndisp,
          "Nombre Terminal": t.addispnomb || "",
          NOperacion: t.dptrnntra,
          "Cuenta Destino": t.adbankncta || "",
          Monto: "",
          Fecha: formatDateForDisplay(t.fecha),
          Hora: formatTimeForDisplay(t.hora),
          Detalle: `${d.dptrdcant} x ${d.dptrdvlor} = ${Number(d.dptrdimpo).toFixed(2)}`,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TransaccionesDetalle");

    const fecha = new Date();
    const yyyymmdd = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}`;
    XLSX.writeFile(wb, `REP__Transacciones_Detalle_${yyyymmdd}.xlsx`);
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
        <h1 className="text-2xl">Reporte Transacciones - Detalle</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleGenerar}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>
          {transacciones.length > 0 && (
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

      {transacciones.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Terminal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre Terminal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NOperacion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cuenta Destino
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hora
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacciones.map((t) => (
                  <React.Fragment key={`tx-${t.dptrnntra}`}>
                    <tr className="hover:bg-gray-50 bg-gray-100">
                      <td className="px-4 py-3 text-sm">
                        {t.usuario_nombre || t.usuario}
                      </td>
                      <td className="px-4 py-3 text-sm">{t.dptrndisp}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.addispnomb || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">{t.dptrnntra}</td>
                      <td className="px-4 py-3 text-sm">
                        {t.adbankncta || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {Number(t.dptrnimpo).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDateForDisplay(t.fecha)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatTimeForDisplay(t.hora)}
                      </td>
                    </tr>
                    {t.detalles.map((d, idx) => (
                      <tr
                        key={`d-${t.dptrnntra}-${idx}`}
                        className="hover:bg-gray-50 bg-white"
                      >
                        <td
                          className="px-4 py-2 text-sm italic text-gray-600"
                          colSpan={8}
                        >
                          Denominación: {d.dptrdvlor} — Cantidad: {d.dptrdcant}{" "}
                          — Importe: {d.dptrdimpo.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {transacciones.length === 0 && !loading && (
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
