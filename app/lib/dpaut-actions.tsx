"use server";

import { DpautInterface } from "./definitions";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchSolicitudesPendientes(): Promise<DpautInterface[]> {
  const response = await fetch(`${API_URL}/dpaut/pendientes`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Error al obtener solicitudes pendientes");
  }

  return await response.json();
}
