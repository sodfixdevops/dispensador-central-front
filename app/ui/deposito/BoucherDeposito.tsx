"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
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

export default function BoucherDeposito({
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
        return {
          ...corte,
          gbcucycant: cantidad,
        };
      })
      .filter((c) => (c.gbcucycant ?? 0) > 0);
  }, [cortes, datosDpmtr]);

  const totalBilletes = cortesActualizados.reduce(
    (acc, r) => acc + (r.gbcucycant ?? 0),
    0,
  );
  const totalImporte = montoTotal;

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
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }

              * {
                font-family: monospace;
              }

              body {
                margin: 0;
                padding: 12px;
              }

              .ticket {
                width: 80mm;
              }

              h2 {
                text-align: center;
                font-size: 16px;
                margin-bottom: 8px;
              }

              .meta {
                font-size: 12px;
                margin-bottom: 8px;
              }

              .box {
                border: 1px solid #ddd;
                padding: 6px;
                margin-bottom: 8px;
              }

              table {
                width: 100%;
                font-size: 12px;
                border-collapse: collapse;
              }

              th, td {
                border-bottom: 1px dashed #ccc;
                padding: 6px 4px;
              }

              th {
                text-align: left;
              }

              td.num {
                text-align: right;
              }

              .total-row td {
                border-top: 1px solid #000;
                font-weight: bold;
              }

              .center {
                text-align: center;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      win.print();
      win.onafterprint = () => win.close(); // 👈 se cierra al terminar
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-md shadow ticket" ref={boucherRef}>
        <h2>Comprobante de depósito</h2>

        <div className="meta box">
          <div>
            <strong>Usuario:</strong> {usuario}
          </div>
          <div>
            <strong>Fecha:</strong> {fecha}
          </div>
          <div>
            <strong>Hora:</strong> {hora}
          </div>
        </div>
        <div className="meta box center">
          <strong>Moneda:</strong> {moneda}
        </div>

        <table>
          <thead>
            <tr>
              <th>Denominación</th>
              <th className="num">Cantidad</th>
              <th className="num">Valor</th>
            </tr>
          </thead>
          <tbody>
            {cortesActualizados.map((c) => (
              <tr key={c.gbcucygnid}>
                <td>
                  {moneda} {fmt(c.gbcucyvlor ?? 0)}
                </td>
                <td className="num">{c.gbcucycant}</td>
                <td className="num">
                  {moneda} {fmt((c.gbcucyvlor ?? 0) * (c.gbcucycant ?? 0))}
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td>TOTAL</td>
              <td className="num">{totalBilletes}</td>
              <td className="num">
                {moneda} {fmt(totalImporte)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="center" style={{ marginTop: 8 }}>
          ¡Gracias por su depósito!
        </div>
      </div>

      <div className="absolute bottom-8 flex gap-2">
        <button
          onClick={handleImprimir}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Imprimir
        </button>
        <button
          onClick={onCerrar}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
