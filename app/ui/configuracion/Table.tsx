"use client";
import Image from "next/image";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { FetchServiciosTable } from "@/app/lib/servicios-actions";
import {
  FetchAgencias,
  fetchSucursales,
  FetchSucursales,
} from "@/app/lib/agencia-actions";
import { FetchConceptosCabecera } from "@/app/lib/conceptos-actions";
import { DetalleConcepto, UpdateCabecera } from "./Button";
import { useState, useEffect } from "react";
import { TrconData } from "@/app/lib/definitions";

export default function ConceptoCabeceraTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [cabecera, setCabecera] = useState<TrconData[]>([]);
  useEffect(() => {
    // Fetch de cajeros
    async function cargarCabecera() {
      const data = await FetchConceptosCabecera();
      setCabecera(data);
    }
    cargarCabecera();
  }, []);

  //const cabecera = await FetchConceptosCabecera();

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
                  Correlativo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Descripcion
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Abreviacion
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Modificar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {cabecera?.map((concepto) => (
                <tr
                  key={concepto.prefijo}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p
                        className="truncate max-w-36"
                        title={concepto.descripcion}
                      >
                        {concepto.prefijo}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {concepto.correlativo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {concepto.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {concepto.abreviacion}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <DetalleConcepto id={concepto.prefijo!} />
                      <UpdateCabecera id={concepto.prefijo!} />
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
