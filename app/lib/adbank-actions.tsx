"use server";

import { revalidatePath } from "next/cache";
import { AdbankData } from "./definitions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchBankByUsuario(
  username: string,
): Promise<AdbankData | null> {
  try {
    const res = await fetch(`${API_URL}/banco/usuario/${username}`);

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Error al obtener cuenta bancaria");
    }

    const data = await res.json();
    // El endpoint retorna un array, tomamos el primer elemento
    return Array.isArray(data) ? data[0] || null : data;
  } catch (error) {
    console.error("Error en fetchBankByUsuario:", error);
    return null;
  }
}

export async function crearCuentaBancaria(
  username: string,
  data: { adbankncta: string; adbanktipo: string; adbankmone: string },
) {
  try {
    const payload = {
      adbankusrn: username,
      adbankncta: data.adbankncta,
      adbanktipo: data.adbanktipo,
      adbankmone: data.adbankmone,
      adbankmrcb: 0,
    };

    const res = await fetch(`${API_URL}/banco`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        message: err.message || "Error al crear cuenta bancaria",
      };
    }

    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Cuenta bancaria creada correctamente" };
  } catch (error) {
    console.error("Error en crearCuentaBancaria:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function actualizarCuentaBancaria(
  id: number,
  data: { adbankncta: string; adbanktipo: string; adbankmone: string },
) {
  try {
    const payload = {
      adbankncta: data.adbankncta,
      adbanktipo: data.adbanktipo,
      adbankmone: data.adbankmone,
    };

    const res = await fetch(`${API_URL}/banco/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        message: err.message || "Error al actualizar cuenta bancaria",
      };
    }

    revalidatePath("/dashboard/usuarios");
    return {
      success: true,
      message: "Cuenta bancaria actualizada correctamente",
    };
  } catch (error) {
    console.error("Error en actualizarCuentaBancaria:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function eliminarCuentaBancaria(id: number) {
  try {
    const res = await fetch(`${API_URL}/banco/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      return {
        success: false,
        message: err.message || "Error al eliminar cuenta bancaria",
      };
    }

    revalidatePath("/dashboard/usuarios");
    return {
      success: true,
      message: "Cuenta bancaria eliminada correctamente",
    };
  } catch (error) {
    console.error("Error en eliminarCuentaBancaria:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
