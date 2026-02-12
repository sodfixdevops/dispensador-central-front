"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dpmtr, gbcucy } from "@/app/lib/definitions";
import { FetchCortes } from "@/app/lib/de70-actions";

interface Props {
  fecha: string;
  hora: string;
  usuario: string;
  cuenta: string;
  montoTotal: number;
  moneda: string;
  datosDpmtr: dpmtr[];
  apiUrl: string;
  onCerrar: () => void;
  numeroTransaccion?: string;
}

export default function BoucherDepositador({
  fecha,
  hora,
  usuario,
  cuenta,
  montoTotal,
  moneda,
  datosDpmtr,
  apiUrl,
  onCerrar,
  numeroTransaccion,
}: Props) {
  const boucherRef = useRef<HTMLDivElement | null>(null);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#002B76] to-[#024FD6] px-4 py-6">
      <div className="flex-1 w-full flex flex-col md:flex-row items-start md:justify-between py-4 gap-6">
        <div className="w-full md:flex-1 flex items-start md:items-start justify-start overflow-y-auto">
          <div
            ref={boucherRef}
            className="bg-white rounded-md shadow-lg p-3 max-w-[220px] md:max-w-[320px] w-full text-left font-mono text-xs md:text-sm leading-tight mx-0"
          >
            <div className="ticket text-xs md:text-sm">
              <div className="center text-sm md:text-base font-bold">
                BANCO DE CREDITO
              </div>
              <div className="center text-[11px] md:text-sm">
                PARA MAYOR INFORMACION
              </div>
              <div className="center text-[11px] md:text-sm">
                TELF:2114141 - 3114141 - 4114141
              </div>
              <div className="center text-[11px] md:text-sm">
                WEB: WWW.BCP.COM.BO
              </div>
              <div
                className="text-[11px] md:text-sm"
                style={{ marginTop: 6, marginBottom: 4 }}
              >
                FECHA: {fecha} HORA: {hora}
              </div>

              <div
                className="text-[11px] md:text-sm"
                style={{ marginBottom: 4 }}
              >
                NO.OPE: {numeroTransaccion || ""}
              </div>

              <div className="center font-bold text-sm md:text-base mt-1">
                DEPOSITO
              </div>

              <div className="text-[11px] md:text-sm" style={{ marginTop: 6 }}>
                Usuario : {usuario}
              </div>
              <div className="text-[11px] md:text-sm">
                NRO CTA.: {cuenta || "-"}
              </div>
              <div className="text-[11px] md:text-sm">BILLETERA BCP</div>

              <div className="text-[11px] md:text-sm" style={{ marginTop: 6 }}>
                MONTO: {fmt(montoTotal)} {moneda}
              </div>
              <div className="text-[11px] md:text-sm">TIPO DE CAMBIO: 0</div>

              <div
                className="text-[11px] md:text-sm"
                style={{ marginTop: 6, fontWeight: 700 }}
              >
                VALOR BILLETES MONTO
              </div>

              <div className="text-[11px] md:text-sm">
                {cortesActualizados.map((c) => {
                  const v = c.gbcucyvlor ?? 0;
                  const q = c.gbcucycant ?? 0;
                  const subtotal = v * q;
                  return (
                    <div
                      key={c.gbcucygnid}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        BS {v} X {q} =
                      </div>
                      <div>{fmt(subtotal)}</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] md:text-sm" style={{ marginTop: 6 }}>
                BILLETES DEPOSITADOS: {totalBilletes}
              </div>

              <div className="text-[11px] md:text-sm" style={{ marginTop: 6 }}>
                ------------------------------------------
              </div>
              <div
                className="center text-[11px] md:text-sm"
                style={{ marginTop: 6 }}
              >
                MULTIPLES CANALES DE ATENCION.
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex md:flex-col md:items-stretch md:w-56 lg:w-64 print:hidden md:justify-center">
          <button
            onClick={handleImprimir}
            className="w-full px-4 py-3 bg-[#F26E29] hover:bg-[#d65a22] text-white text-base font-bold rounded-lg transition-colors mb-4"
          >
            Imprimir
          </button>

          <button
            onClick={onCerrar}
            className="w-full px-4 py-3 bg-[#F26E29] hover:bg-[#d65a22] text-white text-base font-bold rounded-lg transition-colors mb-4"
          >
            Continuar
          </button>
        </div>
      </div>

      <div
        className="fixed left-0 right-0 z-40 print:hidden md:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <div className="mx-auto flex gap-4 max-w-[760px] w-full px-4">
          <button
            onClick={handleImprimir}
            className="flex-1 min-w-0 px-4 py-3 bg-[#F26E29] hover:bg-[#d65a22] text-white text-base font-bold rounded-lg transition-colors"
          >
            Imprimir
          </button>

          <button
            onClick={onCerrar}
            className="flex-1 min-w-0 px-4 py-3 bg-[#F26E29] hover:bg-[#d65a22] text-white text-base font-bold rounded-lg transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
