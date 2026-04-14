"use client";
import type { Dptrn } from "@/app/lib/definitions";

interface BoucherRecolectaProps {
  numeroDesembolso: number;
  usuario: string;
  transacciones: Dptrn[];
}

interface BoucherSolicitudRecolectaProps {
  numeroDesembolso: number;
  usuario: string;
  dispositivo: number;
  dispositivoNombre?: string;
  moneda: number;
  detalle: { valor: number; piezas: number; importe: number }[];
  totalPiezas: number;
  totalImporte: number;
}

const formatImporte = (monto: number) =>
  Number(monto || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function openAndPrint(html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export function imprimirBoucherSolicitudRecolecta({
  numeroDesembolso,
  usuario,
  dispositivo,
  dispositivoNombre,
  moneda,
  detalle,
  totalPiezas,
  totalImporte,
}: BoucherSolicitudRecolectaProps) {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-BO");
  const hora = ahora.toLocaleTimeString("es-BO");
  const prefijoMoneda = moneda === 1 ? "BOB" : "USD";
  const terminalNombre = (dispositivoNombre || "").trim().slice(0, 30);

  const filas = detalle
    .map(
      (d) => `
        <tr>
          <td class="col-denom">${prefijoMoneda}${d.valor}</td>
          <td class="col-counter">${d.piezas}</td>
          <td class="col-importe">${formatImporte(d.importe)}</td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>Voucher de Recoleccion</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 2mm; }
            body { margin: 0; padding: 0; }
          }
          body { font-family: monospace; margin: 0; padding: 0; }
          .ticket {
            width: 76mm;
            font-size: 12px;
            margin: 0;
            padding: 10px 1.5mm 22px 2mm;
            box-sizing: border-box;
          }
          h2 { text-align: center; margin: 4px 0 8px; }
          .meta { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; table-layout: fixed; }
          th, td { padding: 4px 2px; border-bottom: 1px dashed #ccc; vertical-align: bottom; }
          th { text-align: left; }
          th.col-denom, td.col-denom { width: 24%; padding-left: 3px; }
          th.col-counter, td.col-counter { width: 34%; text-align: right; }
          th.col-importe, td.col-importe {
            width: 42%;
            text-align: right;
            white-space: nowrap;
            padding-right: 2px;
          }
          th.col-counter {
            font-size: 11px;
            line-height: 1.05;
            white-space: normal;
          }
          .right { text-align: right; }
          .total td { border-top: 1px solid #000; border-bottom: 0; font-weight: bold; }
          .bottom-space { height: 16px; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h2>VOUCHER DE RECOLECCION</h2>
          <div class="meta">NRO DESEMBOLSO: ${numeroDesembolso}</div>
          <div class="meta">MACHINE NRO: ${dispositivo}</div>
          ${terminalNombre ? `<div class="meta">TERMINAL: ${terminalNombre}</div>` : ""}
          <div class="meta">DATE-TIME: ${fecha} ${hora}</div>
          <div class="meta">RECOLECTOR: ${usuario}</div>

          <table>
            <thead>
              <tr>
                <th class="col-denom">DENOM</th>
                <th class="col-counter">COUNTERS (Piezas)</th>
                <th class="col-importe">IMPORTE</th>
              </tr>
            </thead>
            <tbody>
              ${filas}
              <tr class="total">
                <td class="col-denom">TOTALES</td>
                <td class="col-counter">${totalPiezas}</td>
                <td class="col-importe">${formatImporte(totalImporte)}</td>
              </tr>
            </tbody>
          </table>
          <div class="bottom-space"></div>
        </div>

        <script>
          window.print();
          window.close();
        </script>
      </body>
    </html>
  `;

  openAndPrint(html);
}

export function imprimirBoucherRecolecta({
  numeroDesembolso,
  usuario,
  transacciones,
}: BoucherRecolectaProps) {
  const fecha = new Date().toLocaleDateString("es-BO");
  const hora = new Date().toLocaleTimeString("es-BO");

  const moneda =
    transacciones.length > 0 && transacciones[0].dptrncmon === 1
      ? "BOB"
      : "USD";

  const total = transacciones.reduce((acc, t) => acc + Number(t.dptrnimpo), 0);

  const filas = transacciones
    .map(
      (t) => `
        <tr>
          <td>${t.dptrnntra.toString().padStart(6, "0")}</td>
          <td>${new Date(t.dptrnftra).toLocaleDateString("es-BO")}</td>
          <td style="text-align:right">
            ${Number(t.dptrnimpo).toFixed(2)} ${moneda}
          </td>
        </tr>
      `,
    )
    .join("");

  const html = `
    <html>
      <head>
        <title>Boucher Recoleccion</title>
        <style>
          body {
            font-family: monospace;
            width: 280px;
            font-size: 12px;
          }
          h2 {
            text-align: center;
            margin: 6px 0;
          }
          p {
            margin: 2px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          th {
            border-bottom: 1px dashed #000;
          }
          td, th {
            padding: 2px 0;
          }
          .total {
            border-top: 1px dashed #000;
            font-weight: bold;
          }
          .firma {
            margin-top: 28px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h2>RECOLECCION DE EFECTIVO</h2>

        <p>Nro Desembolso: ${numeroDesembolso}</p>
        <p>Fecha: ${fecha} ${hora}</p>
        <p>Usuario: ${usuario}</p>

        <table>
          <thead>
            <tr>
              <th>Tran.</th>
              <th>Fecha</th>
              <th style="text-align:right">Importe</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
            <tr class="total">
              <td colspan="2">TOTAL</td>
              <td style="text-align:right">
                ${total.toFixed(2)} ${moneda}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="firma">
          <p>Firma del Recolector</p>
          <p>______________________________</p>
        </div>

        <script>
          window.print();
          window.close();
        </script>
      </body>
    </html>
  `;

  openAndPrint(html);
}
