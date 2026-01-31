"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { lusitana } from "@/app/ui/fonts";
import { InvoicesTableSkeleton } from "@/app/ui/skeletons";
import { BtnCancelar, BtnContar, BtnDepositar } from "@/app/ui/deposito/Button";
import TableDeposito from "@/app/ui/deposito/TableDeposito";
import BoucherDeposito from "@/app/ui/deposito/BoucherDeposito";

import { dpmtr, gbcucy, TrconData } from "@/app/lib/definitions";
import {
  DE70_ActionCancelar,
  DE70_ActionStoreStart,
  DE70_ActionUnlock,
  DE70_FlujoIniciarConteo,
  DE70_FlujoIniciarTransaccion,
  GetMonitorCortes,
  waitForCancelComplete,
  waitForCancelState,
  waitForD2Value,
  waitForEscrowDoorClosed,
  waitForSR2,
} from "@/app/lib/de70-actions";

import { FetchConceptosByPrefijo } from "@/app/lib/conceptos-actions";
import {
  registrarTransaccion,
  fetchTransaccionesEstado,
} from "@/app/lib/transaccion-actions";
import { registrarApiCall, updateAdapi } from "@/app/lib/adapi-actions";
import { fetchBankByUsuario } from "@/app/lib/adbank-actions";
import { getBcpConfig, consumirApiBcp } from "@/app/lib/env-server-actions";
import { construirUrlBcp, ENV_CONFIG } from "@/app/lib/env-config";
import { showMessage, sleep } from "@/app/lib/utils";

// Función para obtener fecha y hora actual
function obtenerFechaHoraActual() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString();
  const hora = ahora.toLocaleTimeString();
  return { fecha, hora };
}

export default function Page() {
  const { data: session, status } = useSession();
  const query = "";
  const currentPage = 1;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datosDpmtr, setDatosDpmtr] = useState<dpmtr[]>([]);
  const [moneda, setMoneda] = useState<number | null>(null);
  const [monedabd, setMonedaBd] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monedasDisponibles, setMonedasDisponibles] = useState<TrconData[]>([]);
  const [conceptosReserva, setConceptosReserva] = useState<TrconData[]>([]);
  const [cortesActualizados, setCortesActualizados] = useState<gbcucy[]>([]);
  const [mostrarBoucher, setMostrarBoucher] = useState(false);
  const [montoFinal, setMontoFinal] = useState<number>(0);
  const [fechaHoy, setFechaHoy] = useState("");
  const [horaHoy, setHoraHoy] = useState("");
  const [monedaAbrev, setMonedaAbrev] = useState<string>("");
  const [advertenciaApiBank, setAdvertenciaApiBank] = useState(false);
  const [enviandoBanco, setEnviandoBanco] = useState(false);
  const [mensajeBanco, setMensajeBanco] = useState("");
  const [bloqueadoPorRecoleccion, setBloqueadoPorRecoleccion] = useState(false);

  // Variables de carga y estado de cancelar
  const [isCancelling, setIsCancelling] = useState(false);

  const apiUrl = session?.user?.dispositivo?.api_url;
  const dispositivo = session?.user?.dispositivo;

  // Debug: Mostrar INFO de BCP_API al cargar
  useEffect(() => {
    const cargarConfigBcp = async () => {
      const config = await getBcpConfig();
      console.log("🔍 DEBUG - BCP_API Configuration:");
      console.log("NEXT_PUBLIC_API_BCP:", config.apiUrl);
      console.log("API_BCP está configurado:", !!config.apiUrl);
      console.log("API_BCP es vacío:", config.apiUrl === "");
    };
    cargarConfigBcp();
  }, []);

  // Cargar monedas disponibles
  useEffect(() => {
    const cargarMonedas = async () => {
      const conceptos = await FetchConceptosByPrefijo(2); // prefijo para monedas
      setMonedasDisponibles(conceptos);
    };
    cargarMonedas();
  }, []);

  // Cargar conceptos de reserva (prefijo 5)
  useEffect(() => {
    const cargarConceptosReserva = async () => {
      const conceptos = await FetchConceptosByPrefijo(5); // prefijo para reserva
      setConceptosReserva(conceptos);
      // Si API_BCP está configurado pero no hay conceptos, mostrar advertencia
      const config = await getBcpConfig();
      if (config.apiUrl && conceptos.length === 0) {
        setAdvertenciaApiBank(true);
      }
    };
    cargarConceptosReserva();
  }, []);

  // Verificar transacciones pendientes de recolección (estado 2 o 3)
  useEffect(() => {
    const verificarRecoleccionPendiente = async () => {
      if (!dispositivo || dispositivo.codigo === 0) return;

      try {
        // Verificar estado 2 (generado)
        const estado2 = await fetchTransaccionesEstado(2, dispositivo.codigo);
        if (estado2.length > 0) {
          setBloqueadoPorRecoleccion(true);
          return;
        }

        // Verificar estado 3 (en recolección)
        const estado3 = await fetchTransaccionesEstado(3, dispositivo.codigo);
        if (estado3.length > 0) {
          setBloqueadoPorRecoleccion(true);
          return;
        }

        setBloqueadoPorRecoleccion(false);
      } catch (error) {
        console.error("Error al verificar recolección pendiente:", error);
      }
    };

    verificarRecoleccionPendiente();
    // Verificar cada 10 segundos
    const intervalo = setInterval(verificarRecoleccionPendiente, 10000);
    return () => clearInterval(intervalo);
  }, [dispositivo]);

  if (status === "loading") return <div>Cargando...</div>;

  if (!dispositivo || dispositivo.codigo === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-md shadow-md">
          El usuario <strong>{session?.user?.username}</strong> no tiene un
          dispositivo asignado.
        </div>
      </div>
    );
  }

  // Bloqueo por recolección pendiente
  if (bloqueadoPorRecoleccion) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white border-4 border-orange-500 rounded-lg p-8 shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">⏸️</div>
          <h1 className="text-3xl font-bold text-orange-800 mb-4">
            Dispositivo Bloqueado
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Dispositivo a la espera de recolección de efectivo
          </p>
          <p className="text-sm text-gray-500">
            Por favor, realice la recolección del efectivo antes de continuar
            con nuevos depósitos.
          </p>
        </div>
      </div>
    );
  }

  // Seleccionar moneda
  const handleSeleccionarMoneda = async (
    codigo: number,
    abreviacion: string,
  ) => {
    if (!apiUrl) return;

    let currency = 0;
    if (abreviacion === "BOB") currency = 2;
    else if (abreviacion === "USD") currency = 0;
    else {
      alert("Moneda no válida");
      return;
    }

    setLoading(true);

    const result = await DE70_FlujoIniciarTransaccion(apiUrl, 1, currency, 1);
    setLoading(false);

    if (result.success) {
      setMonedaBd(codigo);
      setMoneda(currency);
      setMonedaAbrev(abreviacion);
      setBloqueado(true);
      console.log("Moneda BD seleccionada:", codigo);
    } else {
      alert(result.message);
    }
  };

  // Si no tiene moneda seleccionada o bloqueada
  /*if (!moneda || !bloqueado) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-semibold">Seleccione la moneda</h2>

        {monedasDisponibles.length === 0 && <p>Cargando monedas...</p>}

        {monedasDisponibles.map((m) => (
          <button
            key={m.correlativo}
            onClick={() =>
              handleSeleccionarMoneda(m.correlativo!, m.abreviacion!)
            }
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            {m.descripcion} ({m.abreviacion})
          </button>
        ))}

        {loading && <p>Aplicando bloqueo de moneda...</p>}
      </div>
    );
  }*/

  // Contar billetes
  const handleContar = async () => {
    try {
      setIsSubmitting(true);

      if (!apiUrl || monedabd === null) {
        alert("Datos incompletos para iniciar conteo.");
        return;
      }

      const result = await DE70_FlujoIniciarConteo(apiUrl, monedabd);
      console.log("result de DE70_FlujoIniciarConteo", result);
      if (result.success) {
        console.log("AQUI ENTRE LUEGO DE FLUJO");
        const data = await GetMonitorCortes(apiUrl, 1);
        setDatosDpmtr(data); // ← sin acumulación en front
      } else {
        alert(result.message || "No se pudo iniciar el conteo.");
      }
    } catch (error) {
      console.error("Error al contar:", error);
      alert("Ocurrió un error al iniciar el conteo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Depositar
  const handleDepositar = async () => {
    try {
      setIsSubmitting(true);

      if (!session?.user?.id) {
        alert("Sesión inválida.");
        return;
      }

      const usuario = session.user.id;

      const detalleFiltrado = cortesActualizados
        .filter((c) => (c.gbcucycant ?? 0) > 0 && c.gbcucyvlor !== undefined)
        .map((c) => ({
          gbcucyvlor: c.gbcucyvlor!,
          gbcucycant: c.gbcucycant ?? 0,
        }));

      if (detalleFiltrado.length === 0) {
        alert("No hay billetes para registrar.");
        return;
      }

      // Calcular monto total desde el detalle (no esperar a estado)
      const montoCalculado = detalleFiltrado.reduce((total, item) => {
        return total + item.gbcucyvlor * item.gbcucycant;
      }, 0);

      // Paso B: Enviar storestart
      await DE70_ActionStoreStart(apiUrl!);

      // Paso C: Registrar en tabla adapi (auditoría antes de consumir)
      // Buscar concepto con gbconcorr = 1 (el requerido)
      const conceptoReserva = conceptosReserva.find((c) => c.correlativo === 1);
      // Configuración BCP en runtime (server action)
      const bcpConfig = await getBcpConfig();
      const buildUrlBcp = (desc: string) => {
        const base = (bcpConfig.apiUrl || "").replace(/\/$/, "");
        const path = (desc || "").replace(/^\//, "");
        return base && path ? `${base}/${path}` : "";
      };

      let adapiseriGuardado: number | undefined;
      if (conceptoReserva) {
        const urlBcp = buildUrlBcp(conceptoReserva.descripcion || "");

        const registroApi = await registrarApiCall(
          urlBcp,
          `Deposito ${usuario} - Moneda ${monedabd}`,
        );

        // ⚠️ IMPORTANTE: No hacer return aquí, el dinero ya cayó
        // Solo registrar la advertencia pero continuar el proceso
        if (!registroApi.success) {
          console.warn(
            "⚠️ Advertencia: Error al registrar en adapi:",
            registroApi.message,
          );
          // Continuar de todas formas
        } else {
          console.log(
            "✅ API registrada en tabla adapi con ID:",
            registroApi.data?.adapiseri,
          );
          adapiseriGuardado = registroApi.data?.adapiseri;
        }
      } else {
        console.warn("⚠️ No se encontró concepto con codigo = 1");
      }

      // Paso D: Esperar fin del proceso (NO D2)
      await waitForSR2(apiUrl!);

      // Paso E: Unlock
      await DE70_ActionUnlock(apiUrl!);

      console.log("hizo unlock y la moneda es ", monedabd);

      // Paso F: Registrar transacción
      const result = await registrarTransaccion({
        usuario,
        moneda: monedabd!,
        dispositivo: dispositivo.codigo,
        detalle: detalleFiltrado,
      });

      if (result.success) {
        alert("Transacción registrada correctamente.");
        const { fecha, hora } = obtenerFechaHoraActual();
        setFechaHoy(fecha);
        setHoraHoy(hora);
        setMostrarBoucher(true);
      } else {
        alert(result.message || "No se pudo registrar la transacción.");
      }

      // Paso G: Consumir API BCP (3 intentos, 5s intervalo) sin frenar el flujo
      if (conceptoReserva) {
        // Obtener datos bancarios del usuario
        const datosBancarios = await fetchBankByUsuario(usuario);

        if (!datosBancarios) {
          console.warn("⚠️ Usuario sin cuenta bancaria registrada");
          setMensajeBanco(
            "⚠️ Usuario sin cuenta bancaria registrada. Omitiendo envío al Banco.",
          );
        } else {
          setEnviandoBanco(true);
          setMensajeBanco("Enviando información al Banco (intento 1/3)...");
          let intentos = 0;
          let exito = false;

          while (intentos < 3 && !exito) {
            intentos++;
            setMensajeBanco(
              `Enviando información al Banco (intento ${intentos}/3)...`,
            );

            const resultado = (await consumirApiBcp({
              endpoint: (conceptoReserva.descripcion || "").trim(),
              terminal:
                dispositivo.descripcion || dispositivo.codigo.toString(),
              accountNumber: datosBancarios.adbankncta,
              typeAccount: datosBancarios.adbanktipo,
              amount: montoCalculado,
              currencyAmount: datosBancarios.adbankmone,
            })) as {
              success: boolean;
              answerCode?: string;
              answerDetail?: string;
              error?: string;
              data?: any;
            };

            if (resultado.success && resultado.answerCode === "00") {
              setMensajeBanco("✅ Respuesta exitosa del Banco.");
              exito = true;
              // ✅ ACTUALIZAR adapi con estado 2 (exitoso)
              if (adapiseriGuardado) {
                await updateAdapi(adapiseriGuardado, {
                  adapiresp: JSON.stringify(resultado.data || {}),
                  adapiobse: "Respuesta exitosa del Banco",
                  adapistat: 2,
                });
              }
            } else if (resultado.success) {
              setMensajeBanco(
                "⚠️ El Banco rechazó la operación: " +
                  (resultado.answerDetail || "Error"),
              );
              exito = true; // Respuesta recibida aunque sea rechazo
              // ❌ ACTUALIZAR adapi con estado 3 (error) y detalles del rechazo
              if (adapiseriGuardado) {
                await updateAdapi(adapiseriGuardado, {
                  adapiresp: JSON.stringify(resultado.data || {}),
                  adapiobse: `Banco rechazó: ${resultado.answerDetail || "Error desconocido"}`,
                  adapistat: 3,
                });
              }
            } else {
              setMensajeBanco(
                `Error al contactar el Banco: ${resultado.error}. Intento ${intentos}/3.${intentos < 3 ? " Reintentando en 5s..." : ""}`,
              );
              // ❌ ACTUALIZAR adapi con estado 3 (error) si es el último intento
              if (intentos === 3 && adapiseriGuardado) {
                await updateAdapi(adapiseriGuardado, {
                  adapiresp: "",
                  adapiobse: `Error al contactar Banco: ${resultado.error}`,
                  adapistat: 3,
                });
              }
            }

            // Si no tuvo éxito y aún hay intentos, esperar 5 segundos
            if (!exito && intentos < 3) {
              await new Promise((r) => setTimeout(r, 5000));
            }
          }

          if (!exito) {
            setMensajeBanco(
              "❌ No se pudo contactar al Banco tras 3 intentos. Volviendo al inicio en 3 segundos...",
            );
            // Esperar 3 segundos antes de volver al inicio
            await new Promise((r) => setTimeout(r, 3000));
          }

          setEnviandoBanco(false);
        }
      } else {
        console.warn(
          "⚠️ No se encontró concepto con codigo = 1 para consumir BCP",
        );
      }
    } catch (error) {
      console.error("Error al depositar", error);
      alert("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar
  const handleCancelar = async () => {
    try {
      setIsSubmitting(true);
      setIsCancelling(true);

      // 1️⃣ ENVIAR CANCEL → abre compuerta
      await DE70_ActionCancelar(apiUrl!);
      console.log("🟡 CANCEL enviado, compuerta abierta");

      // 2️⃣ ESPERAR que el operador cierre la compuerta
      await waitForEscrowDoorClosed(apiUrl!);
      console.log("✅ Operador cerró la compuerta");

      // 3️⃣ ENVIAR UNLOCK → volver a estado limpio
      await DE70_ActionUnlock(apiUrl!);
      console.log("🔓 UNLOCK enviado");

      // 4️⃣ CONFIRMAR estado inicial (login + standby)
      await waitForCancelComplete(apiUrl!);
      console.log("✅ Equipo en estado inicial");

      // 5️⃣ LIMPIAR UI
      setMoneda(null);
      setMonedaBd(null);
      setMonedaAbrev("");
      setBloqueado(false);

      setDatosDpmtr([]);
      setCortesActualizados([]);
      setMostrarBoucher(false);
      setMontoFinal(0);
    } catch (error) {
      console.error("❌ Error en cancelar", error);
    } finally {
      setIsCancelling(false);
      setIsSubmitting(false);
    }
  };

  // Mostrar boucher
  /*{
    mostrarBoucher && (
      <BoucherDeposito
        fecha={fechaHoy}
        hora={horaHoy}
        usuario={session?.user?.username || ""}
        montoTotal={montoFinal}
        moneda={monedaAbrev === "BOB" ? "Bs.-" : monedaAbrev}
        datosDpmtr={datosDpmtr}
        apiUrl={apiUrl!}
        onCerrar={() => {
          setMostrarBoucher(false);
          setMoneda(null);
          setMonedaBd(null);
          setMonedaAbrev("");
          setBloqueado(false);
          setDatosDpmtr([]);
          setCortesActualizados([]);
          setMontoFinal(0);
          setFechaHoy("");
          setHoraHoy("");
        }}
      />
    );
  }*/

  // Vista principal
  return (
    <>
      {/* 🔴 BOUCHER: SIEMPRE EN EL ÁRBOL */}
      {mostrarBoucher && (
        <BoucherDeposito
          fecha={fechaHoy}
          hora={horaHoy}
          usuario={session?.user?.username || ""}
          montoTotal={montoFinal}
          moneda={monedaAbrev === "BOB" ? "Bs.-" : monedaAbrev}
          datosDpmtr={datosDpmtr}
          apiUrl={apiUrl!}
          onCerrar={() => {
            // cerrar boucher
            setMostrarBoucher(false);

            // volver a selección de moneda
            setMoneda(null);
            setMonedaBd(null);
            setMonedaAbrev("");
            setBloqueado(false);

            // limpiar estado transacción
            setDatosDpmtr([]);
            setCortesActualizados([]);
            setMontoFinal(0);
            setFechaHoy("");
            setHoraHoy("");
          }}
        />
      )}

      {/* 🔵 PANTALLA SELECCIÓN MONEDA */}
      {!moneda || !bloqueado ? (
        <div className="h-screen flex items-center justify-center flex-col gap-4">
          {/* ⚠️ Advertencia si API_BCP está configurado pero no hay conceptos */}
          {advertenciaApiBank && (
            <div className="absolute top-4 right-4 left-4 bg-yellow-100 text-yellow-800 p-4 rounded-md border-l-4 border-yellow-500">
              <p className="font-semibold">
                ⚠️ Advertencia: APIs del Banco no cargadas
              </p>
              <p className="text-sm">
                No se encontraron conceptos con prefijo 5 en la tabla de
                conceptos.
              </p>
              <p className="text-sm">
                El sistema continuará funcionando sin auditoría de API.
              </p>
            </div>
          )}

          <h2 className="text-xl font-semibold">Seleccione la moneda</h2>

          {monedasDisponibles.length === 0 && <p>Cargando monedas...</p>}

          {monedasDisponibles.map((m) => (
            <button
              key={m.correlativo}
              onClick={() =>
                handleSeleccionarMoneda(m.correlativo!, m.abreviacion!)
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              {m.descripcion} ({m.abreviacion})
            </button>
          ))}

          {loading && <p>Aplicando bloqueo de moneda...</p>}
        </div>
      ) : (
        /* 🟢 PANTALLA PRINCIPAL DEPÓSITO */
        <div className="w-full">
          <div className="flex w-full items-center justify-between">
            <h1 className={`${lusitana.className} text-2xl`}>
              DEPOSITO DE EFECTIVO
            </h1>
          </div>

          {/* ⚠️ Advertencia si API_BCP está configurado pero no hay conceptos */}
          {advertenciaApiBank && (
            <div className="mt-4 bg-yellow-100 text-yellow-800 p-4 rounded-md border-l-4 border-yellow-500">
              <p className="font-semibold">
                ⚠️ Advertencia: APIs del Banco no cargadas
              </p>
              <p className="text-sm">
                No se encontraron conceptos con prefijo 5 en la tabla de
                conceptos.
              </p>
              <p className="text-sm">
                El sistema continuará funcionando sin auditoría de API.
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-start gap-2 md:mt-8">
            {enviandoBanco && (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-2 flex items-center gap-3">
                <div className="animate-spin">
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <span className="font-semibold">{mensajeBanco}</span>
              </div>
            )}
            <label className="mb-1 text-sm font-medium text-gray-700">
              Usuario:
            </label>
            <input
              type="text"
              value={session?.user?.username || ""}
              readOnly
              className="w-[20%] rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
            />
          </div>

          <div className="mt-4 flex items-center justify-start gap-2 md:mt-8">
            <BtnContar onClick={handleContar} disabled={isSubmitting} />
            <BtnDepositar onClick={handleDepositar} disabled={isSubmitting} />
            <BtnCancelar
              onClick={handleCancelar}
              disabled={isSubmitting}
              loading={isCancelling}
            />
          </div>

          <Suspense fallback={<InvoicesTableSkeleton />}>
            <TableDeposito
              query={query}
              currentPage={currentPage}
              datosDpmtr={datosDpmtr}
              apiUrl={apiUrl!}
              onCortesChange={setCortesActualizados}
              onMontoChange={setMontoFinal}
            />
          </Suspense>
        </div>
      )}
    </>
  );
}
