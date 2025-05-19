"use server";
import { number, z } from "zod";
import {
  Agenciafiltro,
  AgenData,
  ApiResponse,
  pfageDto,
  pfageMasivoDto,
  Sucursalfiltro,
} from "./definitions";

export async function reporteResumenColas(formData: any) {
  // Enviar la solicitud POST al servicio
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/ticket/reportes/resumenColas`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );
  const data = await response.json();

  return data;
}

export async function reporteAsfi(formData: any) {
  // Enviar la solicitud POST al servicio
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/ticket/reportes/resumenasfi`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );

  if (!response.ok) {
    throw new Error("Error en la respuesta de la API");
  }

  // En vez de intentar convertir a JSON, obtenemos el blob
  return response.blob();
}
