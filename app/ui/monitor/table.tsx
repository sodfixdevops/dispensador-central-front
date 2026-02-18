"use client";

import { useState, useEffect } from "react";
import { DispositivoData } from "@/app/lib/definitions";
import { DE70_ActionSense } from "@/app/lib/de70-actions";
import Link from "next/link";

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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
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
              SR1
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              SR2
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              S1
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              S2
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Estado
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Acciones
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
                      colSpan={6}
                      className="px-4 py-3 text-center text-gray-500"
                    >
                      <span className="inline-block animate-spin">⏳</span>
                      Cargando...
                    </td>
                  </>
                ) : status?.error ? (
                  <>
                    <td
                      colSpan={6}
                      className="px-4 py-3 text-center text-red-500 text-sm"
                    >
                      ❌ {status.error}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <ValueBadge
                        value={status?.data?.interpretacion?.SR1}
                        translated={
                          status?.data?.interpretacion?.Translate?.SR1
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ValueBadge
                        value={status?.data?.interpretacion?.SR2}
                        translated={
                          status?.data?.interpretacion?.Translate?.SR2
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ValueBadge
                        value={status?.data?.interpretacion?.S1}
                        translated={status?.data?.interpretacion?.Translate?.S1}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ValueBadge
                        value={status?.data?.interpretacion?.S2}
                        translated={status?.data?.interpretacion?.Translate?.S2}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusIndicator
                        sr2={status?.data?.interpretacion?.SR2}
                        translated={
                          status?.data?.interpretacion?.Translate?.SR2
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/monitor/${dispositivo.addispcode}/events`}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                      >
                        Ver eventos
                      </Link>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ValueBadge({
  value,
  translated,
}: {
  value?: string;
  translated?: string;
}) {
  if (!value && !translated) return <span className="text-gray-400">-</span>;

  const display = translated || value || "";
  const hexMatch = (value || display).match(/0x[0-9a-fA-F]+/);
  const description = display.replace(/\s*0x[0-9a-fA-F]+\s*/g, "").trim();

  const descLower = description.toLowerCase();

  const getColorClass = (desc: string) => {
    if (
      desc.includes("error") ||
      desc.includes("vacío") ||
      desc.includes("empty") ||
      desc.includes("not full")
    ) {
      return "bg-red-100 text-red-800";
    }
    if (
      desc.includes("login") ||
      desc.includes("modo de login") ||
      desc.includes("en espera") ||
      desc.includes("stand by") ||
      desc.includes("cerrado") ||
      desc.includes("cerrada")
    ) {
      return "bg-yellow-100 text-yellow-800";
    }
    if (
      desc.includes("ready") ||
      desc.includes("listo") ||
      desc.includes("ok") ||
      desc.includes("completado") ||
      desc.includes("contando") ||
      desc.includes("complete")
    ) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="flex flex-col items-start">
      <div
        className={`inline-block px-2 py-1 rounded font-semibold text-xs ${getColorClass(descLower)}`}
        title={description}
      >
        {hexMatch ? hexMatch[0] : display}
      </div>

      {description ? (
        <div
          className="mt-1 text-xs text-gray-600 truncate max-w-[12rem]"
          title={description}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}

function StatusIndicator({
  sr2,
  translated,
}: {
  sr2?: string;
  translated?: string;
}) {
  const source = translated || sr2 || "";
  if (!source) return <span className="text-gray-500">-</span>;

  const hasHex = (s: string, hex: string) =>
    s.includes(hex) || (sr2 && sr2.includes(hex));

  // Prefer hex checks to decide the state (robust), fall back to translated text
  if (hasHex(source, "0x00")) {
    return (
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        Modo de login
      </span>
    );
  }

  if (hasHex(source, "0x04")) {
    return (
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        En espera
      </span>
    );
  }

  if (hasHex(source, "0x07")) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        Listo para conteo
      </span>
    );
  }

  if (hasHex(source, "0x41")) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        Contando
      </span>
    );
  }

  // If no known hex, try to detect keywords in translated text
  const lower = source.toLowerCase();
  if (lower.includes("login") || lower.includes("modo de login")) {
    return (
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        Modo de login
      </span>
    );
  }
  if (lower.includes("espera") || lower.includes("stand by")) {
    return (
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
        En espera
      </span>
    );
  }
  if (
    lower.includes("listo") ||
    lower.includes("ready") ||
    lower.includes("completado")
  ) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        Listo para conteo
      </span>
    );
  }
  if (lower.includes("contando")) {
    return (
      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        Contando
      </span>
    );
  }

  return (
    <span className="text-gray-500 text-sm" title={source}>
      {source}
    </span>
  );
}
