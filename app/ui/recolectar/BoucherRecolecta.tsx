"use client";
import type { Dptrn } from "@/app/lib/definitions";

interface BoucherRecolectaProps {
  numeroDesembolso: number;
  usuario: string;
  transacciones: Dptrn[];
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
        <title>Boucher Recolección</title>
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
        <h2>RECOLECCIÓN DE EFECTIVO</h2>

        <p>N° Desembolso: ${numeroDesembolso}</p>
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

  const w = window.open("", "_blank");
  if (!w) return;

  w.document.write(html);
  w.document.close();
}
