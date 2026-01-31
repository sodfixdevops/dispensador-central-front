"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import type { Dptrn, DispositivoData } from "@/app/lib/definitions";
import {
  fetchTransaccionesEstado,
  generarSolicitudDesembolso,
  recolectarDesembolso,
} from "@/app/lib/transaccion-actions";
import { fetchDispositivos } from "@/app/lib/dispositivo-actions";

import RecolectarHeader from "@/app/ui/recolectar/RecolectarHeader";
import RecolectarTable from "@/app/ui/recolectar/RecolectarTable";
import RecolectarActions from "@/app/ui/recolectar/RecolectarActions";
import { imprimirBoucherRecolecta } from "@/app/ui/recolectar/BoucherRecolecta";

export default function PageRecolectar() {
  const { data: session } = useSession();

  const [dispositivos, setDispositivos] = useState<DispositivoData[]>([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState<
    number | null
  >(null);
  const [transacciones, setTransacciones] = useState<Dptrn[]>([]);
  const [estadoActual, setEstadoActual] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  /* =========================
     CARGA CON PRIORIDAD
     ========================= */
  const cargarTransacciones = async (dispositivo: number) => {
    setLoading(true);

    // Prioridad 3 → 2 → 1, filtrado por dispositivo
    const estado3 = await fetchTransaccionesEstado(3, dispositivo);
    if (estado3.length > 0) {
      setTransacciones(estado3);
      setEstadoActual(3);
      setLoading(false);
      return;
    }

    const estado2 = await fetchTransaccionesEstado(2, dispositivo);
    if (estado2.length > 0) {
      setTransacciones(estado2);
      setEstadoActual(2);
      setLoading(false);
      return;
    }

    const estado1 = await fetchTransaccionesEstado(1, dispositivo);
    setTransacciones(estado1);
    setEstadoActual(1);
    setLoading(false);
  };

  useEffect(() => {
    const cargarDispositivos = async () => {
      const data = await fetchDispositivos();
      setDispositivos(data);
    };
    cargarDispositivos();
  }, []);

  useEffect(() => {
    if (dispositivoSeleccionado !== null) {
      cargarTransacciones(dispositivoSeleccionado);
    }
  }, [dispositivoSeleccionado]);

  /* =========================
     ACCIONES
     ========================= */
  const handleGenerarSolicitud = async () => {
    if (!session?.user?.username) {
      alert("Sesión inválida.");
      return;
    }

    if (dispositivoSeleccionado === null) {
      alert("Debe seleccionar un dispositivo.");
      return;
    }

    const resp = await generarSolicitudDesembolso(
      session.user.username,
      dispositivoSeleccionado,
    );

    if (!resp.success) {
      alert(resp.message);
      return;
    }

    alert(
      `Solicitud generada correctamente\nN° Desembolso: ${resp.ndes}\nCantidad: ${resp.cantidad}`,
    );

    await cargarTransacciones(dispositivoSeleccionado);
  };

  const handleRecolectar = async () => {
    if (transacciones.length === 0) return;

    const nroDesembolso = transacciones[0].dptrnndes;
    if (!nroDesembolso) return;

    const resp = await recolectarDesembolso(nroDesembolso);

    if (!resp.success) {
      alert(resp.message);
      return;
    }

    imprimirBoucherRecolecta({
      numeroDesembolso: nroDesembolso,
      usuario: session?.user?.username || "",
      transacciones,
    });

    if (dispositivoSeleccionado !== null) {
      await cargarTransacciones(dispositivoSeleccionado);
    }
  };

  if (!session?.user?.username) {
    return null;
  }

  /* =========================
     RENDER
     ========================= */

  // Pantalla de selección de dispositivo
  if (dispositivoSeleccionado === null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Seleccionar Dispositivo para Recolectar
          </h1>
        </div>

        {dispositivos.length === 0 ? (
          <p className="text-center text-gray-500">Cargando dispositivos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dispositivos.map((disp) => (
              <div
                key={disp.addispcode}
                onClick={() => setDispositivoSeleccionado(disp.addispcode)}
                className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {disp.addispnomb}
                </h3>
                <p className="text-sm text-gray-600">
                  Código: {disp.addispcode}
                </p>
                <p className="text-sm text-gray-600">
                  Estado: {disp.addispstat === 1 ? "Activo" : "Inactivo"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pantalla de recolección (dispositivo seleccionado)
  const dispositivoActual = dispositivos.find(
    (d) => d.addispcode === dispositivoSeleccionado,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm text-gray-500">Recolectando de:</h2>
          <h1 className="text-2xl font-bold text-gray-800">
            {dispositivoActual?.addispnomb ||
              `Dispositivo ${dispositivoSeleccionado}`}
          </h1>
        </div>
        <button
          onClick={() => {
            setDispositivoSeleccionado(null);
            setTransacciones([]);
          }}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          ← Volver a Dispositivos
        </button>
      </div>

      <RecolectarHeader usuario={session.user.username} estado={estadoActual} />

      <RecolectarActions
        estado={estadoActual}
        onGenerarSolicitud={handleGenerarSolicitud}
        onRecolectar={handleRecolectar}
      />

      <RecolectarTable transacciones={transacciones} />

      {loading && <p className="text-center text-gray-500">Cargando...</p>}
    </div>
  );
}
