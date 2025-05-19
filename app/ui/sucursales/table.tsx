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
import { UpdateSucursal } from "./button";
import { useEffect, useState } from "react";
import { AgenData } from "@/app/lib/definitions";

export default function SucursalesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [sucursales, setSucursales] = useState<AgenData[]>([]);
  useEffect(() => {
    // Fetch de cajeros
    async function cargarSucursales() {
      const data = await FetchSucursales(query, currentPage);
      setSucursales(data);
    }
    cargarSucursales();
  }, []);

  //const sucursales = await FetchSucursales(query, currentPage);

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
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Modificar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sucursales?.map((plaza) => (
                <tr
                  key={plaza.idAgencia}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p
                        className="truncate max-w-36"
                        title={plaza.descripcion}
                      >
                        {plaza.idAgencia}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {plaza.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{plaza.sigla}</td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateSucursal id={plaza.idAgencia!} />
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
