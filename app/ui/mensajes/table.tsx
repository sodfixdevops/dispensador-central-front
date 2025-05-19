"use client";
import Image from "next/image";
import {
  UpdateServicio,
  DeleteServicio,
  ListaServicios,
} from "@/app/ui/servicios/buttons";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { FetchServiciosTable } from "@/app/lib/servicios-actions";
import { FetchSucursales } from "@/app/lib/agencia-actions";
import { FetchConceptosByPrefijo } from "@/app/lib/conceptos-actions";
import { UpdateMensaje } from "./button";
import { useState, useEffect } from "react";
import { TrconData } from "@/app/lib/definitions";

export default function MensajesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [conceptos, setConceptos] = useState<TrconData[]>([]);
  useEffect(() => {
    // Fetch de cajeros
    async function cargarConceptos() {
      const data = await FetchConceptosByPrefijo(2);
      setConceptos(data);
    }
    cargarConceptos();
  }, []);
  //const conceptos = await FetchConceptosByPrefijo(2);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Codigo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Mensaje
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  posicion
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Modificar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {conceptos?.map((mensaje) => (
                <tr
                  key={mensaje.correlativo}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p
                        className="truncate max-w-36"
                        title={mensaje.descripcion}
                      >
                        {mensaje.correlativo}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {mensaje.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {mensaje.abreviacion}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateMensaje id={mensaje.correlativo!} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
