"use server";

import { revalidatePath } from "next/cache";
import { DispositivoData } from "./definitions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchDispositivos(): Promise<DispositivoData[]> {
  const res = await fetch(`${API_URL}/dispositivos`);

  if (!res.ok) {
    throw new Error("Error al obtener los dispositivos");
  }

  return res.json();
}

export async function fetchDispositivoById(
  id: number
): Promise<DispositivoData> {
  const res = await fetch(`${API_URL}/dispositivos/${id}`);

  if (!res.ok) {
    throw new Error("Error al obtener el dispositivo");
  }
  return res.json();
}

export async function crearDispositivo(data: Partial<DispositivoData>) {
  const res = await fetch(`${API_URL}/dispositivos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    return {
      success: false,
      message: err.message || "Error al crear dispositivo",
    };
  }

  revalidatePath("/dashboard/dispositivos");

  return { success: true };
}

export async function actualizarDispositivo(
  id: number,
  data: Partial<DispositivoData>
) {
  const res = await fetch(`${API_URL}/dispositivos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    return {
      success: false,
      message: err.message || "Error al actualizar dispositivo",
    };
  }

  revalidatePath("/dashboard/dispositivos");

  return { success: true };
}

export async function eliminarDispositivo(id: number) {
  const res = await fetch(`${API_URL}/dispositivos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    return {
      success: false,
      message: err.message || "Error al eliminar dispositivo",
    };
  }

  revalidatePath("/dashboard/dispositivos");

  return { success: true };
}
