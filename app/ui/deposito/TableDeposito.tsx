"use client";

import { useEffect, useMemo, useState } from "react";

import { dpmtr, gbcucy } from "@/app/lib/definitions";
import { FetchCortes } from "@/app/lib/de70-actions";

interface Props {
  query: string;
  currentPage: number;
  datosDpmtr: dpmtr[];
  apiUrl: string;
  onCortesChange?: (cortes: gbcucy[]) => void;
  onMontoChange?: (monto: number) => void; // ← NUEVO
}

export default function TableDeposito({
  query,
  currentPage,
  datosDpmtr,
  apiUrl,
  onCortesChange,
  onMontoChange,
}: Props) {
  const [cortes, setCortes] = useState<gbcucy[]>([]);

  useEffect(() => {
    async function cargarCortes() {
      const data = await FetchCortes(apiUrl, 1);
      setCortes(data);
    }
    cargarCortes();
  }, [apiUrl]);

  const cortesActualizados = useMemo(() => {
    if (!datosDpmtr || datosDpmtr.length === 0 || cortes.length === 0)
      return cortes;

    return cortes.map((corte) => {
      const encontrado = datosDpmtr.find(
        (d) => d.dpmtrdsid === corte.gbcucydnid
      );
      const cantidad = encontrado?.dpmtrcant ?? 0;
      return {
        ...corte,
        gbcucycant: cantidad,
      };
    });
  }, [cortes, datosDpmtr]);

  useEffect(() => {
    if (onCortesChange) {
      onCortesChange(cortesActualizados);
    }
  }, [cortesActualizados, onCortesChange]);

  const montoTotal = useMemo(() => {
    return cortesActualizados.reduce((sum, c) => {
      return sum + (c.gbcucycant ?? 0) * c.gbcucyvlor!;
    }, 0);
  }, [cortesActualizados]);

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
                  Corte de moneda
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Cantidad
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {cortesActualizados?.map((corte) => (
                <tr
                  key={corte.gbcucygnid}
                  className="w-full border-b py-3 text-sm"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="truncate max-w-36" title={corte.gbcucydesc}>
                        {corte.gbcucydnid}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {corte.gbcucydesc}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">BILLETE</td>
                  <td>{corte.gbcucycant ?? 0}</td>
                  <td>{corte.gbcucyvlor}</td>
                </tr>
              ))}

              <tr key={100} className="w-full border-b py-3 text-sm">
                <td
                  colSpan={3}
                  className="whitespace-nowrap px-3 py-3 text-right"
                >
                  TOTAL
                </td>
                <td
                  colSpan={2}
                  className="whitespace-nowrap px-3 py-3 text-center"
                >
                  {montoTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
