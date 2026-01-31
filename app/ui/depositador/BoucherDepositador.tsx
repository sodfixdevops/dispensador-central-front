"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { dpmtr, gbcucy } from "@/app/lib/definitions";
import { FetchCortes } from "@/app/lib/de70-actions";

interface Props {
  fecha: string;
  hora: string;
  usuario: string;
  montoTotal: number;
  moneda: string;
  datosDpmtr: dpmtr[];
  apiUrl: string;
  onCerrar: () => void;
}

export default function BoucherDepositador({
  fecha,
  hora,
  usuario,
  montoTotal,
  moneda,
  datosDpmtr,
  apiUrl,
  onCerrar,
}: Props) {
  const boucherRef = useRef<HTMLDivElement>(null);
  const [cortes, setCortes] = useState<gbcucy[]>([]);

  useEffect(() => {
    const cargarCortes = async () => {
      const data = await FetchCortes(apiUrl, 1);
      setCortes(data);
    };
    cargarCortes();
  }, [apiUrl]);

  const cortesActualizados = useMemo(() => {
    if (!datosDpmtr || datosDpmtr.length === 0 || cortes.length === 0)
      return [];

    return cortes
      .map((corte) => {
        const encontrado = datosDpmtr.find(
          (d) => d.dpmtrdsid === corte.gbcucydnid,
        );
        const cantidad = encontrado?.dpmtrcant ?? 0;
        return { ...corte, gbcucycant: cantidad };
      })
      .filter((c) => (c.gbcucycant ?? 0) > 0);
  }, [cortes, datosDpmtr]);

  const totalBilletes = cortesActualizados.reduce(
    (acc, r) => acc + (r.gbcucycant ?? 0),
    0,
  );

  const fmt = (n: number) =>
    n.toLocaleString("es-BO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleImprimir = () => {
    const printContents = boucherRef.current?.innerHTML;
    const win = window.open("", "Print", "width=320,height=800");
    if (win && printContents) {
      win.document.write(`
        <html>
          <head>
            <title>Comprobante de depósito</title>
            <style>
              @media print {
                @page { size: 80mm auto; margin: 0; }
                body { margin: 0; padding: 0; }
              }
              * { font-family: monospace; }
              body { margin: 0; padding: 12px; }
              .ticket { width: 80mm; }
              h2 { text-align: center; font-size: 16px; margin-bottom: 8px; }
              .meta { font-size: 12px; margin-bottom: 8px; }
              .box { border: 1px solid #ddd; padding: 6px; margin-bottom: 8px; }
              table { width: 100%; font-size: 12px; border-collapse: collapse; }
              th, td { border-bottom: 1px dashed #ccc; padding: 6px 4px; }
              th { text-align: left; }
              td.num { text-align: right; }
              .total-row td { border-top: 1px solid #000; font-weight: bold; }
              .center { text-align: center; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      win.document.close();
      win.print();
      win.close();
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8">
      {/* Boucher Container */}
      <div
        ref={boucherRef}
        className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-green-700">
          ✓ DEPÓSITO EXITOSO
        </h2>

        <div className="mb-6 border-b pb-4">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Fecha:</span> {fecha}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Hora:</span> {hora}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Usuario:</span> {usuario}
          </p>
        </div>

        <div className="mb-6 border-b pb-4">
          <p className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            Total Billetes: {totalBilletes}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            {fmt(montoTotal)} {moneda}
          </p>
        </div>

        {cortesActualizados.length > 0 && (
          <div className="mb-6 text-sm text-left">
            <p className="font-bold mb-2 text-center">Detalle:</p>
            {cortesActualizados.map((c) => (
              <div key={c.gbcucygnid} className="flex justify-between mb-1">
                <span>{c.gbcucydesc}</span>
                <span className="font-semibold">
                  {c.gbcucycant} x {fmt(c.gbcucyvlor!)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="text-gray-600 text-xs mb-6">
          Gracias por usar nuestros servicios
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button
          onClick={handleImprimir}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-colors"
        >
          Imprimir
        </button>

        <button
          onClick={onCerrar}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
