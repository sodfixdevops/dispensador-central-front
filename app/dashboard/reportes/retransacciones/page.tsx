"use client";
import { useState } from "react";
import { lusitana } from "@/app/ui/fonts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchTransaccionesReporte } from "@/app/lib/transaccion-actions";
import { Dptrn } from "@/app/lib/definitions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RetransaccionesPage() {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [fechaFinal, setFechaFinal] = useState<Date | null>(new Date());
  const [estado, setEstado] = useState<number>(0);
  const [datos, setDatos] = useState<Dptrn[]>([]);
  const [cargando, setCargando] = useState(false);

  const estadosLabel: { [key: number]: string } = {
    1: "Depósito",
    2: "Pend. Autorización",
    3: "Pend. Recolección",
    4: "Recolectado",
  };

  const monedas: { [key: number]: string } = {
    1: "BOB",
    2: "USD",
  };

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFinal) return;

    setCargando(true);
    try {
      const resultado = await fetchTransaccionesReporte(
        fechaInicio,
        fechaFinal,
        estado
      );
      setDatos(resultado);
    } catch (error) {
      console.error("Error generando reporte:", error);
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Transacciones", 14, 15);

    autoTable(doc, {
      head: [["ID", "Fecha", "Importe", "Moneda", "Usuario", "Estado"]],
      body: datos.map((d) => [
        d.dptrnntra,
        new Date(d.dptrnftra).toLocaleDateString(),
        d.dptrnimpo.toFixed(2),
        monedas[d.dptrncmon] || d.dptrncmon,
        d.dptrnusrn,
        estadosLabel[d.dptrnstat] || d.dptrnstat,
      ]),
      startY: 20,
    });

    doc.save("reporte-transacciones.pdf");
  };

  return (
    <div className="w-full px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`${lusitana.className} text-2xl`}>
          Reporte de Transacciones
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col w-48">
          <label className="text-sm font-medium">Fecha Inicio</label>
          <DatePicker
            selected={fechaInicio}
            onChange={(date) => setFechaInicio(date)}
            dateFormat="dd/MM/yyyy"
            className="text-sm w-full"
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="text-sm font-medium">Fecha Final</label>
          <DatePicker
            selected={fechaFinal}
            onChange={(date) => setFechaFinal(date)}
            dateFormat="dd/MM/yyyy"
            className="text-sm w-full"
          />
        </div>
        <div className="flex flex-col w-60">
          <label className="text-sm font-medium">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(parseInt(e.target.value))}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value={0}>Todos</option>
            <option value={1}>Depósito</option>
            <option value={2}>Pend. Autorización</option>
            <option value={3}>Pend. Recolección</option>
            <option value={4}>Recolectado</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleGenerarReporte}
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Tabla */}
      {datos.length > 0 && (
        <>
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Fecha</th>
                  <th className="border px-4 py-2">Importe Total</th>
                  <th className="border px-4 py-2">Moneda</th>
                  <th className="border px-4 py-2">Usuario</th>
                  <th className="border px-4 py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((item) => (
                  <tr key={item.dptrnntra}>
                    <td className="border px-4 py-2">{item.dptrnntra}</td>
                    <td className="border px-4 py-2">
                      {new Date(item.dptrnftra).toLocaleDateString()}
                    </td>
                    <td className="border px-4 py-2">
                      {Number(item.dptrnimpo).toFixed(2)}
                    </td>
                    <td className="border px-4 py-2">
                      {monedas[item.dptrncmon] || item.dptrncmon}
                    </td>
                    <td className="border px-4 py-2">{item.dptrnusrn}</td>
                    <td className="border px-4 py-2">
                      {estadosLabel[item.dptrnstat] || item.dptrnstat}
                    </td>
                  </tr>
                ))}

                {/* Fila de total */}
                <tr className="font-semibold bg-gray-100">
                  <td className="border px-4 py-2 text-right" colSpan={2}>
                    Total
                  </td>
                  <td className="border px-4 py-2">
                    {totalImporte.toFixed(2)}
                  </td>
                  <td className="border px-4 py-2" colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={exportarPDF}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Exportar a PDF
            </button>
          </div>
        </>
      )}

      {cargando && (
        <p className="mt-4 text-sm text-gray-600">Cargando datos...</p>
      )}
    </div>
  );
}
