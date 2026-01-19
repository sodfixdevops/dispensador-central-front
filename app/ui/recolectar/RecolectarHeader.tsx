"use client";
interface RecolectarHeaderProps {
  usuario: string;
  estado: number;
}

export default function RecolectarHeader({
  usuario,
  estado,
}: RecolectarHeaderProps) {
  const getDescripcionEstado = () => {
    switch (estado) {
      case 1:
        return "Mostrando registros en estado de depósito";
      case 2:
        return "Registros pendientes de autorización";
      case 3:
        return "Registros pendientes a recolección";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-center">
        RECOLECTAR EFECTIVO
      </h1>

      <div className="flex justify-center">
        <div className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          Usuario actual: {usuario}
        </div>
      </div>

      <p className="text-center text-gray-600">{getDescripcionEstado()}</p>
    </div>
  );
}
