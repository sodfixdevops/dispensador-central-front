"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { AdbankData, dpmtr, gbcucy, TrconData } from "@/app/lib/definitions";
import {
  DE70_ActionCancelar,
  DE70_ActionStoreStart,
  DE70_ActionUnlock,
  DE70_FlujoIniciarConteo,
  DE70_FlujoIniciarTransaccion,
  GetMonitorCortes,
  waitForCancelComplete,
  waitForEscrowDoorClosed,
  waitForSR2,
  FetchCortes,
} from "@/app/lib/de70-actions";
import { FetchConceptosByPrefijo } from "@/app/lib/conceptos-actions";
import {
  registrarTransaccion,
  fetchTransaccionesEstado,
  descartarTransaccion,
} from "@/app/lib/transaccion-actions";
import { registrarApiCall, updateAdapi } from "@/app/lib/adapi-actions";
import { fetchBankByUsuario } from "@/app/lib/adbank-actions";
import { getBcpConfig, consumirApiBcp } from "@/app/lib/env-server-actions";
import { construirUrlBcp, ENV_CONFIG } from "@/app/lib/env-config";

import PantallaMoneda from "@/app/ui/depositador/PantallaMoneda";
import PantallaInstrucciones from "@/app/ui/depositador/PantallaInstrucciones";
import PantallaDetalle from "@/app/ui/depositador/PantallaDetalle";
import BoucherDepositador from "@/app/ui/depositador/BoucherDepositador";
import ControlEstadoDE70 from "@/app/ui/depositador/ControlEstadoDE70";

// Funcion para obtener fecha y hora actual
function obtenerFechaHoraActual() {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString();
  const hora = ahora.toLocaleTimeString();
  return { fecha, hora };
}

type Pantalla = "moneda" | "instrucciones" | "detalle" | "boucher";

export default function DepositadorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Small delay to allow the message to render before navigation
      const t = setTimeout(() => router.push("/login"), 200);
      return () => clearTimeout(t);
    }
  }, [status, router]);

  // Estados principales
  const [pantalla, setPantalla] = useState<Pantalla>("moneda");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comunicacionOk, setComunicacionOk] = useState(false);

  // Moneda
  const [moneda, setMoneda] = useState<number | null>(null);
  const [monedabd, setMonedaBd] = useState<number | null>(null);
  const [monedaAbrev, setMonedaAbrev] = useState<string>("");
  const [bloqueado, setBloqueado] = useState(false);
  const [loadingMoneda, setLoadingMoneda] = useState(false);
  const [monedasDisponibles, setMonedasDisponibles] = useState<TrconData[]>([]);
  const [conceptosReserva, setConceptosReserva] = useState<TrconData[]>([]);
  const [advertenciaApiBank, setAdvertenciaApiBank] = useState(false);
  const [enviandoBanco, setEnviandoBanco] = useState(false);
  const [mensajeBanco, setMensajeBanco] = useState("");
  const [datosBancarios, setDatosBancarios] = useState<AdbankData | null>(null);
  const [bloqueadoPorRecoleccion, setBloqueadoPorRecoleccion] = useState(false);

  // Conteo
  const [datosDpmtr, setDatosDpmtr] = useState<dpmtr[]>([]);
  const [cortesActualizados, setCortesActualizados] = useState<gbcucy[]>([]);
  const [montoFinal, setMontoFinal] = useState<number>(0);

  // Boucher
  const [mostrarBoucher, setMostrarBoucher] = useState(false);
  const [fechaHoy, setFechaHoy] = useState("");
  const [horaHoy, setHoraHoy] = useState("");
  const [numeroTransaccion, setNumeroTransaccion] = useState<string>("");

  const apiUrl = session?.user?.dispositivo?.api_url;
  const dispositivo = session?.user?.dispositivo;

  const handleEstadoChange = useCallback((ok: boolean) => {
    setComunicacionOk(ok);
  }, []);

  // Cargar monedas disponibles
  useEffect(() => {
    const cargarMonedas = async () => {
      const conceptos = await FetchConceptosByPrefijo(2);
      setMonedasDisponibles(conceptos);
    };
    cargarMonedas();
  }, []);

  // Cargar conceptos de reserva (prefijo 5)
  useEffect(() => {
    const cargarConceptosReserva = async () => {
      const conceptos = await FetchConceptosByPrefijo(5);
      setConceptosReserva(conceptos);
      const config = await getBcpConfig();
      if (config.apiUrl && conceptos.length === 0) {
        setAdvertenciaApiBank(true);
      }
    };
    cargarConceptosReserva();
  }, []);

  useEffect(() => {
    const username = session?.user?.username;
    if (!username) return;
    let active = true;

    const cargarDatosBancarios = async () => {
      const data = await fetchBankByUsuario(username);
      if (active) {
        setDatosBancarios(data);
      }
    };

    cargarDatosBancarios();
    return () => {
      active = false;
    };
  }, [session?.user?.username]);

  // Verificar transacciones pendientes de recoleccion (estado 2 o 3)
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

        // Verificar estado 3 (en recoleccion)
        const estado3 = await fetchTransaccionesEstado(3, dispositivo.codigo);
        if (estado3.length > 0) {
          setBloqueadoPorRecoleccion(true);
          return;
        }

        setBloqueadoPorRecoleccion(false);
      } catch (error) {
        console.error("Error al verificar recoleccion pendiente:", error);
      }
    };

    verificarRecoleccionPendiente();
    // Verificar cada 10 segundos
    const intervalo = setInterval(verificarRecoleccionPendiente, 10000);
    return () => clearInterval(intervalo);
  }, [dispositivo]);

  // Validar autenticacion y dispositivo
  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-2xl">Cargando...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-red-50">
        <div className="bg-red-100 text-red-700 p-8 rounded-lg text-xl">
          No autenticado. Redirigiendo al login...
        </div>
      </div>
    );
  }

  if (!dispositivo || dispositivo.codigo === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-red-50">
        <div className="bg-red-100 text-red-700 p-8 rounded-lg text-center">
          <p className="text-xl font-bold mb-4">No hay dispositivo asignado</p>
          <p className="text-lg">
            El usuario <strong>{session?.user?.username}</strong> no tiene un
            dispositivo asignado para realizar depositos.
          </p>
        </div>
      </div>
    );
  }

  // Bloqueo por recoleccion pendiente
  if (bloqueadoPorRecoleccion) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="bg-white border-4 border-orange-500 rounded-lg p-8 shadow-2xl text-center max-w-md">
          <div className="text-6xl mb-4">||</div>
          <h1 className="text-3xl font-bold text-orange-800 mb-4">
            Dispositivo Bloqueado
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Dispositivo a la espera de recoleccion de efectivo
          </p>
          <p className="text-sm text-gray-500">
            Por favor, realice la recoleccion del efectivo antes de continuar
            con nuevos depositos.
          </p>
        </div>
      </div>
    );
  }

  // ========== HANDLERS ==========

  // 1) Seleccionar moneda
  const handleSeleccionarMoneda = async (
    codigo: number,
    abreviacion: string,
  ) => {
    if (!apiUrl) return;

    let currency = 0;
    if (abreviacion === "BOB") currency = 2;
    else if (abreviacion === "USD") currency = 0;
    else {
      alert("Moneda no valida");
      return;
    }

    setLoadingMoneda(true);

    try {
      const result = await DE70_FlujoIniciarTransaccion(apiUrl, 1, currency, 1);

      if (result.success) {
        setMonedaBd(codigo);
        setMoneda(currency);
        setMonedaAbrev(abreviacion);
        setBloqueado(true);
        setPantalla("instrucciones");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error al seleccionar moneda:", error);
      alert("Error al seleccionar moneda");
    } finally {
      setLoadingMoneda(false);
    }
  };

  // 2) Contar billetes (desde instrucciones)
  const handleContarDesdeInstrucciones = async () => {
    if (!apiUrl || monedabd === null) {
      alert("Datos incompletos");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await DE70_FlujoIniciarConteo(apiUrl, monedabd);

      if (result.success) {
        const data = await GetMonitorCortes(apiUrl, 1);
        setDatosDpmtr(data);

        // Cargar cortes y actualizar
        const cortesData = await FetchCortes(apiUrl, 1);
        const cortesActual = cortesData
          .map((corte) => {
            const encontrado = data.find(
              (d) => d.dpmtrdsid === corte.gbcucydnid,
            );
            const cantidad = encontrado?.dpmtrcant ?? 0;
            return { ...corte, gbcucycant: cantidad };
          })
          .filter((c) => (c.gbcucycant ?? 0) > 0);

        setCortesActualizados(cortesActual);

        const monto = cortesActual.reduce((sum, c) => {
          return sum + (c.gbcucycant ?? 0) * c.gbcucyvlor!;
        }, 0);
        setMontoFinal(monto);

        setPantalla("detalle");
      } else {
        alert(result.message || "Error al contar");
      }
    } catch (error) {
      console.error("Error al contar:", error);
      alert("Error al contar billetes");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3) Contar billetes (desde detalle)
  const handleContarDesdeDetalle = async () => {
    if (!apiUrl || monedabd === null) return;

    setIsSubmitting(true);

    try {
      const result = await DE70_FlujoIniciarConteo(apiUrl, monedabd);

      if (result.success) {
        const data = await GetMonitorCortes(apiUrl, 1);
        setDatosDpmtr(data);

        const cortesData = await FetchCortes(apiUrl, 1);
        const cortesActual = cortesData
          .map((corte) => {
            const encontrado = data.find(
              (d) => d.dpmtrdsid === corte.gbcucydnid,
            );
            const cantidad = encontrado?.dpmtrcant ?? 0;
            return { ...corte, gbcucycant: cantidad };
          })
          .filter((c) => (c.gbcucycant ?? 0) > 0);

        setCortesActualizados(cortesActual);

        const monto = cortesActual.reduce((sum, c) => {
          return sum + (c.gbcucycant ?? 0) * c.gbcucyvlor!;
        }, 0);
        setMontoFinal(monto);

        // Se mantiene en pantalla "detalle"
      } else {
        alert(result.message || "Error al contar");
      }
    } catch (error) {
      console.error("Error al contar:", error);
      alert("Error al contar billetes");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4) Depositar
  const handleDepositar = async () => {
    if (!session?.user?.id || !apiUrl || monedabd === null) {
      alert("Datos incompletos");
      return;
    }

    setIsSubmitting(true);

    try {
      const usuario = session.user.id;

      const detalleFiltrado = cortesActualizados
        .filter((c) => (c.gbcucycant ?? 0) > 0 && c.gbcucyvlor !== undefined)
        .map((c) => ({
          gbcucyvlor: c.gbcucyvlor!,
          gbcucycant: c.gbcucycant ?? 0,
        }));

      if (detalleFiltrado.length === 0) {
        alert("No hay billetes para registrar");
        return;
      }

      // Paso 1: Registrar transaccion para obtener nroOperacion (dptrnntra)
      const result = await registrarTransaccion({
        usuario,
        moneda: monedabd,
        dispositivo: dispositivo.codigo,
        detalle: detalleFiltrado,
      });

      // Extraer nro de transaccion generado en backend
      let txNumber: string | number | undefined;
      if (result) {
        txNumber =
          (result as any).ntra ||
          (result as any).ndes ||
          (result as any).numero ||
          (result as any).id ||
          (result as any).transaccionId ||
          (result as any).adapiseri;
        if (!txNumber) {
          txNumber =
            (result as any).transaccion?.id ||
            (result as any).data?.id ||
            (result as any).data?.transaccion?.id ||
            (result as any).ntra;
        }
      }

      const ok =
        (result &&
          ((result as any).success === undefined
            ? true
            : (result as any).success)) ||
        false;
      if (!ok || !txNumber) {
        alert((result as any)?.message || "Error al registrar transacción");
        return;
      }
      const nroOpe = Number(txNumber);
      if (!Number.isFinite(nroOpe) || nroOpe <= 0) {
        alert("No se pudo obtener el numero de operacion.");
        return;
      }

      // Paso 2: Registrar en tabla adapi (auditoria antes de consumir)
      const conceptoReserva = conceptosReserva.find((c) => c.correlativo === 1);
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

        if (!registroApi.success) {
          console.warn(
            "Advertencia: Error al registrar en adapi:",
            registroApi.message,
          );
        } else {
          console.log(
            "API registrada en tabla adapi con ID:",
            registroApi.data?.adapiseri,
          );
          adapiseriGuardado = registroApi.data?.adapiseri;
        }
      } else {
        console.warn("No se encontro concepto con codigo = 1");
      }

      // Paso 3: Consumir API BCP (1 intento)
      // Regla de negocio:
      // - answerCode 00 -> abrir store y finalizar
      // - timeout/sin respuesta -> abrir store y finalizar
      // - respuesta negativa -> cancelar y devolver efectivo
      let decisionFlujo: "open-store" | "cancel" = "open-store";
      let detalleRechazo = "";

      if (conceptoReserva) {
        // Obtener datos bancarios del usuario
        const datosBancariosActuales =
          datosBancarios ?? (await fetchBankByUsuario(usuario!));

        if (!datosBancariosActuales) {
          console.warn("Usuario sin cuenta bancaria registrada");
          setMensajeBanco(
            "Usuario sin cuenta bancaria registrada. Omitiendo envio al Banco.",
          );
          if (adapiseriGuardado) {
            await updateAdapi(adapiseriGuardado, {
              adapiresp: "",
              adapiobse: "Usuario sin cuenta bancaria registrada",
              adapistat: 3,
            });
          }
          decisionFlujo = "open-store";
        } else {
          if (!datosBancarios) {
            setDatosBancarios(datosBancariosActuales);
          }
          setEnviandoBanco(true);
          setMensajeBanco("Enviando informacion al Banco (intento 1/1)...");
          let intentos = 0;
          let exito = false;
          let ultimoErrorContacto = "";

          try {
            while (intentos < 1 && !exito) {
              intentos++;
              setMensajeBanco(
                `Enviando informacion al Banco (intento ${intentos}/1)...`,
              );

              const resultado = (await consumirApiBcp({
                endpoint: conceptoReserva.descripcion || "",
                terminal:
                  dispositivo.descripcion || dispositivo.codigo.toString(),
                accountNumber: datosBancariosActuales.adbankncta,
                typeAccount: datosBancariosActuales.adbanktipo,
                amount: montoFinal,
                currencyAmount: datosBancariosActuales.adbankmone,
                nroOpe,
              })) as {
                success: boolean;
                answerCode?: string;
                answerDetail?: string;
                error?: string;
                data?: any;
              };

              if (resultado.success && resultado.answerCode === "00") {
                setMensajeBanco("Respuesta exitosa del Banco.");
                exito = true;
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
                decisionFlujo = "open-store";
              } else if (resultado.success) {
                const detalle =
                  resultado.answerDetail || "Respuesta con error del Banco";
                setMensajeBanco("El Banco rechazo la operacion: " + detalle);
                detalleRechazo = detalle;
                decisionFlujo = "cancel";
                exito = true; // Respuesta recibida, pero con error funcional
                if (adapiseriGuardado) {
                  await updateAdapi(adapiseriGuardado, {
                    adapiresp: (resultado.answerCode || "99").slice(0, 10),
                    adapiobse: `Banco rechazo: ${detalle}${
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
                ultimoErrorContacto = resultado.error || "Sin detalle de error";
                setMensajeBanco(
                  `Error al contactar el Banco: ${ultimoErrorContacto}. Intento ${intentos}/1.`,
                );
              }

              // Intento unico: no hay reintentos.
            }
          } catch (error) {
            const detalle =
              error instanceof Error ? error.message : "Error desconocido";
            setMensajeBanco(
              `Error al procesar respuesta del Banco: ${detalle}`,
            );
            if (adapiseriGuardado) {
              await updateAdapi(adapiseriGuardado, {
                adapiresp: "96",
                adapiobse: `Error al procesar respuesta del Banco: ${detalle}`,
                adapistat: 3,
              });
            }
          }

          if (!exito) {
            setMensajeBanco("No se pudo contactar al Banco en el intento unico.");
            if (adapiseriGuardado) {
              await updateAdapi(adapiseriGuardado, {
                adapiresp: "95",
                adapiobse:
                  "Sin respuesta del Banco en el intento unico" +
                  (ultimoErrorContacto ? `: ${ultimoErrorContacto}` : ""),
                adapistat: 8,
              });
            }
            decisionFlujo = "open-store";
          }

          setEnviandoBanco(false);
        }
      } else {
        console.warn(
          "No se encontro concepto con codigo = 1 para consumir BCP",
        );
        decisionFlujo = "open-store";
      }

      // Paso 4: Si respuesta BCP fue negativa, cancelar y devolver efectivo
      if (decisionFlujo === "cancel") {
        setMensajeBanco("Cancelando operacion y devolviendo efectivo...");
        await DE70_ActionCancelar(apiUrl);
        await waitForEscrowDoorClosed(apiUrl);
        await DE70_ActionUnlock(apiUrl);
        await waitForCancelComplete(apiUrl);
        await descartarTransaccion(
          nroOpe,
          usuario,
          `BCP rechazo: ${detalleRechazo || "sin detalle"}`,
        );

        alert(
          `Operacion rechazada por el Banco${detalleRechazo ? `: ${detalleRechazo}` : ""}. Se devolvio el efectivo al usuario.`,
        );
        resetUI();
        return;
      }

      // Paso 5: Abrir store y finalizar
      await DE70_ActionStoreStart(apiUrl);
      await waitForSR2(apiUrl);
      await DE70_ActionUnlock(apiUrl);

      // Paso 6: Mostrar boucher al finalizar
      const { fecha, hora } = obtenerFechaHoraActual();
      setFechaHoy(fecha);
      setHoraHoy(hora);
      setNumeroTransaccion(txNumber ? String(txNumber) : "");
      setMostrarBoucher(true);
      setPantalla("boucher");
    } catch (error) {
      console.error("Error al depositar:", error);
      alert("Error al depositar");
    } finally {
      setEnviandoBanco(false);
      setIsSubmitting(false);
    }
  };

  // 5) Cancelar (desde instrucciones)
  const handleCancelarDesdeInstrucciones = async () => {
    if (!apiUrl) return;

    setIsSubmitting(true);

    try {
      // 1: Cancel
      await DE70_ActionCancelar(apiUrl);

      // 2: Esperar que cierre puerta
      await waitForEscrowDoorClosed(apiUrl);

      // 3: Unlock
      await DE70_ActionUnlock(apiUrl);

      // 4: Confirmar estado
      await waitForCancelComplete(apiUrl);

      // 5: Reiniciar
      resetUI();
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("Error al cancelar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6) Cancelar (desde detalle)
  const handleCancelarDesdeDetalle = async () => {
    if (!apiUrl) return;

    setIsSubmitting(true);

    try {
      await DE70_ActionCancelar(apiUrl);
      await waitForEscrowDoorClosed(apiUrl);
      await DE70_ActionUnlock(apiUrl);
      await waitForCancelComplete(apiUrl);

      resetUI();
    } catch (error) {
      console.error("Error al cancelar:", error);
      alert("Error al cancelar");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7) Cerrar boucher
  const handleCerrarBoucher = () => {
    resetUI();
  };

  // Resetear UI
  const resetUI = () => {
    setMoneda(null);
    setMonedaBd(null);
    setMonedaAbrev("");
    setBloqueado(false);
    setDatosDpmtr([]);
    setCortesActualizados([]);
    setMontoFinal(0);
    setMostrarBoucher(false);
    setFechaHoy("");
    setHoraHoy("");
    setPantalla("moneda");
  };

  // ========== RENDER ==========

  const controlBloqueo = isSubmitting || !comunicacionOk;

  let contenido: JSX.Element | null = null;

  if (pantalla === "moneda") {
    contenido = (
      <PantallaMoneda
        monedasDisponibles={monedasDisponibles}
        loading={loadingMoneda}
        onSeleccionar={handleSeleccionarMoneda}
        advertenciaApiBank={advertenciaApiBank}
        disabled={!comunicacionOk}
      />
    );
  }

  if (pantalla === "instrucciones") {
    contenido = (
      <PantallaInstrucciones
        monedaAbrev={monedaAbrev}
        onContar={handleContarDesdeInstrucciones}
        onCancelar={handleCancelarDesdeInstrucciones}
        disabled={controlBloqueo}
      />
    );
  }

  if (pantalla === "detalle") {
    contenido = (
      <PantallaDetalle
        cortesActualizados={cortesActualizados}
        montoTotal={montoFinal}
        onContar={handleContarDesdeDetalle}
        onDepositar={handleDepositar}
        onCancelar={handleCancelarDesdeDetalle}
        disabled={controlBloqueo}
        enviandoBanco={enviandoBanco}
        mensajeBanco={mensajeBanco}
      />
    );
  }

  if (pantalla === "boucher" && mostrarBoucher) {
    contenido = (
      <BoucherDepositador
        fecha={fechaHoy}
        hora={horaHoy}
        usuario={session?.user?.username || ""}
        cuenta={datosBancarios?.adbankncta || ""}
        montoTotal={montoFinal}
        moneda={monedaAbrev === "BOB" ? "Bs.-" : monedaAbrev}
        datosDpmtr={datosDpmtr}
        apiUrl={apiUrl!}
        numeroTransaccion={numeroTransaccion}
        onCerrar={handleCerrarBoucher}
      />
    );
  }

  return (
    <>
      {contenido}
      <ControlEstadoDE70 apiUrl={apiUrl} onEstadoChange={handleEstadoChange} />
    </>
  );
}

