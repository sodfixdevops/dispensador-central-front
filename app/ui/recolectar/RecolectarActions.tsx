"use client";
interface RecolectarActionsProps {
  estado: number;
  onGenerarSolicitud: () => void;
  onRecolectar: () => void;
}

export default function RecolectarActions({
  estado,
  onGenerarSolicitud,
  onRecolectar,
}: RecolectarActionsProps) {
  if (estado === 1) {
    return (
      <div className="flex justify-end">
        <button
          onClick={onGenerarSolicitud}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          Generar Solicitud
          <span className="text-lg">+</span>
        </button>
      </div>
    );
  }

  if (estado === 3) {
    return (
      <div className="flex justify-end">
        <button
          onClick={onRecolectar}
          className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500"
        >
          Recolectar
          <span className="text-lg">≡</span>
        </button>
      </div>
    );
  }

  return null;
}
