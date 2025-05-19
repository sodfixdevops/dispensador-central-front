"use client";

import { useEffect, useState } from "react";

export default function ReportTable({
  filters,
  data,
}: {
  filters: any;
  data: any[];
}) {
  //const [data, setData] = useState([]);
  /*const data = [
    {
      id: 1,
      sucursal: "Sucursal 1",
      agencia: "Agencia 1",
      fecha: "2024-01-22",
      hora: "10:00",
    },
    {
      id: 2,
      sucursal: "Sucursal 2",
      agencia: "Agencia 2",
      fecha: "2024-01-22",
      hora: "11:00",
    },
  ];*/

  /*useEffect(() => {
    // Llamar a la API para obtener los datos del reporte según los filtros.
    fetch(`/api/reportes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [filters]);*/

  return (
    <table className="w-full border-collapse border border-gray-300 text-xs">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-300 p-2">Nro</th>
          <th className="border border-gray-300 p-2">Agencia</th>
          <th className="border border-gray-300 p-2">Tickets Emitidos</th>
          <th className="border border-gray-300 p-2">Tickets Atendidos</th>
          <th className="border border-gray-300 p-2">Tickets No Atendidos</th>
          <th className="border border-gray-300 p-2">T.Prom.Espera</th>
          <th className="border border-gray-300 p-2">T.Prom.Atencion</th>
          <th className="border border-gray-300 p-2">Fecha</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.codigo}>
            <td className="border border-gray-300 p-2">{row.codigo}</td>
            <td className="border border-gray-300 p-2">{row.agencia}</td>
            <td className="border border-gray-300 p-2">
              {row.tickets_emitidos}
            </td>
            <td className="border border-gray-300 p-2">
              {row.tickets_atendidos}
            </td>
            <td className="border border-gray-300 p-2">
              {row.tickets_noatendidos}
            </td>
            <td className="border border-gray-300 p-2">
              {row.tiempo_promedio_espera}
            </td>
            <td className="border border-gray-300 p-2">
              {row.tiempo_promedio_atencion}
            </td>
            <td className="border border-gray-300 p-2">{row.fecha}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
