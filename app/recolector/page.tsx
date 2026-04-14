"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  autorizarORechazarSolicitud,
  fetchTransaccionesEstado,
  generarSolicitudDesembolso,
  recolectarDesembolso,
} from "@/app/lib/transaccion-actions";
import { checkBackendThenDevice } from "@/app/lib/de70-actions";
import { imprimirBoucherSolicitudRecolecta } from "@/app/ui/recolectar/BoucherRecolecta";

type PasoRecolector = "inicio" | "retiro";
type EstadoComunicacion = "checking" | "ok" | "down";
type DispositivoSesion = { codigo: number; descripcion: string; api_url: string };

export default function RecolectorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [paso, setPaso] = useState<PasoRecolector>("inicio");
  const [numeroDesembolso, setNumeroDesembolso] = useState<number | null>(null);
  const [validandoContexto, setValidandoContexto] = useState(true);
  const [bloqueoInicio, setBloqueoInicio] = useState("");
  const [estadoComunicacion, setEstadoComunicacion] =
    useState<EstadoComunicacion>("checking");
  const [detalleComunicacion, setDetalleComunicacion] = useState("");
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const tipoUsuario = Number(session?.user?.tipo);
      if (tipoUsuario !== 3) {
        if (tipoUsuario === 2) {
          router.push("/depositador");
        } else {
          router.push("/dashboard");
        }
      }
    }
  }, [status, session?.user?.tipo, router]);

  if (status === "loading") {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-2xl">Cargando...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const tipoUsuario = Number(session?.user?.tipo);
  if (tipoUsuario !== 3) {
    return null;
  }

  const usuarioId = session?.user?.id ?? "";
  const usuarioNick = session?.user?.username ?? "";
  const dispositivosAsignados = useMemo(() => {
    const lista = ((session?.user as any)?.dispositivos || []) as DispositivoSesion[];
    const legacy = session?.user?.dispositivo as DispositivoSesion | undefined;

    if (lista.length > 0) return lista;
    if (legacy?.codigo) return [legacy];
    return [];
  }, [session?.user]);

  useEffect(() => {
    if (dispositivosAsignados.length === 1) {
      setDispositivoSeleccionado(dispositivosAsignados[0].codigo);
      return;
    }
    if (
      dispositivosAsignados.length > 1 &&
      !dispositivosAsignados.some((d) => d.codigo === dispositivoSeleccionado)
    ) {
      setDispositivoSeleccionado(null);
    }
  }, [dispositivosAsignados, dispositivoSeleccionado]);

  const dispositivoActivo =
    dispositivosAsignados.find((d) => d.codigo === dispositivoSeleccionado) ||
    null;

  useEffect(() => {
    if (status !== "authenticated" || Number(session?.user?.tipo) !== 3) return;
    if (paso !== "inicio") return;

    let cancelado = false;

    const validarInicio = async (isInitial = false) => {
      if (isInitial) {
        setValidandoContexto(true);
        setEstadoComunicacion("checking");
        setDetalleComunicacion("");
      }

      if (dispositivosAsignados.length === 0) {
        if (!cancelado) {
          setBloqueoInicio("El usuario recolector no tiene dispositivos asignados.");
          setValidandoContexto(false);
        }
        return;
      }

      if (!dispositivoActivo) {
        if (!cancelado) {
          setEstadoComunicacion("ok");
          setBloqueoInicio("");
          setValidandoContexto(false);
        }
        return;
      }

      try {
        const health = dispositivoActivo.api_url
          ? await checkBackendThenDevice(dispositivoActivo.api_url)
          : { backendOk: false, deviceOk: false };

        if (cancelado) return;

        if (!health.backendOk) {
          setEstadoComunicacion("down");
          setDetalleComunicacion("Sin comunicacion con el backend.");
          setValidandoContexto(true);
          return;
        }

        if (!health.deviceOk) {
          setEstadoComunicacion("down");
          setDetalleComunicacion(
            "Esperando respuesta del equipo. Verifique que este encendido.",
          );
          setValidandoContexto(true);
          return;
        }

        setEstadoComunicacion("ok");
        setDetalleComunicacion("");

        const [pendientesEstado1, pendientesEstado2, pendientesEstado3] =
          await Promise.all([
            fetchTransaccionesEstado(1, dispositivoActivo.codigo),
            fetchTransaccionesEstado(2, dispositivoActivo.codigo),
            fetchTransaccionesEstado(3, dispositivoActivo.codigo),
          ]);

        if (cancelado) return;

        const totalPendientes =
          pendientesEstado1.length +
          pendientesEstado2.length +
          pendientesEstado3.length;

        if (totalPendientes === 0) {
          setBloqueoInicio(
            "No hay efectivo pendiente de recoleccion en el dispositivo seleccionado.",
          );
          setValidandoContexto(false);
          return;
        }

        setBloqueoInicio("");
        setValidandoContexto(false);
      } catch (error) {
        console.error("Error validando inicio de recoleccion:", error);
        if (!cancelado) {
          setEstadoComunicacion("down");
          setDetalleComunicacion("No se pudo validar la comunicacion.");
          setValidandoContexto(true);
        }
      }
    };

    validarInicio(true);
    const intervalId = setInterval(() => validarInicio(false), 5000);

    return () => {
      cancelado = true;
      clearInterval(intervalId);
    };
  }, [
    status,
    session?.user?.tipo,
    dispositivosAsignados,
    dispositivoActivo?.codigo,
    dispositivoActivo?.api_url,
    paso,
  ]);

  const handleRetiroBoveda = async () => {
    if (!usuarioId || !usuarioNick) {
      alert("Sesion invalida.");
      return;
    }
    if (!dispositivoActivo?.codigo) {
      alert("Seleccione un dispositivo para continuar.");
      return;
    }
    if (bloqueoInicio) {
      alert(bloqueoInicio);
      return;
    }

    setProcesando(true);
    setMensaje("Generando desembolso...");

    try {
      if (dispositivoActivo.api_url) {
        const health = await checkBackendThenDevice(dispositivoActivo.api_url);
        if (!health.backendOk || !health.deviceOk) {
          alert(
            "El equipo ya no responde o se perdio comunicacion. Verifique el dispositivo y vuelva a intentar.",
          );
          return;
        }
      }

      const solicitud = await generarSolicitudDesembolso(
        usuarioId,
        dispositivoActivo.codigo,
      );

      if (!solicitud.success || !solicitud.ndes) {
        alert(solicitud.message || "No se pudo generar desembolso.");
        return;
      }

      setMensaje("Autorizando solicitud automaticamente...");
      const autorizacion = await autorizarORechazarSolicitud(
        solicitud.ndes,
        usuarioId,
        2,
      );

      if (!autorizacion.success) {
        alert(autorizacion.message || "No se pudo autorizar la solicitud.");
        return;
      }

      setMensaje("Imprimiendo baucher...");
      imprimirBoucherSolicitudRecolecta({
        numeroDesembolso: solicitud.ndes,
        usuario: usuarioNick,
        dispositivo: solicitud.dispositivo || dispositivoActivo.codigo,
        dispositivoNombre: dispositivoActivo.descripcion,
        moneda: solicitud.moneda || 1,
        detalle: solicitud.detalle || [],
        totalPiezas: solicitud.totalPiezas || 0,
        totalImporte: solicitud.totalImporte || 0,
      });

      setNumeroDesembolso(solicitud.ndes);
      setPaso("retiro");
      setMensaje("");
    } catch (error) {
      console.error("Error en flujo automatico de recoleccion:", error);
      alert("Ocurrio un error al iniciar el retiro de efectivo.");
    } finally {
      setProcesando(false);
    }
  };

  const handleFinalizarRecoleccion = async () => {
    if (!numeroDesembolso) {
      alert("No existe un desembolso pendiente de finalizar.");
      return;
    }

    setProcesando(true);
    setMensaje("Finalizando recoleccion...");

    try {
      const recoleccion = await recolectarDesembolso(numeroDesembolso);
      if (!recoleccion.success) {
        alert(recoleccion.message || "No se pudo finalizar la recoleccion.");
        return;
      }

      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Error al finalizar recoleccion:", error);
      alert("Ocurrio un error al finalizar la recoleccion.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#002B76] to-[#024FD6]">
      {estadoComunicacion !== "ok" && paso === "inicio" && dispositivoActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 p-8 max-w-md w-[90%] text-center">
            <div className="text-red-700 text-2xl font-bold mb-3">
              {estadoComunicacion === "checking"
                ? "Verificando comunicacion"
                : "Esperando respuesta del equipo"}
            </div>
            <p className="text-gray-700 text-base mb-4">
              {estadoComunicacion === "checking"
                ? "Validando conexion con los servicios. Espere un momento."
                : detalleComunicacion ||
                  "No se puede continuar hasta recuperar la comunicacion con el equipo."}
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              <span>
                {estadoComunicacion === "checking"
                  ? "Verificando conexion..."
                  : "Reintentando conexion..."}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl rounded-xl bg-white/95 p-8 shadow-2xl">
        {validandoContexto &&
          estadoComunicacion === "ok" &&
          !!dispositivoActivo &&
          paso === "inicio" && (
            <div className="rounded-lg bg-slate-50 p-5 text-slate-700">
              Validando dispositivo y efectivo pendiente...
            </div>
          )}

        {!validandoContexto && bloqueoInicio && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-5 text-slate-800">
            <p className="font-semibold">{bloqueoInicio}</p>
            <div className="mt-5">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md px-6 py-3 font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Volver al inicio de sesion
              </button>
            </div>
          </div>
        )}

        {!validandoContexto && !bloqueoInicio && paso === "inicio" && (
          <>
            <h1 className="text-3xl font-bold text-slate-800">
              Recoleccion de Efectivo
            </h1>
            <p className="mt-2 text-slate-600">
              Usuario: <strong>{usuarioNick}</strong>
            </p>

            {dispositivosAsignados.length > 1 && (
              <div className="mt-6">
                <p className="text-slate-700 font-semibold mb-3">
                  Seleccione el dispositivo:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dispositivosAsignados.map((d) => {
                    const activo = d.codigo === dispositivoSeleccionado;
                    return (
                      <button
                        key={d.codigo}
                        onClick={() => setDispositivoSeleccionado(d.codigo)}
                        className={`rounded-lg border-2 p-4 text-left transition ${
                          activo
                            ? "border-[#F26E29] bg-orange-50"
                            : "border-slate-200 bg-white hover:border-[#F26E29]/60"
                        }`}
                      >
                        <div className="text-base font-bold text-slate-800">
                          {d.descripcion}
                        </div>
                        <div className="text-sm text-slate-600">
                          Codigo: {d.codigo}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {dispositivosAsignados.length === 1 && dispositivoActivo && (
              <p className="text-slate-600 mt-2">
                Dispositivo asignado: <strong>{dispositivoActivo.descripcion}</strong>
              </p>
            )}

            <div className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
              Presione el boton para generar e imprimir el baucher con el
              detalle del efectivo que debe retirar de la boveda.
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRetiroBoveda}
                disabled={procesando || !dispositivoActivo}
                className={`rounded-md px-6 py-3 text-white font-semibold transition ${
                  procesando || !dispositivoActivo
                    ? "bg-[#F26E29]/60 cursor-not-allowed"
                    : "bg-[#F26E29] hover:bg-[#d65a22]"
                }`}
              >
                {procesando ? "Procesando..." : "Retiro de efectivo en boveda"}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                disabled={procesando}
                className="rounded-md px-6 py-3 font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Salir
              </button>
            </div>
          </>
        )}

        {!validandoContexto && !bloqueoInicio && paso === "retiro" && (
          <>
            <h1 className="text-3xl font-bold text-slate-800">
              Instrucciones de Recoleccion
            </h1>
            <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-5 text-slate-800">
              <p className="text-lg font-semibold">
                Proceda a retirar el efectivo de la boveda introduciendo la clave
                proporcionada.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Nro. desembolso: <strong>{numeroDesembolso}</strong>
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleFinalizarRecoleccion}
                disabled={procesando}
                className={`rounded-md px-6 py-3 text-white font-semibold transition ${
                  procesando
                    ? "bg-[#F26E29]/60 cursor-not-allowed"
                    : "bg-[#F26E29] hover:bg-[#d65a22]"
                }`}
              >
                {procesando ? "Finalizando..." : "Finalizar la recoleccion"}
              </button>
            </div>
          </>
        )}

        {mensaje && (
          <p className="mt-6 rounded-md bg-blue-50 px-4 py-3 text-blue-800 text-sm">
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}
