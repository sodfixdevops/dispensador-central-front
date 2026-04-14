"use client";

import { useState, useEffect } from "react";
import { lusitana } from "@/app/ui/fonts";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { generarReporteTransaccionesPorUsuario } from "@/app/lib/reportes-actions";
import {
  TransaccionReporteDto,
  AduserData,
  TrconData,
  DispositivoData,
} from "@/app/lib/definitions";
import { FetchUsuariosTable } from "@/app/lib/aduser-actions";
import { FetchConceptosByPrefijo } from "@/app/lib/conceptos-actions";
import { fetchDispositivos } from "@/app/lib/dispositivo-actions";
// Inline messages used instead of toast
import * as XLSX from "xlsx";

export default function ReporteTransaccionesPage() {
  const router = useRouter();
  const getEstadoTransaccion = (estado: number) => {
    switch (estado) {
      case 1:
        return "Depositado";
      case 2:
        return "Solicitud Desembolso";
      case 3:
        return "Autorizado";
      case 4:
        return "Recolectado";
      default:
        return `Desconocido (${estado})`;
    }
  };
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<AduserData[]>([]);
  const [monedas, setMonedas] = useState<TrconData[]>([]);
  const [dispositivos, setDispositivos] = useState<DispositivoData[]>([]);
  const [transacciones, setTransacciones] = useState<TransaccionReporteDto[]>(
    [],
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  const hoy = new Date();
  const hoyIso = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
  const [filtros, setFiltros] = useState({
    usuario: "",
    fechaInicio: hoyIso,
    fechaFin: hoyIso,
  });
  const [resumen, setResumen] = useState({
    total: 0,
    sumaMonto: 0,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const getMonedaTransaccion = (codigoMoneda: number) => {
    const moneda = monedas.find((m) => m.correlativo === codigoMoneda);
    return moneda?.abreviacion || moneda?.descripcion || String(codigoMoneda);
  };
  const getDispositivoTransaccion = (codigoDispositivo: number) => {
    const dispositivo = dispositivos.find(
      (d) => d.addispcode === codigoDispositivo,
    );
    return dispositivo?.addispnomb || String(codigoDispositivo);
  };

  // Cargar lista de usuarios, monedas (prefijo 2) y dispositivos al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const [usuariosData, monedasData, dispositivosData] = await Promise.all([
        FetchUsuariosTable("", 1),
        FetchConceptosByPrefijo(2),
        fetchDispositivos(),
      ]);
      setUsuarios(usuariosData);
      setMonedas(monedasData);
      setDispositivos(dispositivosData);
    };
    cargarDatosIniciales();
  }, []);

  const handleGenerarReporte = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!filtros.usuario || !filtros.fechaInicio || !filtros.fechaFin) {
      const msg = "Por favor complete todos los campos del filtro";
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
      const resultado = await generarReporteTransaccionesPorUsuario(filtros);

      if (resultado.success && resultado.data) {
        setTransacciones(resultado.data.transacciones);

        // Calcular la suma real desde las transacciones (el backend retorna string concatenado)
        const sumaMonto = resultado.data.transacciones.reduce(
          (acc, t) => acc + parseFloat(t.dptrnimpo || "0"),
          0,
        );

        setResumen({
          total: resultado.data.total,
          sumaMonto: sumaMonto,
        });
        setSuccessMsg(
          `Reporte generado: ${resultado.data.total} transacciones encontradas`,
        );
      } else {
        const msg = resultado.error || "Error al generar el reporte";
        setErrorMsg(msg);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    if (transacciones.length === 0) {
      setErrorMsg("No hay datos para exportar");
      return;
    }

    const datosExcel = transacciones.map((t) => ({
      "Nro Transacción": t.dptrnntra,
      Fecha: new Date(t.dptrnftra).toLocaleDateString(),
      Monto: parseFloat(t.dptrnimpo).toFixed(2),
      Moneda: getMonedaTransaccion(t.dptrncmon),
      Estado: getEstadoTransaccion(t.dptrnstat),
      Usuario: t.adusrnick,
      Dispositivo: getDispositivoTransaccion(t.dptrndisp),
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");

    // Generar nombre con formato REP__Transacciones_YYYYMMDD
    const fecha = new Date();
    const yyyymmdd = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}`;

    XLSX.writeFile(wb, `REP__Transacciones_${yyyymmdd}.xlsx`);
    setSuccessMsg("Excel exportado correctamente");
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
        <h1 className={`${lusitana.className} text-2xl`}>
          Reporte de Transacciones por Usuario
        </h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <select
              value={filtros.usuario}
              onChange={(e) =>
                setFiltros({ ...filtros, usuario: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Seleccione un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.adusrusrn} value={usuario.adusrusrn}>
                  {usuario.adusrnick}
                </option>
              ))}
            </select>
          </div>
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
            onClick={handleGenerarReporte}
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

      {/* Resumen */}
      {transacciones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Transacciones</p>
            <p className="text-2xl font-bold text-blue-700">{resumen.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Suma Total</p>
            <p className="text-2xl font-bold text-green-700">
              {resumen.sumaMonto.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Tabla */}
      {transacciones.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Moneda
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Dispositivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transacciones.map((t) => (
                  <tr key={t.dptrnntra} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{t.dptrnntra}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(t.dptrnftra).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{t.adusrnick}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {parseFloat(t.dptrnimpo).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {getMonedaTransaccion(t.dptrncmon)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          t.dptrnstat === 1
                            ? "bg-yellow-100 text-yellow-800"
                            : t.dptrnstat === 2
                              ? "bg-green-100 text-green-800"
                              : t.dptrnstat === 3
                                ? "bg-blue-100 text-blue-800"
                                : t.dptrnstat === 4
                                  ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getEstadoTransaccion(t.dptrnstat)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {getDispositivoTransaccion(t.dptrndisp)}
                    </td>
                  </tr>
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
