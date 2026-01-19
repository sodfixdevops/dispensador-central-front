"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function DashboardHome() {
  const { data: session, status } = useSession(); // ← ESTA LÍNEA ES OBLIGATORIA
  const [fechaHoy, setFechaHoy] = useState("");

  useEffect(() => {
    const hoy = new Date();
    const formato = hoy.toLocaleDateString("es-BO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setFechaHoy(formato);
  }, []);

  // ⬇️ ESTAS VARIABLES DEPENDEN DE session
  const username = session?.user?.username ?? "Desconocido";
  const dispositivo = session?.user?.dispositivo;

  return (
    <div className="w-full px-6 py-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido al sistema <span className="text-blue-700">DE70</span>
        </h1>
        <p className="text-gray-600 mt-2 text-lg">{fechaHoy}</p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Usuario conectado
          </h2>
          <p className="text-xl text-gray-900">{username}</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">
            Dispositivo asignado
          </h2>
          <p className="text-xl text-gray-900">
            {typeof dispositivo === "string"
              ? dispositivo
              : dispositivo?.descripcion ?? "No asignado"}
          </p>
        </div>
      </div>

      {/* DEBUG SESSION */}
      <div className="w-full max-w-4xl mt-6 bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-auto">
        <h3 className="text-white font-semibold mb-2">Session (debug)</h3>

        {status === "loading" && <p>Cargando sesión…</p>}
        {status === "unauthenticated" && <p>No autenticado</p>}
        {status === "authenticated" && (
          <pre>{JSON.stringify(session, null, 2)}</pre>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <Image
          src="/images/de-70.jpg"
          alt="Imagen DE70"
          width={400}
          height={300}
          priority
          className="rounded-md shadow-md"
        />
      </div>
    </div>
  );
}
