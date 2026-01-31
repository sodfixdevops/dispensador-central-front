"use client";

import { gbcucy } from "@/app/lib/definitions";

interface Props {
  cortesActualizados: gbcucy[];
  montoTotal: number;
  onContar: () => void;
  onDepositar: () => void;
  onCancelar: () => void;
  disabled?: boolean;
  enviandoBanco?: boolean;
  mensajeBanco?: string;
}

export default function PantallaDetalle({
  cortesActualizados,
  montoTotal,
  onContar,
  onDepositar,
  onCancelar,
  disabled,
  enviandoBanco,
  mensajeBanco,
}: Props) {
  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100">
      {/* Encabezado - Mínimo */}
      <div className="bg-green-700 text-white px-4 py-3 text-center">
        <h1 className="text-xl md:text-2xl font-bold">Detalle de Depósito</h1>
      </div>

      {/* ⚠️ Estado del Banco */}
      {enviandoBanco && mensajeBanco && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 px-4 py-3 flex items-center gap-3">
          <div className="animate-spin">
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <span className="font-semibold text-sm md:text-base">
            {mensajeBanco}
          </span>
        </div>
      )}

      {/* Tabla - Scrollable, ocupa TODO el espacio */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
          <table className="w-full text-base md:text-lg">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-2 py-2 md:px-3 md:py-2 text-left font-bold text-sm md:text-base">
                  Código
                </th>
                <th className="px-2 py-2 md:px-3 md:py-2 text-left font-bold text-sm md:text-base">
                  Descripción
                </th>
                <th className="px-2 py-2 md:px-3 md:py-2 text-right font-bold text-sm md:text-base">
                  Cantidad
                </th>
                <th className="px-2 py-2 md:px-3 md:py-2 text-right font-bold text-sm md:text-base">
                  V. Unit.
                </th>
                <th className="px-2 py-2 md:px-3 md:py-2 text-right font-bold text-sm md:text-base">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              {cortesActualizados.map((corte) => (
                <tr
                  key={corte.gbcucygnid}
                  className="border-b hover:bg-green-50"
                >
                  <td className="px-2 py-2 md:px-3 md:py-2 font-semibold text-sm md:text-base">
                    {corte.gbcucydnid}
                  </td>
                  <td className="px-2 py-2 md:px-3 md:py-2 text-sm md:text-base">
                    {corte.gbcucydesc}
                  </td>
                  <td className="px-2 py-2 md:px-3 md:py-2 text-right font-semibold text-sm md:text-base">
                    {corte.gbcucycant ?? 0}
                  </td>
                  <td className="px-2 py-2 md:px-3 md:py-2 text-right text-sm md:text-base">
                    {corte.gbcucyvlor}
                  </td>
                  <td className="px-2 py-2 md:px-3 md:py-2 text-right font-bold text-sm md:text-base">
                    {((corte.gbcucycant ?? 0) * corte.gbcucyvlor!).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total - Compacto en una línea */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between border-b-4 border-green-800">
        <p className="text-lg md:text-xl font-bold">TOTAL A DEPOSITAR:</p>
        <p className="text-2xl md:text-3xl font-bold">
          {montoTotal.toFixed(2)}
        </p>
      </div>

      {/* Botones - Fixed Bottom */}
      <div className="bg-white border-t-2 border-gray-300 px-3 py-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch">
        <button
          onClick={onContar}
          disabled={disabled}
          className="px-8 sm:px-16 lg:px-20 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-base md:text-lg lg:text-xl font-bold rounded-lg transition-colors shadow-md flex-1 sm:flex-none"
        >
          Contar
        </button>

        <button
          onClick={onDepositar}
          disabled={disabled}
          className="px-8 sm:px-16 lg:px-20 py-3 sm:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-base md:text-lg lg:text-xl font-bold rounded-lg transition-colors shadow-md flex-1 sm:flex-none"
        >
          Depositar
        </button>

        <button
          onClick={onCancelar}
          disabled={disabled}
          className="px-8 sm:px-16 lg:px-20 py-3 sm:py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-base md:text-lg lg:text-xl font-bold rounded-lg transition-colors shadow-md flex-1 sm:flex-none"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
