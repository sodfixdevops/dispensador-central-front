"use client";

import { TrconData } from "@/app/lib/definitions";
import { cerrarSesionControlada } from "@/app/lib/session-control-client";

interface Props {
  monedasDisponibles: TrconData[];
  loading: boolean;
  onSeleccionar: (codigo: number, abreviacion: string) => void;
  advertenciaApiBank?: boolean;
  disabled?: boolean;
}

export default function PantallaMoneda({
  monedasDisponibles,
  loading,
  onSeleccionar,
  advertenciaApiBank,
  disabled,
}: Props) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-[#002B76] to-[#024FD6] px-4">
      {/* Botón SALIR en esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => cerrarSesionControlada("/login")}
          className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-md hover:bg-white/20 text-sm"
        >
          SALIR
        </button>
      </div>
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
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
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
                disabled={loading || disabled}
                className="px-8 py-6 sm:px-12 sm:py-8 bg-[#F26E29] hover:bg-[#d65a22] disabled:bg-gray-400 text-white text-2xl sm:text-3xl font-bold rounded-lg transition-colors shadow-lg"
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
            <p className="text-xl text-white">Aplicando bloqueo de moneda...</p>
            <div className="flex justify-center mt-4">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-4"
                style={{ borderColor: "#F26E29" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
