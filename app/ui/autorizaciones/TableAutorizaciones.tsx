"use client";

import { useEffect, useState } from "react";
import { DpautInterface } from "@/app/lib/definitions";
import { fetchSolicitudesPendientes } from "@/app/lib/dpaut-actions";
import { autorizarORechazarSolicitud } from "@/app/lib/transaccion-actions";

function formatFecha(fecha?: Date | string): string {
  if (!fecha) return "-";
  const date = typeof fecha === "string" ? new Date(fecha) : fecha;
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

export default function TableAutorizaciones({ usuario }: { usuario: string }) {
  const [solicitudes, setSolicitudes] = useState<DpautInterface[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await fetchSolicitudesPendientes();
        setSolicitudes(data);
      } catch (error) {
        console.error("Error al cargar autorizaciones:", error);
      }
    };
    cargar();
  }, []);

  const procesarSolicitud = async (numeroDesembolso: number, estado: 2 | 3) => {
    if (!usuario) {
      alert("Usuario no identificado en sesión.");
      return;
    }

    try {
      const result = await autorizarORechazarSolicitud(
        numeroDesembolso,
        usuario,
        estado,
      );

      if (!result.success) {
        alert(result.message);
        return;
      }

      // Recargar la tabla
      const data = await fetchSolicitudesPendientes();
      setSolicitudes(data);
    } catch (error) {
      console.error("Error procesando solicitud:", error);
      alert("Error al procesar la solicitud.");
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium">#</th>
                <th className="px-3 py-5 font-medium">Fecha Solicitud</th>
                <th className="px-3 py-5 font-medium">N° Desembolso</th>
                <th className="px-3 py-5 font-medium">Solicitante</th>
                <th className="px-3 py-5 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {solicitudes.map((item) => (
                <tr key={item.dpautSeri} className="border-b text-sm">
                  <td className="px-3 py-3">{item.dpautSeri}</td>
                  <td className="px-3 py-3">{formatFecha(item.dpautFsol)}</td>
                  <td className="px-3 py-3">{item.dpautNdes ?? "-"}</td>
                  <td className="px-3 py-3">{item.dpautUsrs}</td>
                  <td className="px-3 py-3 space-x-2">
                    <button
                      onClick={() => procesarSolicitud(item.dpautNdes!, 2)}
                      className="rounded bg-green-600 px-3 py-1 text-white text-sm font-medium hover:bg-green-500"
                    >
                      Autorizar
                    </button>

                    <button
                      onClick={() => procesarSolicitud(item.dpautNdes!, 3)}
                      className="rounded bg-red-600 px-3 py-1 text-white text-sm font-medium hover:bg-red-500"
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
              {solicitudes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-sm text-gray-500"
                  >
                    No hay solicitudes pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
