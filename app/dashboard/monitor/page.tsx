"use client";

import { useEffect, useState } from "react";
import { fetchDispositivos } from "@/app/lib/dispositivo-actions";
import { DispositivoData } from "@/app/lib/definitions";
import MonitorTable from "@/app/ui/monitor/table";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function MonitorPage() {
  const [dispositivos, setDispositivos] = useState<DispositivoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDispositivos = async () => {
      setLoading(true);
      const data = await fetchDispositivos();
      setDispositivos(data);
      setLoading(false);
    };

    cargarDispositivos();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const data = await fetchDispositivos();
    setDispositivos(data);
    setLoading(false);
  };

  return (
    <main>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Monitor de Dispositivos</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            <ArrowPathIcon
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">Cargando dispositivos...</p>
            </div>
          ) : (
            <MonitorTable dispositivos={dispositivos} />
          )}
        </div>
      </div>
    </main>
  );
}
