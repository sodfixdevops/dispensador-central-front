"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { generarReporteTransaccionesDetalle } from "@/app/lib/reportes-actions";
import {
  ReporteTransaccionDetalleResponseDto,
  TransaccionDetalleDto,
} from "@/app/lib/definitions";
import * as XLSX from "xlsx";

type CorteResumen = {
  ctb10: number;
  impo10: number;
  ctb20: number;
  impo20: number;
  ctb50: number;
  impo50: number;
  ctb100: number;
  impo100: number;
  ctb200: number;
  impo200: number;
};

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
    const asIso = s.split("T")[0];
    const parts = asIso.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const formatTimeForDisplay = (s?: string) => {
    if (!s) return "";
    const m = s.match(/(\d{2}:\d{2}:\d{2})/);
    if (m) return m[1];
    return s.split(".")[0];
  };

  const getCortesFijos = (t: TransaccionDetalleDto): CorteResumen => {
    const out: CorteResumen = {
      ctb10: 0,
      impo10: 0,
      ctb20: 0,
      impo20: 0,
      ctb50: 0,
      impo50: 0,
      ctb100: 0,
      impo100: 0,
      ctb200: 0,
      impo200: 0,
    };

    for (const d of t.detalles || []) {
      const valor = Number(d.dptrdvlor || 0);
      const cant = Number(d.dptrdcant || 0);
      const impo = Number(d.dptrdimpo || 0);

      if (valor === 10) {
        out.ctb10 += cant;
        out.impo10 += impo;
      } else if (valor === 20) {
        out.ctb20 += cant;
        out.impo20 += impo;
      } else if (valor === 50) {
        out.ctb50 += cant;
        out.impo50 += impo;
      } else if (valor === 100) {
        out.ctb100 += cant;
        out.impo100 += impo;
      } else if (valor === 200) {
        out.ctb200 += cant;
        out.impo200 += impo;
      }
    }

    return out;
  };

  const handleGenerar = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!filtros.fechaInicio || !filtros.fechaFin) {
      setErrorMsg("Complete fecha inicio y fecha fin");
      return;
    }

    const start = new Date(filtros.fechaInicio);
    const end = new Date(filtros.fechaFin);
    if (start > end) {
      setErrorMsg("La fecha de inicio debe ser menor o igual a la fecha fin");
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
        setErrorMsg(res.error || res.message || "Error al generar reporte");
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

    const filas = transacciones.map((t) => {
      const displayUsuario = t.usuario_nombre || t.usuario;
      const cortes = getCortesFijos(t);

      return {
        USUARIO: displayUsuario,
        TERMINAL: t.dptrndisp,
        "NOMBRE TERMINAL": t.addispnomb || "",
        NOPERACION: t.dptrnntra,
        "CUENTA DESTINO": t.adbankncta || "",
        MONTO: Number(t.dptrnimpo).toFixed(2),
        FECHA: formatDateForDisplay(t.fecha),
        HORA: formatTimeForDisplay(t.hora),
        OBV: "",
        CTBs10: cortes.ctb10,
        ImpoBs10: cortes.impo10.toFixed(2),
        CTBs20: cortes.ctb20,
        ImpoBs20: cortes.impo20.toFixed(2),
        CTBs50: cortes.ctb50,
        ImpoBs50: cortes.impo50.toFixed(2),
        CTBs100: cortes.ctb100,
        ImpoBs100: cortes.impo100.toFixed(2),
        CTBs200: cortes.ctb200,
        ImpoBs200: cortes.impo200.toFixed(2),
      };
    });

    const totales = transacciones.reduce(
      (acc, t) => {
        const cortes = getCortesFijos(t);
        acc.monto += Number(t.dptrnimpo || 0);
        acc.ctb10 += cortes.ctb10;
        acc.impo10 += cortes.impo10;
        acc.ctb20 += cortes.ctb20;
        acc.impo20 += cortes.impo20;
        acc.ctb50 += cortes.ctb50;
        acc.impo50 += cortes.impo50;
        acc.ctb100 += cortes.ctb100;
        acc.impo100 += cortes.impo100;
        acc.ctb200 += cortes.ctb200;
        acc.impo200 += cortes.impo200;
        return acc;
      },
      {
        monto: 0,
        ctb10: 0,
        impo10: 0,
        ctb20: 0,
        impo20: 0,
        ctb50: 0,
        impo50: 0,
        ctb100: 0,
        impo100: 0,
        ctb200: 0,
        impo200: 0,
      },
    );

    filas.push({
      USUARIO: "TOTAL",
      TERMINAL: 0,
      "NOMBRE TERMINAL": "",
      NOPERACION: 0,
      "CUENTA DESTINO": "",
      MONTO: Number(totales.monto).toFixed(2),
      FECHA: "",
      HORA: "",
      OBV: "",
      CTBs10: totales.ctb10,
      ImpoBs10: Number(totales.impo10).toFixed(2),
      CTBs20: totales.ctb20,
      ImpoBs20: Number(totales.impo20).toFixed(2),
      CTBs50: totales.ctb50,
      ImpoBs50: Number(totales.impo50).toFixed(2),
      CTBs100: totales.ctb100,
      ImpoBs100: Number(totales.impo100).toFixed(2),
      CTBs200: totales.ctb200,
      ImpoBs200: Number(totales.impo200).toFixed(2),
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
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
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

        <div className="mt-3 text-sm text-gray-700">
          <span className="mr-6">Total operaciones: {resumen.total}</span>
          <span>Suma monto: {Number(resumen.sumaMonto || 0).toFixed(2)}</span>
        </div>

        {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}
        {successMsg && (
          <p className="mt-3 text-sm text-emerald-600">{successMsg}</p>
        )}
      </div>

      {transacciones.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[2200px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">USUARIO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TERMINAL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NOMBRE TERMINAL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NOPERACION</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CUENTA DESTINO</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">MONTO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FECHA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HORA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">OBV</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTBs10</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ImpoBs10</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTBs20</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ImpoBs20</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTBs50</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ImpoBs50</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTBs100</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ImpoBs100</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTBs200</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ImpoBs200</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {transacciones.map((t) => {
                  const cortes = getCortesFijos(t);
                  return (
                    <tr key={`tx-${t.dptrnntra}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{t.usuario_nombre || t.usuario}</td>
                      <td className="px-4 py-3 text-sm">{t.dptrndisp}</td>
                      <td className="px-4 py-3 text-sm">{t.addispnomb || "-"}</td>
                      <td className="px-4 py-3 text-sm">{t.dptrnntra}</td>
                      <td className="px-4 py-3 text-sm">{t.adbankncta || "-"}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{Number(t.dptrnimpo).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">{formatDateForDisplay(t.fecha)}</td>
                      <td className="px-4 py-3 text-sm">{formatTimeForDisplay(t.hora)}</td>
                      <td className="px-4 py-3 text-sm"></td>
                      <td className="px-4 py-3 text-sm text-right">{cortes.ctb10}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{cortes.impo10.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right">{cortes.ctb20}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{cortes.impo20.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right">{cortes.ctb50}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{cortes.impo50.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right">{cortes.ctb100}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{cortes.impo100.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right">{cortes.ctb200}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{cortes.impo200.toFixed(2)}</td>
                    </tr>
                  );
                })}
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
