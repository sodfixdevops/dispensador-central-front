"use server";

import { revalidatePath } from "next/cache";
import { AdapiData, AdapiCreateDto } from "./definitions";

export async function FetchAdapisTable(): Promise<AdapiData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bankapi`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener registros de auditoría");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en FetchAdapisTable:", error);
    return [];
  }
}

export async function createAdapi(data: AdapiCreateDto) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bankapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error al crear registro de auditoría");
    }

    revalidatePath("/dashboard/operaciones");
    return await response.json();
  } catch (error) {
    console.error("Error en createAdapi:", error);
    throw error;
  }
}

export async function updateAdapi(id: number, data: Partial<AdapiCreateDto>) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bankapi/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error al actualizar registro de auditoría");
    }

    revalidatePath("/dashboard/operaciones");
    return await response.json();
  } catch (error) {
    console.error("Error en updateAdapi:", error);
    throw error;
  }
}

export async function deleteAdapi(id: number) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bankapi/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Error al eliminar registro de auditoría");
    }

    revalidatePath("/dashboard/operaciones");
    return await response.json();
  } catch (error) {
    console.error("Error en deleteAdapi:", error);
    throw error;
  }
}

/**
 * Registra una llamada a API en la tabla adapi
 * Se usa para auditoría y control de las APIs consumidas
 * @deprecated Use createAdapi instead - this is kept for backward compatibility
 */
export async function registrarApiCall(
  adapicurl: string,
  adapiobse?: string,
): Promise<{ success: boolean; message: string; data?: AdapiData }> {
  try {
    const payload: AdapiCreateDto = {
      adapicurl,
      adapiresp: "", // Vacío al crear
      adapiobse: adapiobse || "", // Vacío si no se proporciona
      adapistat: 1, // Estado pendiente
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bankapi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      return {
        success: false,
        message: err.message || "Error al registrar llamada a API",
      };
    }

    const data = await response.json();
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Llamada a API registrada correctamente",
      data,
    };
  } catch (error) {
    console.error("Error en registrarApiCall:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Actualiza la respuesta de una llamada a API
 * @deprecated Use updateAdapi instead - this is kept for backward compatibility
 */
export async function actualizarApiResponse(
  adapiseri: number,
  adapiresp: string,
  adapiobse?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = {
      adapiresp,
      adapiobse: adapiobse || "",
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bankapi/${adapiseri}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const err = await response.json();
      return {
        success: false,
        message: err.message || "Error al actualizar respuesta de API",
      };
    }

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Respuesta de API actualizada correctamente",
    };
  } catch (error) {
    console.error("Error en actualizarApiResponse:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
