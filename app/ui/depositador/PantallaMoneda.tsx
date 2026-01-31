"use client";

import { TrconData } from "@/app/lib/definitions";

interface Props {
  monedasDisponibles: TrconData[];
  loading: boolean;
  onSeleccionar: (codigo: number, abreviacion: string) => void;
  advertenciaApiBank?: boolean;
}

export default function PantallaMoneda({
  monedasDisponibles,
  loading,
  onSeleccionar,
  advertenciaApiBank,
}: Props) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-4">
      {/* ⚠️ Advertencia API del Banco */}
      {advertenciaApiBank && (
        <div className="absolute top-4 left-4 right-4 bg-yellow-100 text-yellow-800 p-4 rounded-md border-l-4 border-yellow-500 text-sm sm:text-base">
          <p className="font-semibold">
            ⚠️ Advertencia: APIs del Banco no cargadas
          </p>
          <p className="text-xs sm:text-sm">
            El sistema continuará funcionando sin auditoría de API.
          </p>
        </div>
      )}

      <div className="text-center">
        {" "}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-8">
          Seleccione la Moneda
        </h1>
        {monedasDisponibles.length === 0 ? (
          <p className="text-2xl text-gray-600">Cargando monedas...</p>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-center sm:gap-8">
            {monedasDisponibles.map((m) => (
              <button
                key={m.correlativo}
                onClick={() => onSeleccionar(m.correlativo!, m.abreviacion!)}
                disabled={loading}
                className="px-8 py-6 sm:px-12 sm:py-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-2xl sm:text-3xl font-bold rounded-lg transition-colors shadow-lg"
              >
                <div>{m.descripcion}</div>
                <div className="text-lg sm:text-xl mt-2 font-semibold">
                  ({m.abreviacion})
                </div>
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="mt-8">
            <p className="text-xl text-gray-700">
              Aplicando bloqueo de moneda...
            </p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
