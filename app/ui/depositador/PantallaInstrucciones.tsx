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
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 px-6 py-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
          {monedaAbrev}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed">
            Coloque el efectivo en la parte donde indica el agente, una vez
            listo presione en{" "}
            <span className="font-bold text-green-600">Contar</span>.
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 leading-relaxed mt-6">
            Caso contrario presione en{" "}
            <span className="font-bold text-red-600">Cancelar</span> la
            operación.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center">
          <button
            onClick={onContar}
            disabled={disabled}
            className="px-12 py-6 sm:px-16 sm:py-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-2xl sm:text-3xl font-bold rounded-lg transition-colors shadow-lg"
          >
            Contar
          </button>

          <button
            onClick={onCancelar}
            disabled={disabled}
            className="px-12 py-6 sm:px-16 sm:py-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-2xl sm:text-3xl font-bold rounded-lg transition-colors shadow-lg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
