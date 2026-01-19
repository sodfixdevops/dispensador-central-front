"use client";
import type { Dptrn } from "@/app/lib/definitions";

interface RecolectarTableProps {
  transacciones: Dptrn[];
}

export default function RecolectarTable({
  transacciones,
}: RecolectarTableProps) {
  return (
    <div className="rounded-lg bg-white shadow">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-gray-600">
              Nro.Tran.
            </th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">
              Fecha
            </th>
            <th className="px-6 py-3 text-left font-medium text-gray-600">
              Usuario
            </th>
            <th className="px-6 py-3 text-right font-medium text-gray-600">
              Importe
            </th>
          </tr>
        </thead>

        <tbody>
          {transacciones.map((t) => (
            <tr key={t.dptrnntra} className="border-t">
              <td className="px-6 py-4">
                {t.dptrnntra.toString().padStart(6, "0")}
              </td>

              <td className="px-6 py-4">
                {new Date(t.dptrnftra).toLocaleDateString("es-BO")}
              </td>

              <td className="px-6 py-4">{t.dptrnusrn}</td>

              <td className="px-6 py-4 text-right">
                {Number(t.dptrnimpo).toFixed(2)}{" "}
                {t.dptrncmon === 1 ? "BOB" : "USD"}
              </td>
            </tr>
          ))}

          {transacciones.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-6 text-center text-gray-500">
                No hay registros para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
