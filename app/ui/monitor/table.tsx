"use client";

import { useState, useEffect } from "react";
import { DispositivoData } from "@/app/lib/definitions";
import { DE70_ActionSense } from "@/app/lib/de70-actions";

export default function MonitorTable({
  dispositivos,
}: {
  dispositivos: DispositivoData[];
}) {
  const [statuses, setStatuses] = useState<
    Map<number, { loading: boolean; data?: any; error?: string }>
  >(new Map());

  useEffect(() => {
    const fetchAllStatuses = async () => {
      const newStatuses = new Map();

      for (const dispositivo of dispositivos) {
        newStatuses.set(dispositivo.addispcode, { loading: true });

        try {
          if (!dispositivo.addipsapis) {
            newStatuses.set(dispositivo.addispcode, {
              loading: false,
              error: "URL no configurada",
            });
            continue;
          }

          const result = await DE70_ActionSense(dispositivo.addipsapis);

          if (result) {
            newStatuses.set(dispositivo.addispcode, {
              loading: false,
              data: result,
            });
          } else {
            newStatuses.set(dispositivo.addispcode, {
              loading: false,
              error: "No hay respuesta",
            });
          }
        } catch (error: any) {
          newStatuses.set(dispositivo.addispcode, {
            loading: false,
            error: error.message || "Error en la solicitud",
          });
        }
      }

      setStatuses(newStatuses);
    };

    fetchAllStatuses();
  }, [dispositivos]);

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-100 border-b-2 border-gray-300">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            Dispositivo
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            Código
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            Usuario
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            S1
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            S2
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            SR2
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            D2
          </th>
          <th className="px-4 py-3 text-left font-semibold text-gray-700">
            Estado
          </th>
        </tr>
      </thead>
      <tbody>
        {dispositivos.map((dispositivo) => {
          const status = statuses.get(dispositivo.addispcode);

          return (
            <tr
              key={dispositivo.addispcode}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-3 font-medium">
                {dispositivo.addispnomb}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {dispositivo.addispcode}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {dispositivo.nomUsuario || "-"}
              </td>

              {status?.loading ? (
                <>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    <span className="inline-block animate-spin">⏳</span>
                    Cargando...
                  </td>
                </>
              ) : status?.error ? (
                <>
                  <td
                    colSpan={5}
                    className="px-4 py-3 text-center text-red-500 text-sm"
                  >
                    ❌ {status.error}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3">
                    <ValueBadge value={status?.data?.interpretacion?.S1} />
                  </td>
                  <td className="px-4 py-3">
                    <ValueBadge value={status?.data?.interpretacion?.S2} />
                  </td>
                  <td className="px-4 py-3">
                    <ValueBadge value={status?.data?.interpretacion?.SR2} />
                  </td>
                  <td className="px-4 py-3">
                    <ValueBadge value={status?.data?.interpretacion?.D2} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusIndicator sr2={status?.data?.interpretacion?.SR2} />
                  </td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ValueBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-gray-400">-</span>;

  const hexMatch = value.match(/0x[0-9a-fA-F]+/);
  const description = value.replace(/\s*0x[0-9a-fA-F]+\s*/g, "").trim();

  const getColorClass = (desc: string) => {
    if (
      desc.includes("error") ||
      desc.includes("Error") ||
      desc.includes("not full") ||
      desc.includes("empty")
    ) {
      return "bg-red-100 text-red-800";
    }
    if (
      desc.includes("Login mode") ||
      desc.includes("Stand by") ||
      desc.includes("closed")
    ) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (
      desc.includes("Ready") ||
      desc.includes("OK") ||
      desc.includes("Complete") ||
      desc.includes("clear")
    ) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div
      className={`inline-block px-2 py-1 rounded font-semibold text-xs ${getColorClass(description)}`}
    >
      {hexMatch ? hexMatch[0] : value}
    </div>
  );
}

function StatusIndicator({ sr2 }: { sr2?: string }) {
  if (!sr2) return <span className="text-gray-500">-</span>;

  if (sr2.includes("0x00")) {
    return (
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        Login Mode
      </span>
    );
  }
  if (sr2.includes("0x04")) {
    return (
      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
        Stand by
      </span>
    );
  }
  if (sr2.includes("0x07")) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        Ready to Count
      </span>
    );
  }
  if (sr2.includes("0x41")) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        Contando
      </span>
    );
  }

  return <span className="text-gray-500 text-sm">Desconocido</span>;
}
