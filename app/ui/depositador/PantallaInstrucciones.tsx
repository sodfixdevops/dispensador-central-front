"use client";

interface Props {
  monedaAbrev: string;
  onContar: () => void;
  onCancelar: () => void;
  disabled?: boolean;
}

export default function PantallaInstrucciones({
  monedaAbrev,
  onContar,
  onCancelar,
  disabled,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#002B76] to-[#024FD6]">
      {/* Contenido central scrollable */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
        <div className="text-center max-w-2xl w-full">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8">
            {monedaAbrev}
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed">
              Coloque el efectivo en la parte donde indica el agente, una vez
              listo presione en{" "}
              <span className="font-bold text-[#F26E29]">Contar</span>.
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 leading-relaxed mt-6">
              Caso contrario presione en{" "}
              <span className="font-bold text-red-600">Cancelar</span> la
              operación.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de botones fija en el fondo para que siempre estén accesibles en pantallas apaisadas pequeñas */}
      <div
        className="fixed left-0 right-0 bottom-4 z-40 print:hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
      >
        <div className="mx-auto max-w-4xl w-full px-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onContar}
              disabled={disabled}
              className="flex-1 min-w-0 px-6 py-4 bg-[#F26E29] hover:bg-[#d65a22] disabled:bg-gray-400 text-white text-xl sm:text-2xl font-bold rounded-lg transition-colors shadow-lg"
            >
              Contar
            </button>

            <button
              onClick={onCancelar}
              disabled={disabled}
              className="flex-1 min-w-0 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-xl sm:text-2xl font-bold rounded-lg transition-colors shadow-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
