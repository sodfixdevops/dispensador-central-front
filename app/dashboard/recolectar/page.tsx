"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import type { Dptrn } from "@/app/lib/definitions";
import {
  fetchTransaccionesEstado,
  generarSolicitudDesembolso,
  recolectarDesembolso,
} from "@/app/lib/transaccion-actions";

import RecolectarHeader from "@/app/ui/recolectar/RecolectarHeader";
import RecolectarTable from "@/app/ui/recolectar/RecolectarTable";
import RecolectarActions from "@/app/ui/recolectar/RecolectarActions";
import { imprimirBoucherRecolecta } from "@/app/ui/recolectar/BoucherRecolecta";

export default function PageRecolectar() {
  const { data: session } = useSession();

  const [transacciones, setTransacciones] = useState<Dptrn[]>([]);
  const [estadoActual, setEstadoActual] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  /* =========================
     CARGA CON PRIORIDAD
     ========================= */
  const cargarTransacciones = async () => {
    setLoading(true);

    // Prioridad 3 → 2 → 1
    const estado3 = await fetchTransaccionesEstado(3);
    if (estado3.length > 0) {
      setTransacciones(estado3);
      setEstadoActual(3);
      setLoading(false);
      return;
    }

    const estado2 = await fetchTransaccionesEstado(2);
    if (estado2.length > 0) {
      setTransacciones(estado2);
      setEstadoActual(2);
      setLoading(false);
      return;
    }

    const estado1 = await fetchTransaccionesEstado(1);
    setTransacciones(estado1);
    setEstadoActual(1);
    setLoading(false);
  };

  useEffect(() => {
    cargarTransacciones();
  }, []);

  /* =========================
     ACCIONES
     ========================= */
  const handleGenerarSolicitud = async () => {
    if (!session?.user?.username) {
      alert("Sesión inválida.");
      return;
    }

    // Ajusta si el dispositivo viene desde session
    const dispositivo = 1;

    const resp = await generarSolicitudDesembolso(
      session.user.username,
      dispositivo,
    );

    if (!resp.success) {
      alert(resp.message);
      return;
    }

    alert(
      `Solicitud generada correctamente\nN° Desembolso: ${resp.ndes}\nCantidad: ${resp.cantidad}`,
    );

    await cargarTransacciones();
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

    await cargarTransacciones();
  };

  if (!session?.user?.username) {
    return null;
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="space-y-6">
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
