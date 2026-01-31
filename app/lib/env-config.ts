/**
 * Configuración centralizada de variables de entorno
 * Este archivo sirve como punto único de verdad para todas las URLs y configuraciones
 */

export const ENV_CONFIG = {
  // API del Backend (Dispensador)
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",

  // API Externa BCP
  NEXT_PUBLIC_API_BCP: process.env.NEXT_PUBLIC_API_BCP || "",
  NEXT_PUBLIC_BCP_USERNAME: process.env.NEXT_PUBLIC_BCP_USERNAME || "",
  NEXT_PUBLIC_BCP_PASSWORD: process.env.NEXT_PUBLIC_BCP_PASSWORD || "",

  // Auth
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL || "http://localhost:3000/api/auth",
};

/**
 * Construir URL completa de BCP concatenando base + descriptor
 * @param gbcondesc - Descriptor del concepto (ej: "consulta/saldo")
 * @returns URL completa lista para consumir
 */
export function construirUrlBcp(gbcondesc: string): string {
  const baseUrl = ENV_CONFIG.NEXT_PUBLIC_API_BCP.replace(/\/$/, ""); // Quitar trailing slash si existe
  return `${baseUrl}/${gbcondesc}`;
}

/**
 * Validar que las variables de entorno requeridas estén configuradas
 */
export function validateEnv() {
  const errors: string[] = [];

  if (!ENV_CONFIG.NEXT_PUBLIC_API_URL) {
    errors.push("NEXT_PUBLIC_API_URL no está configurada");
  }

  if (!ENV_CONFIG.NEXT_PUBLIC_API_BCP) {
    errors.push("NEXT_PUBLIC_API_BCP no está configurada");
  }

  if (errors.length > 0) {
    console.warn("⚠️ Variables de entorno faltantes:", errors.join(", "));
  }

  return errors.length === 0;
}
