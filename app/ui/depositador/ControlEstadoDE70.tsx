"use client";

import { useEffect, useRef, useState } from "react";

import {
  checkBackendThenDevice,
  DE70_ActionRestaurador,
} from "@/app/lib/de70-actions";

interface Props {
  apiUrl?: string;
  onEstadoChange?: (ok: boolean) => void;
}

export default function ControlEstadoDE70({ apiUrl, onEstadoChange }: Props) {
  const [estado, setEstado] = useState<"checking" | "ok" | "down">("checking");
  const [detalleRecuperacion, setDetalleRecuperacion] = useState("");
  const [motivo, setMotivo] = useState<"backend" | "device" | "unknown">(
    "unknown",
  );
  const inFlightRef = useRef(false);
  const initialPhaseRef = useRef(true);
  const restoreAttemptedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const aplicarEstado = (
      siguiente: "checking" | "ok" | "down",
      nuevoMotivo?: "backend" | "device" | "unknown",
      detalle?: string,
    ) => {
      if (cancelled) return;
      setEstado(siguiente);
      if (nuevoMotivo) setMotivo(nuevoMotivo);
      if (detalle !== undefined) setDetalleRecuperacion(detalle);
      onEstadoChange?.(siguiente === "ok");
    };

    const verificarHealth = async (isInitial = false) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      try {
        if (isInitial) aplicarEstado("checking", "unknown", "");

        if (!apiUrl) {
          aplicarEstado(
            "down",
            "device",
            "No hay API del dispositivo configurada.",
          );
          return;
        }

        const comm = await checkBackendThenDevice(apiUrl);

        if (!comm.backendOk) {
          aplicarEstado(
            "down",
            "backend",
            "El servidor backend no responde. Contacte soporte.",
          );
          return;
        }

        if (!comm.deviceOk) {
          aplicarEstado(
            "down",
            "device",
            "La API del dispositivo no responde. Verifique la conexión.",
          );
          return;
        }

        // Solo al inicio: ejecutar restaurador antes de habilitar el flujo
        if (initialPhaseRef.current && !restoreAttemptedRef.current) {
          restoreAttemptedRef.current = true;
          const restore = await DE70_ActionRestaurador(apiUrl);
          if (restore?.error) {
            aplicarEstado(
              "down",
              "device",
              String(restore.error || "No se pudo restaurar el DE70"),
            );
            return;
          }
        }

        initialPhaseRef.current = false;
        aplicarEstado("ok", "unknown", "");
      } catch (error) {
        console.error("Error al verificar health:", error);
        aplicarEstado("down", "unknown", "No se pudo validar la comunicación.");
      } finally {
        inFlightRef.current = false;
      }
    };

    verificarHealth(true);

    const intervalId = setInterval(() => {
      verificarHealth(false);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [apiUrl, onEstadoChange]);

  if (estado === "ok") return null;

  const mensajeTitulo =
    estado === "checking"
      ? "Verificando comunicacion"
      : motivo === "backend"
        ? "Sin comunicacion con el backend"
        : motivo === "device"
          ? "Sin comunicacion con el DE70"
          : "Sin comunicacion con el servicio";
  const mensajeDetalle =
    estado === "checking"
      ? "Validando conexion con los servicios. Espere un momento."
      : detalleRecuperacion ||
        "No se puede continuar con la transaccion hasta que se restablezca la comunicacion.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-red-200 p-8 max-w-md w-[90%] text-center">
        <div className="text-red-700 text-2xl font-bold mb-3">
          {mensajeTitulo}
        </div>
        <p className="text-gray-700 text-base mb-4">{mensajeDetalle}</p>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          <span>
            {estado === "checking"
              ? "Verificando conexion..."
              : "Reintentando conexion..."}
          </span>
        </div>
        {detalleRecuperacion && (
          <div className="mt-4 text-xs text-amber-700">
            {detalleRecuperacion}
          </div>
        )}
      </div>
    </div>
  );
}
