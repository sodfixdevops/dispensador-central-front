"use server";

import type { Dptrn, RegistrarTransaccionDto } from "./definitions"; // o donde esté tu interface
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function registrarTransaccion(data: RegistrarTransaccionDto) {
  const response = await fetch(`${API_URL}/transaccion/registrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return {
      success: false,
      message: err.message || "Error al registrar transacción",
    };
  }

  // Intentar devolver el JSON que retorne el backend para que el caller
  // pueda leer el número de transacción u otros datos.
  try {
    return await response.json();
  } catch (err) {
    return {
      success: true,
      message: "Transacción registrada correctamente",
    };
  }
}

export async function autorizarORechazarSolicitud(
  numeroDesembolso: number,
  usuario: string,
  estado: number, // 2: aprobar, 3: rechazar
) {
  const response = await fetch(`${API_URL}/transaccion/autorizar-o-rechazar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numeroDesembolso,
      usuario,
      estado,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    return {
      success: false,
      message: err.message || "Error al procesar solicitud",
    };
  }

  return await response.json(); // contiene { success, message }
}

export async function fetchTransaccionesReporte(
  fechaInicio: Date,
  fechaFinal: Date,
  estado: number,
): Promise<Dptrn[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/transaccion/reporte-transacciones`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        fechaInicio,
        fechaFinal,
        estado,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error al obtener el reporte");
  }

  return await response.json();
}

/** POST /transaccion/estado/:stat */
export async function fetchTransaccionesEstado(
  stat: number,
  dispositivo?: number,
): Promise<Dptrn[]> {
  try {
    const response = await fetch(`${API_URL}/transaccion/estado/${stat}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({ dispositivo }),
    });

    if (!response.ok) {
      console.warn(
        "fetchTransaccionesEstado: response not ok",
        response.status,
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("fetchTransaccionesEstado: fetch failed", error);
    return [];
  }
}

/** POST /transaccion/solicitar-desembolso */
export async function generarSolicitudDesembolso(
  usuario: string,
  dispositivo: number,
): Promise<{
  success: boolean;
  message: string;
  ndes?: number;
  cantidad?: number;
  detalle?: { valor: number; piezas: number; importe: number }[];
  totalPiezas?: number;
  totalImporte?: number;
  moneda?: number;
  dispositivo?: number;
}> {
  const response = await fetch(`${API_URL}/transaccion/solicitar-desembolso`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ usuario, dispositivo }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return {
      success: false,
      message: err.message || "Error al generar solicitud de desembolso",
    };
  }

  return await response.json();
}

/** POST /transaccion/recolectar */
export async function recolectarDesembolso(
  numeroDesembolso: number,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/transaccion/recolectar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ numeroDesembolso }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return {
      success: false,
      message: err.message || "Error al realizar la recolección",
    };
  }

  return await response.json();
}

export async function fetchMonitorCortesBoveda(dispositivo?: number): Promise<{
  limite: number | null;
  items: { dispositivo: number; cantidad: number }[];
}> {
  const qs =
    dispositivo !== undefined
      ? `?dispositivo=${encodeURIComponent(String(dispositivo))}`
      : "";

  const response = await fetch(`${API_URL}/transaccion/monitor-cortes${qs}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    return { limite: null, items: [] };
  }

  return await response.json();
}

export async function descartarTransaccion(
  ntra: number,
  usuario?: string,
  motivo?: string,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/transaccion/descartar/${ntra}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ usuario, motivo }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return {
      success: false,
      message: err.message || "Error al descartar transaccion",
    };
  }

  return await response.json();
}
