"use server";
import { number, z } from "zod";
import { Cortes, dpmtr, gbcucy } from "./definitions";
import { revalidatePath } from "next/cache";

export async function DE70_ActionSense(apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/sense`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al consultar estado del dispositivo");
    }

    const result = await response.json();
    return result; // se espera que incluya el campo SR2 con su valor
  } catch (error) {
    console.error("Error al consultar estado:", error);
    return null;
  }
}

async function waitForReadyState(
  apiUrl: string,
  timeout = 10000,
  interval = 500,
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const status = await DE70_ActionSense(apiUrl);
    if (
      status &&
      typeof status.SR2 === "string" &&
      status.SR2.includes("0x07")
    ) {
      return true; // el equipo está listo para volver a contar
    }
    await new Promise((res) => setTimeout(res, interval));
  }

  console.warn(
    "Tiempo de espera agotado: el dispositivo no volvió a Ready to count",
  );
  return false;
}

export async function DE70_ActionUnlock(apiUrl: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000); // 7s máximo

  try {
    const response = await fetch(`${apiUrl}/unlock`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = await response.text(); // aunque sea irrelevante
    return text;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("❌ Timeout en UNLOCK");
    } else {
      console.error("❌ Error en unlock:", error);
    }
    throw error; // relanza para que entre al catch en handleCancelar
  }
}

export async function waitForD2Value(
  apiUrl: string,
  expectedValue: string,
  interval = 600,
): Promise<void> {
  while (true) {
    const status = await DE70_ActionSense(apiUrl);
    const d2 = status?.interpretacion?.D2 as string | undefined;

    console.log(`⌛ D2 actual: ${d2}`);

    if (typeof d2 === "string" && d2.includes(expectedValue)) {
      console.log(`✅ D2 coincide con ${expectedValue}`);
      break;
    }

    await new Promise((res) => setTimeout(res, interval));
  }
}

export async function waitForSR2(
  apiUrl: string,
  doneValues: string[] = ["Stand by", "Ready to count"],
  interval = 600,
): Promise<void> {
  while (true) {
    const status = await DE70_ActionSense(apiUrl);
    const sr2 = status?.interpretacion?.SR2 as string | undefined;

    console.log(`⌛ SR2 actual: ${sr2}`);

    if (typeof sr2 === "string" && doneValues.some((v) => sr2.includes(v))) {
      console.log("✅ Proceso finalizado según SR2");
      break;
    }

    await new Promise((res) => setTimeout(res, interval));
  }
}

// 1. Cancelar en el backend
export async function DE70_ActionCancelar(apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/cancel`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Error al cancelar transacción");
    }

    const text = await response.text(); // ✅
    console.log("CANCEL RESPONSE:", text);
    return text;
  } catch (error) {
    console.error("Error al cancelar:", error);
    throw error; // mejor relanzar
  }
}

// 2. Polling hasta que quede en Stand by (SR2 = 0x04) y Login mode (S2 = 0x00)
export async function waitForCancelState(
  apiUrl: string,
  interval = 500,
): Promise<void> {
  while (true) {
    const status = await DE70_ActionSense(apiUrl);

    const sr2 = status?.interpretacion?.SR2 as string | undefined;
    const s2 = status?.interpretacion?.S2 as string | undefined;

    const isStandBy = typeof sr2 === "string" && sr2.includes("0x04");
    const isLoginMode = typeof s2 === "string" && s2.includes("0x00");

    if (isStandBy && isLoginMode) {
      console.log("✅ Cancel confirmado: Stand by + Login mode");
      break;
    }

    await new Promise((r) => setTimeout(r, interval));
  }
}

export async function waitForEscrowDoorClosed(
  apiUrl: string,
  interval = 800,
): Promise<void> {
  while (true) {
    const status = await DE70_ActionSense(apiUrl);

    const s1 = status?.interpretacion?.S1 as string | undefined;
    const sr2 = status?.interpretacion?.SR2 as string | undefined;

    console.log(`S1=${s1} | SR2=${sr2}`);

    // ✅ Condición correcta:
    if (
      typeof s1 === "string" &&
      s1.includes("Escrow door closed") &&
      typeof sr2 === "string" &&
      sr2.includes("Ready to count")
    ) {
      console.log("✅ Puerta cerrada y equipo listo.");
      break;
    }

    await new Promise((res) => setTimeout(res, interval));
  }
}

export async function waitForCancelComplete(
  apiUrl: string,
  interval = 500,
): Promise<void> {
  while (true) {
    const status = await DE70_ActionSense(apiUrl);

    const sr2 = status?.interpretacion?.SR2 as string | undefined;
    const s2 = status?.interpretacion?.S2 as string | undefined;

    const isStandBy = typeof sr2 === "string" && sr2.includes("0x04");
    const isLoginMode = typeof s2 === "string" && s2.includes("0x00");

    if (isStandBy && isLoginMode) {
      console.log("✅ Cancelación completa: modo login + standby.");
      break;
    }

    await new Promise((res) => setTimeout(res, interval));
  }
}

export async function DE70_ActionStoreStart(
  apiUrl: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${apiUrl}/storestart`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Error en storestart");

    const text = await response.text();
    return text;
  } catch (error) {
    console.error("❌ Error en storestart:", error);
    return null;
  }
}

// metodo para iniciar transaccion
export async function DE70_FlujoIniciarTransaccion(
  apiUrl: string,
  transactionNumber: number,
  currency: number,
  mode: number,
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${apiUrl}/flujo/iniciar-transaccion?ntra=${transactionNumber}&moneda=${currency}&modo=${mode}`;
    console.log("Llamando a:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (result.errorCode === 400) {
      return { success: true, message: "Transacción iniciada correctamente." };
    } else {
      return {
        success: false,
        message: result.message || "Error no especificado.",
      };
    }
  } catch (error: any) {
    console.error("Error al iniciar transacción:", error);
    return { success: false, message: error.message || "Error desconocido." };
  }
}

export async function DE70_FlujoIniciarConteo(
  apiUrl: string,
  moneda: number,
): Promise<{ success: boolean; data?: dpmtr[]; message?: string }> {
  try {
    const url = `${apiUrl}/flujo/iniciar-conteo?moneda=${moneda}`;
    console.log("Llamando a:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    console.log("BACKEND RAW RESULT:", result);

    // ✅ LÓGICA CORRECTA
    if (result.error === false) {
      return {
        success: true,
        data: result.registros || [],
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message || "Error no especificado.",
      };
    }
  } catch (error: any) {
    console.error("Error en DE70_FlujoIniciarConteo:", error);
    return { success: false, message: error.message || "Error desconocido." };
  }
}

export async function FetchCortes(apiUrl: string, moneda: number) {
  try {
    const response = await fetch(`${apiUrl}/gbcucy/cortes/${moneda}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al obtener lista del prefijo");
    }

    const result = await response.json();
    const cortes: gbcucy[] = result.map((item: any) => ({
      gbcucygnid: item.gbcucygnid,
      gbcucydnid: item.gbcucydnid,
      gbcucycmon: item.gbcucycmon,
      gbcucydesc: item.gbcucydesc,
      gbcucyvlor: item.gbcucyvlor,
      gbcucyseri: item.gbcucyseri,
      gbcucymrcb: item.gbcucymrcb,
      gbcucycant: 0,
    }));

    console.log(cortes);

    return cortes;
  } catch (error) {
    console.error("Error al obtener cortes de la moneda:", error);
    return [];
  }
}

export async function GetMonitorCortes(apiUrl: string, ntra: number) {
  try {
    const response = await fetch(`${apiUrl}/dpmtr`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al obtener monitor de transacciones");
    }

    const result = await response.json();
    const datos: dpmtr[] = result.map((item: any) => ({
      dpmtrcode: item.dpmtrcode, // ✅ correcto
      dpmtrntra: item.dpmtrntra,
      dpmtrdsid: item.dpmtrdsid,
      dpmtrcant: item.dpmtrcant,
      dpmtrstat: item.dpmtrstat,
    }));
    console.log(datos);
    return datos;
  } catch (error) {
    console.error("Error al obtener monitor de transacciones:", error);
    return [];
  }
}

export async function DE70_ActionIniciarConteo(apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/countstart`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al iniciar conteo");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al iniciar conteo:", error);
    return null;
  }
}

export async function DE70_ActionCargarDetalle(apiUrl: string) {
  try {
    const response = await fetch(`${apiUrl}/dpmtr/detalle`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Error al obtener monitor de transacciones");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al obtener monitor de transacciones:", error);
    return [];
  }
}

export async function DE70_ActionLockParam(
  apiUrl: string,
  transactionNumber: number,
  mode: number,
  currency: number,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${apiUrl}/lock-param?transactionNumber=${transactionNumber}&mode=${mode}&currency=${currency}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) throw new Error("No se pudo aplicar bloqueo");

    return true;
  } catch (error) {
    console.error("Error en DE70_ActionLockParam:", error);
    return false;
  }
}
