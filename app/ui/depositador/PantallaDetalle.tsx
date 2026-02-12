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
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-[#002B76] to-[#024FD6]">
      {/* Encabezado - Mínimo */}
      <div className="bg-[#002B76] text-white px-4 py-3 text-center">
        <h1 className="text-xl md:text-2xl font-bold">Detalle de Depósito</h1>
      </div>

      {/* ⚠️ Estado del Banco */}
      {enviandoBanco && mensajeBanco && (
        <div className="bg-white/90 border-l-4 border-[#F26E29] text-[#002B76] px-4 py-3 flex items-center gap-3">
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

      {/* Tabla - Scrollable, ocupa TODO el espacio. padding reducido para evitar mucho espacio vacío */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 pb-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
          <table className="w-full text-sm md:text-sm">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-2 py-1 md:px-3 md:py-1 text-left font-bold text-xs sm:text-sm">
                  Código
                </th>
                <th className="px-2 py-1 md:px-3 md:py-1 text-left font-bold text-xs sm:text-sm">
                  Descripción
                </th>
                <th className="px-2 py-1 md:px-3 md:py-1 text-right font-bold text-xs sm:text-sm">
                  Cantidad
                </th>
                <th className="px-2 py-1 md:px-3 md:py-1 text-right font-bold text-xs sm:text-sm">
                  V. Unit.
                </th>
                <th className="px-2 py-1 md:px-3 md:py-1 text-right font-bold text-xs sm:text-sm">
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
                  <td className="px-2 py-1 md:px-3 md:py-1 font-semibold text-xs sm:text-sm">
                    {corte.gbcucydnid}
                  </td>
                  <td className="px-2 py-1 md:px-3 md:py-1 text-xs sm:text-sm">
                    {corte.gbcucydesc}
                  </td>
                  <td className="px-2 py-1 md:px-3 md:py-1 text-right font-semibold text-xs sm:text-sm">
                    {corte.gbcucycant ?? 0}
                  </td>
                  <td className="px-2 py-1 md:px-3 md:py-1 text-right text-xs sm:text-sm">
                    {corte.gbcucyvlor}
                  </td>
                  <td className="px-2 py-1 md:px-3 md:py-1 text-right font-bold text-xs sm:text-sm">
                    {((corte.gbcucycant ?? 0) * corte.gbcucyvlor!).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total - Compacto en una línea */}
      <div className="bg-[#001f4f] text-white px-4 py-3 flex items-center justify-between border-b-4 border-[#002B76]">
        <p className="text-lg md:text-xl font-bold">TOTAL A DEPOSITAR:</p>
        <p className="text-2xl md:text-3xl font-bold">
          {montoTotal.toFixed(2)}
        </p>
      </div>

      {/* Botones - parte del layout (no sticky) y con padding reducido */}
      <div className="bg-white border-t-2 border-gray-300 px-3 py-3 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch">
        <button
          onClick={onContar}
          disabled={disabled}
          className="flex-1 px-4 sm:px-8 py-2 sm:py-3 bg-[#F26E29] hover:bg-[#d65a22] disabled:bg-gray-400 text-white text-sm md:text-base font-bold rounded-lg transition-colors shadow-md"
        >
          Contar
        </button>

        <button
          onClick={onDepositar}
          disabled={disabled}
          className="flex-1 px-4 sm:px-8 py-2 sm:py-3 bg-[#F26E29] hover:bg-[#d65a22] disabled:bg-gray-400 text-white text-sm md:text-base font-bold rounded-lg transition-colors shadow-md"
        >
          Depositar
        </button>

        <button
          onClick={onCancelar}
          disabled={disabled}
          className="flex-1 px-4 sm:px-8 py-2 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm md:text-base font-bold rounded-lg transition-colors shadow-md"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
