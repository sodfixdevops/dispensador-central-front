"use server";
import { number, z } from "zod";
import {
  Agenciafiltro,
  AgenData,
  ApiResponse,
  pfageDto,
  pfageMasivoDto,
  Sucursalfiltro,
  FiltroReporteTransacciones,
  ReporteTransaccionesResponseDto,
  ReporteDineroAcumuladoResponseDto,
} from "./definitions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
    },
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
    },
  );

  if (!response.ok) {
    throw new Error("Error en la respuesta de la API");
  }

  // En vez de intentar convertir a JSON, obtenemos el blob
  return response.blob();
}

/**
 * Genera reporte de transacciones por usuario
 */
export async function generarReporteTransaccionesPorUsuario(
  filtros: FiltroReporteTransacciones,
): Promise<ReporteTransaccionesResponseDto> {
  try {
    const response = await fetch(
      `${API_URL}/reportes/transacciones-por-usuario`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtros),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Error al generar reporte de transacciones",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error en generarReporteTransaccionesPorUsuario:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Genera reporte de transacciones global
 */
export async function generarReporteTransaccionesGlobal(
  fechaInicio: string,
  fechaFin: string,
): Promise<ReporteTransaccionesResponseDto> {
  try {
    const response = await fetch(
      `${API_URL}/reportes/transacciones-global?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Error al generar reporte global de transacciones",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error en generarReporteTransaccionesGlobal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Genera reporte de dinero acumulado por dispositivo
 */
export async function generarReporteDineroAcumulado(): Promise<ReporteDineroAcumuladoResponseDto> {
  try {
    const response = await fetch(`${API_URL}/reportes/dinero-acumulado`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Error al generar reporte de dinero acumulado",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error en generarReporteDineroAcumulado:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
