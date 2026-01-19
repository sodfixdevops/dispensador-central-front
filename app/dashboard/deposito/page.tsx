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
import { registrarTransaccion } from "@/app/lib/transaccion-actions";
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
  const [cortesActualizados, setCortesActualizados] = useState<gbcucy[]>([]);
  const [mostrarBoucher, setMostrarBoucher] = useState(false);
  const [montoFinal, setMontoFinal] = useState<number>(0);
  const [fechaHoy, setFechaHoy] = useState("");
  const [horaHoy, setHoraHoy] = useState("");
  const [monedaAbrev, setMonedaAbrev] = useState<string>("");

  // Variables de carga y estado de cancelar
  const [isCancelling, setIsCancelling] = useState(false);

  const apiUrl = session?.user?.dispositivo?.api_url;

  // Cargar monedas disponibles
  useEffect(() => {
    const cargarMonedas = async () => {
      const conceptos = await FetchConceptosByPrefijo(2); // prefijo para monedas
      setMonedasDisponibles(conceptos);
    };
    cargarMonedas();
  }, []);

  if (status === "loading") return <div>Cargando...</div>;

  const dispositivo = session?.user?.dispositivo;
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

      if (!session?.user?.username) {
        alert("Sesión inválida.");
        return;
      }

      const usuario = session.user.username;

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

      // Paso B: enviar storestart
      await DE70_ActionStoreStart(apiUrl!);

      // Paso C: esperar fin del proceso (NO D2)
      await waitForSR2(apiUrl!);

      // Paso D: unlock
      await DE70_ActionUnlock(apiUrl!);

      console.log("hizo unlock y la moneda es ", monedabd);

      // Paso E: registrar transacción
      const result = await registrarTransaccion({
        usuario,
        moneda: monedabd!,
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

          <div className="mt-4 flex items-center justify-start gap-2 md:mt-8">
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
