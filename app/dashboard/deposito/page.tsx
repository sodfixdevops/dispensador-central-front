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

// FunciÃ³n para obtener fecha y hora actual
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
      console.log("ðŸ” DEBUG - BCP_API Configuration:");
      console.log("NEXT_PUBLIC_API_BCP:", config.apiUrl);
      console.log("API_BCP estÃ¡ configurado:", !!config.apiUrl);
      console.log("API_BCP es vacÃ­o:", config.apiUrl === "");
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
      // Si API_BCP estÃ¡ configurado pero no hay conceptos, mostrar advertencia
      const config = await getBcpConfig();
      if (config.apiUrl && conceptos.length === 0) {
        setAdvertenciaApiBank(true);
      }
    };
    cargarConceptosReserva();
  }, []);

  // Verificar transacciones pendientes de recolecciÃ³n (estado 2 o 3)
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

        // Verificar estado 3 (en recolecciÃ³n)
        const estado3 = await fetchTransaccionesEstado(3, dispositivo.codigo);
        if (estado3.length > 0) {
          setBloqueadoPorRecoleccion(true);
          return;
        }

        setBloqueadoPorRecoleccion(false);
      } catch (error) {
        console.error("Error al verificar recolecciÃ³n pendiente:", error);
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

  // Bloqueo por recolecciÃ³n pendiente
  if (bloqueadoPorRecoleccion) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white border-4 border-orange-500 rounded-lg p-8 shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">â¸ï¸</div>
          <h1 className="text-3xl font-bold text-orange-800 mb-4">
            Dispositivo Bloqueado
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Dispositivo a la espera de recolecciÃ³n de efectivo
          </p>
          <p className="text-sm text-gray-500">
            Por favor, realice la recolecciÃ³n del efectivo antes de continuar
            con nuevos depÃ³sitos.
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
      alert("Moneda no vÃ¡lida");
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
        setDatosDpmtr(data); // â† sin acumulaciÃ³n en front
      } else {
        alert(result.message || "No se pudo iniciar el conteo.");
      }
    } catch (error) {
      console.error("Error al contar:", error);
      alert("OcurriÃ³ un error al iniciar el conteo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Depositar
  const handleDepositar = async () => {
    try {
      setIsSubmitting(true);

      if (!session?.user?.id) {
        alert("SesiÃ³n invÃ¡lida.");
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

      // Paso C: Registrar en tabla adapi (auditorÃ­a antes de consumir)
      // Buscar concepto con gbconcorr = 1 (el requerido)
      const conceptoReserva = conceptosReserva.find((c) => c.correlativo === 1);
      // ConfiguraciÃ³n BCP en runtime (server action)
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

        // âš ï¸ IMPORTANTE: No hacer return aquÃ­, el dinero ya cayÃ³
        // Solo registrar la advertencia pero continuar el proceso
        if (!registroApi.success) {
          console.warn(
            "âš ï¸ Advertencia: Error al registrar en adapi:",
            registroApi.message,
          );
          // Continuar de todas formas
        } else {
          console.log(
            "âœ… API registrada en tabla adapi con ID:",
            registroApi.data?.adapiseri,
          );
          adapiseriGuardado = registroApi.data?.adapiseri;
        }
      } else {
        console.warn("âš ï¸ No se encontrÃ³ concepto con codigo = 1");
      }

      // Paso D: Esperar fin del proceso (NO D2)
      await waitForSR2(apiUrl!);

      // Paso E: Unlock
      await DE70_ActionUnlock(apiUrl!);

      console.log("hizo unlock y la moneda es ", monedabd);

      // Paso F: Registrar transacciÃ³n
      const result = await registrarTransaccion({
        usuario,
        moneda: monedabd!,
        dispositivo: dispositivo.codigo,
        detalle: detalleFiltrado,
      });
      const nroOpe = Number((result as any)?.ntra ?? 0);

      if (result.success) {
        alert("TransacciÃ³n registrada correctamente.");
        const { fecha, hora } = obtenerFechaHoraActual();
        setFechaHoy(fecha);
        setHoraHoy(hora);
        setMostrarBoucher(true);
      } else {
        alert(result.message || "No se pudo registrar la transacciÃ³n.");
      }

      // Paso G: Consumir API BCP (1 intento) sin frenar el flujo
      if (conceptoReserva) {
        if (!Number.isFinite(nroOpe) || nroOpe <= 0) {
          console.warn(
            "âš ï¸ No se obtuvo nroOpe (dptrnntra) para consumir API BCP.",
          );
          setMensajeBanco(
            "âš ï¸ No se pudo obtener nÃºmero de operaciÃ³n para enviar al Banco.",
          );
          return;
        }

        // Obtener datos bancarios del usuario
        const datosBancarios = await fetchBankByUsuario(usuario);

        if (!datosBancarios) {
          console.warn("âš ï¸ Usuario sin cuenta bancaria registrada");
          setMensajeBanco(
            "âš ï¸ Usuario sin cuenta bancaria registrada. Omitiendo envÃ­o al Banco.",
          );
        } else {
          setEnviandoBanco(true);
          setMensajeBanco("Enviando informaciÃ³n al Banco (intento 1/1)...");
          let intentos = 0;
          let exito = false;

          while (intentos < 1 && !exito) {
            intentos++;
            setMensajeBanco(
              `Enviando informaciÃ³n al Banco (intento ${intentos}/1)...`,
            );

            const resultado = (await consumirApiBcp({
              endpoint: (conceptoReserva.descripcion || "").trim(),
              terminal:
                dispositivo.descripcion || dispositivo.codigo.toString(),
              accountNumber: datosBancarios.adbankncta,
              typeAccount: datosBancarios.adbanktipo,
              amount: montoCalculado,
              currencyAmount: datosBancarios.adbankmone,
              nroOpe,
            })) as {
              success: boolean;
              answerCode?: string;
              answerDetail?: string;
              error?: string;
              data?: any;
            };

            if (resultado.success && resultado.answerCode === "00") {
              setMensajeBanco("âœ… Respuesta exitosa del Banco.");
              exito = true;
              // âœ… ACTUALIZAR adapi con estado 2 (exitoso)
              if (adapiseriGuardado) {
                await updateAdapi(adapiseriGuardado, {
                  adapiresp: (resultado.answerCode || "00").slice(0, 10),
                  adapiobse: `${resultado.answerDetail || "Respuesta exitosa del Banco"}${
                    (resultado.data as any)?.answerOperationID
                      ? ` | OpID: ${(resultado.data as any).answerOperationID}`
                      : ""
                  }${
                    (resultado.data as any)?.answerNroAut
                      ? ` | NroAut: ${(resultado.data as any).answerNroAut}`
                      : ""
                  }`,
                  adapistat: 2,
                });
              }
            } else if (resultado.success) {
              setMensajeBanco(
                "âš ï¸ El Banco rechazÃ³ la operaciÃ³n: " +
                  (resultado.answerDetail || "Error"),
              );
              exito = true; // Respuesta recibida aunque sea rechazo
              // âŒ ACTUALIZAR adapi con estado 3 (error) y detalles del rechazo
              if (adapiseriGuardado) {
                await updateAdapi(adapiseriGuardado, {
                  adapiresp: (resultado.answerCode || "99").slice(0, 10),
                  adapiobse: `Banco rechazÃ³: ${
                    resultado.answerDetail || "Error desconocido"
                  }${
                    (resultado.data as any)?.answerOperationID
                      ? ` | OpID: ${(resultado.data as any).answerOperationID}`
                      : ""
                  }${
                    (resultado.data as any)?.answerNroAut
                      ? ` | NroAut: ${(resultado.data as any).answerNroAut}`
                      : ""
                  }`,
                  adapistat: 3,
                });
              }
            } else {
              setMensajeBanco(
                `Error al contactar el Banco: ${resultado.error}. Intento ${intentos}/1.`,
              );
              // âŒ ACTUALIZAR adapi con estado 3 (error) en el intento Ãºnico
              if (intentos === 1 && adapiseriGuardado) {
                await updateAdapi(adapiseriGuardado, {
                  adapiresp: (resultado.answerCode || "97").slice(0, 10),
                  adapiobse: `Error al contactar Banco: ${resultado.error}`,
                  adapistat: 3,
                });
              }
            }

            // Intento único: no hay reintentos.
          }

          if (!exito) {
            setMensajeBanco(
              "âŒ No se pudo contactar al Banco en el intento único. Volviendo al inicio en 3 segundos...",
            );
            // Esperar 3 segundos antes de volver al inicio
            await new Promise((r) => setTimeout(r, 3000));
          }

          setEnviandoBanco(false);
        }
      } else {
        console.warn(
          "âš ï¸ No se encontrÃ³ concepto con codigo = 1 para consumir BCP",
        );
      }
    } catch (error) {
      console.error("Error al depositar", error);
      alert("OcurriÃ³ un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar
  const handleCancelar = async () => {
    try {
      setIsSubmitting(true);
      setIsCancelling(true);

      // 1ï¸âƒ£ ENVIAR CANCEL â†’ abre compuerta
      await DE70_ActionCancelar(apiUrl!);
      console.log("ðŸŸ¡ CANCEL enviado, compuerta abierta");

      // 2ï¸âƒ£ ESPERAR que el operador cierre la compuerta
      await waitForEscrowDoorClosed(apiUrl!);
      console.log("âœ… Operador cerrÃ³ la compuerta");

      // 3ï¸âƒ£ ENVIAR UNLOCK â†’ volver a estado limpio
      await DE70_ActionUnlock(apiUrl!);
      console.log("ðŸ”“ UNLOCK enviado");

      // 4ï¸âƒ£ CONFIRMAR estado inicial (login + standby)
      await waitForCancelComplete(apiUrl!);
      console.log("âœ… Equipo en estado inicial");

      // 5ï¸âƒ£ LIMPIAR UI
      setMoneda(null);
      setMonedaBd(null);
      setMonedaAbrev("");
      setBloqueado(false);

      setDatosDpmtr([]);
      setCortesActualizados([]);
      setMostrarBoucher(false);
      setMontoFinal(0);
    } catch (error) {
      console.error("âŒ Error en cancelar", error);
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
      {/* ðŸ”´ BOUCHER: SIEMPRE EN EL ÃRBOL */}
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

            // volver a selecciÃ³n de moneda
            setMoneda(null);
            setMonedaBd(null);
            setMonedaAbrev("");
            setBloqueado(false);

            // limpiar estado transacciÃ³n
            setDatosDpmtr([]);
            setCortesActualizados([]);
            setMontoFinal(0);
            setFechaHoy("");
            setHoraHoy("");
          }}
        />
      )}

      {/* ðŸ”µ PANTALLA SELECCIÃ“N MONEDA */}
      {!moneda || !bloqueado ? (
        <div className="h-screen flex items-center justify-center flex-col gap-4">
          {/* âš ï¸ Advertencia si API_BCP estÃ¡ configurado pero no hay conceptos */}
          {advertenciaApiBank && (
            <div className="absolute top-4 right-4 left-4 bg-yellow-100 text-yellow-800 p-4 rounded-md border-l-4 border-yellow-500">
              <p className="font-semibold">
                âš ï¸ Advertencia: APIs del Banco no cargadas
              </p>
              <p className="text-sm">
                No se encontraron conceptos con prefijo 5 en la tabla de
                conceptos.
              </p>
              <p className="text-sm">
                El sistema continuarÃ¡ funcionando sin auditorÃ­a de API.
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
        /* ðŸŸ¢ PANTALLA PRINCIPAL DEPÃ“SITO */
        <div className="w-full">
          <div className="flex w-full items-center justify-between">
            <h1 className={`${lusitana.className} text-2xl`}>
              DEPOSITO DE EFECTIVO
            </h1>
          </div>

          {/* âš ï¸ Advertencia si API_BCP estÃ¡ configurado pero no hay conceptos */}
          {advertenciaApiBank && (
            <div className="mt-4 bg-yellow-100 text-yellow-800 p-4 rounded-md border-l-4 border-yellow-500">
              <p className="font-semibold">
                âš ï¸ Advertencia: APIs del Banco no cargadas
              </p>
              <p className="text-sm">
                No se encontraron conceptos con prefijo 5 en la tabla de
                conceptos.
              </p>
              <p className="text-sm">
                El sistema continuarÃ¡ funcionando sin auditorÃ­a de API.
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

