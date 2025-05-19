"use client";
import Image from "next/image";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { FetchServiciosTable } from "@/app/lib/servicios-actions";
import {
  FetchAgencias,
  fetchSucursales,
  FetchSucursales,
} from "@/app/lib/agencia-actions";
import { UpdateAgencia } from "./button";
import { AgenData } from "@/app/lib/definitions";
import { useState, useEffect } from "react";

export default function AgenciasTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [sucursales, setSucursales] = useState<any>([]);
  const [sucursales_map, setSucursalesMap] = useState<any>([]);
  const [agencias, setAgencias] = useState<AgenData[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Fetch de sucursales
        const data = await FetchSucursales(query, currentPage);
        setSucursales(data);

        // Verificamos si tenemos datos antes de llamar a fetchSucursales
        if (data && data.length > 0) {
          const data_map = await fetchSucursales(data); // Aquí debes asegurarte de que 'data' es lo que necesita fetchSucursales
          setSucursalesMap(data_map);
          console.log("AQUIII", data_map); // Log con coma en vez de concatenación para mejor legibilidad
        }

        // Fetch de agencias
        const data_agen = await FetchAgencias(query, currentPage);
        setAgencias(data_agen);
      } catch (error) {
        console.error("Error cargando los datos:", error);
      }
    };

    cargarDatos();
  }, []);

  //const sucursales = await FetchSucursales(query, currentPage);
  //const sucursales_map = await fetchSucursales(sucursales);
  //const agencias = await FetchAgencias(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Id
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Descripcion
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Codigo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Sucursal
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Modificar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {agencias?.map((agen) => (
                <tr
                  key={agen.idAgencia}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="truncate max-w-36" title={agen.descripcion}>
                        {agen.idAgencia}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {agen.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{agen.sigla}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {sucursales_map[agen.plaza!].descripcion}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateAgencia id={agen.idAgencia!} />
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
