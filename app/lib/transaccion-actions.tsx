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
    const err = await response.json();
    return {
      success: false,
      message: err.message || "Error al registrar transacción",
    };
  }

  return {
    success: true,
    message: "Transacción registrada correctamente",
  };
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
  const response = await fetch(`${API_URL}/transaccion/estado/${stat}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ dispositivo }),
  });

  if (!response.ok) {
    throw new Error("Error al obtener transacciones por estado");
  }

  return await response.json();
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
