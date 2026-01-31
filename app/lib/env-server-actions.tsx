"use server";

import https from "https";
import { v4 as uuidv4 } from "uuid";

/**
 * Server actions para obtener variables de entorno dinámicamente
 * Esto permite que las variables se lean en runtime, no en build time
 */

export async function getBcpConfig() {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_BCP || "",
    username: process.env.NEXT_PUBLIC_BCP_USERNAME || "",
    password: process.env.NEXT_PUBLIC_BCP_PASSWORD || "",
    channel: process.env.NEXT_PUBLIC_BCP_CHANNEL || "TEST",
    authToken: process.env.NEXT_PUBLIC_BCP_AUTH_TOKEN || "",
  };
}

export async function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

/**
 * Consumir API BCP desde el servidor con configuración SSL personalizada
 * Replica: curl --tls-max 1.3 --ciphers 'DEFAULT:!ECDHE' --insecure
 */
export async function consumirApiBcp(data: {
  endpoint: string;
  terminal: string;
  accountNumber: string;
  typeAccount: string;
  amount: number;
  currencyAmount: string;
}) {
  console.log("📤 [BCP] Iniciando consumo de API BCP...");
  console.log("📤 [BCP] Parámetros recibidos:", {
    endpoint: data.endpoint,
    terminal: data.terminal,
    accountNumber: data.accountNumber,
    typeAccount: data.typeAccount,
    amount: data.amount,
    currencyAmount: data.currencyAmount,
  });

  const config = await getBcpConfig();

  console.log("📤 [BCP] Configuración obtenida:", {
    apiUrl: config.apiUrl ? "✓ Configurada" : "✗ NO configurada",
    username: config.username ? "✓ Configurada" : "✗ NO configurada",
    password: config.password ? "✓ Configurada" : "✗ NO configurada",
    channel: config.channel,
  });

  if (!config.apiUrl) {
    console.error("❌ [BCP] ERROR: URL de BCP no configurada");
    return {
      success: false,
      error: "URL de BCP no configurada",
      answerCode: "99",
    };
  }

  // Construir URL completa
  const urlBcp = `${config.apiUrl.replace(/\/$/, "")}/${data.endpoint.replace(/^\//, "")}`;
  console.log("📤 [BCP] URL construida:", urlBcp);

  // Parsear URL para https.request()
  const url = new URL(urlBcp);

  // Body del request
  const requestBody = JSON.stringify({
    terminal: data.terminal,
    accountNumber: data.accountNumber,
    typeAccount: data.typeAccount,
    amount: data.amount,
    currencyAmount: data.currencyAmount,
  });

  console.log("📤 [BCP] Body del request:", requestBody);

  // Generar trace único como GUID sin guiones
  const traceGuid = uuidv4().replace(/-/g, "");
  console.log("📤 [BCP] Trace generado:", traceGuid);

  // Construir Authorization header (Basic Auth: base64(username:password))
  const credentials = `${config.username}:${config.password}`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");
  const authHeader = `Basic ${encodedCredentials}`;
  console.log(
    "📤 [BCP] Authorization header (sin password):",
    `Basic [REDACTED]`,
  );

  // Opciones de request con configuración SSL personalizada
  const options: https.RequestOptions = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + url.search,
    method: "POST",
    headers: {
      accept: "*/*",
      Channel: config.channel,
      Trace: traceGuid,
      Authorization: authHeader,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    // Configuración SSL que replica curl --tls-max 1.3 --ciphers 'DEFAULT:!ECDHE' --insecure
    rejectUnauthorized: false, // --insecure
    maxVersion: "TLSv1.3", // --tls-max 1.3
    minVersion: "TLSv1.2",
    ciphers: "DEFAULT:!ECDHE", // --ciphers 'DEFAULT:!ECDHE'
  };

  console.log("📤 [BCP] Opciones SSL configuradas:", {
    hostname: options.hostname,
    port: options.port,
    path: options.path,
    rejectUnauthorized: options.rejectUnauthorized,
    maxVersion: options.maxVersion,
    ciphers: options.ciphers,
  });

  // 🔍 IMPRIMIR HEADERS EXACTOS
  console.log("📤 [BCP] ===== HEADERS ENVIADOS =====");
  console.log("📤 [BCP] Channel:", options.headers?.Channel);
  console.log("📤 [BCP] Trace:", options.headers?.Trace);
  console.log("📤 [BCP] Authorization:", "Basic [REDACTED]");
  console.log("📤 [BCP] Content-Type:", options.headers?.["Content-Type"]);
  console.log("📤 [BCP] Content-Length:", options.headers?.["Content-Length"]);
  console.log("📤 [BCP] =============================");

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseData = "";

      console.log("📥 [BCP] Response recibido - Status:", res.statusCode);

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        console.log("📥 [BCP] Response completo:", responseData);

        try {
          const dataResp = JSON.parse(responseData);
          const answerCode = dataResp.answerCode || "00";

          if (answerCode === "00") {
            console.log("✅ [BCP] Respuesta exitosa del BCP (answerCode: 00)");
          } else {
            console.warn(
              `⚠️ [BCP] Respuesta del BCP con código ${answerCode}:`,
              dataResp.answerDetail,
            );
          }

          resolve({
            success: true,
            data: dataResp,
            answerCode: answerCode,
            answerDetail: dataResp.answerDetail || "",
          });
        } catch (parseError) {
          console.error("❌ [BCP] Error al parsear JSON:", parseError);
          resolve({
            success: false,
            error: "Error al parsear respuesta JSON",
            answerCode: "96",
          });
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ [BCP] Error en request:", error.message);
      console.error("❌ [BCP] Stack trace:", error.stack);

      resolve({
        success: false,
        error: error.message,
        answerCode: "97",
      });
    });

    // Timeout de 30 segundos
    req.setTimeout(30000, () => {
      console.error("❌ [BCP] Timeout después de 30 segundos");
      req.destroy();
      resolve({
        success: false,
        error: "Timeout en solicitud a BCP",
        answerCode: "95",
      });
    });

    // Enviar el body
    req.write(requestBody);
    req.end();
  });
}
