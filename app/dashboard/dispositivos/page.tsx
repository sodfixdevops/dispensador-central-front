import Link from "next/link";
import { fetchDispositivos } from "@/app/lib/dispositivo-actions";

export default async function DispositivosPage() {
  const dispositivos = await fetchDispositivos();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dispositivos</h1>

        <Link
          href="/dashboard/dispositivos/create"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo Dispositivo +
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Registro</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {dispositivos.map((d) => (
              <tr key={d.addispcode} className="border-b last:border-0">
                <td className="px-4 py-3">{d.addispcode}</td>
                <td className="px-4 py-3">{d.addispnomb}</td>
                <td className="px-4 py-3">{d.nomUsuario ?? "-"}</td>
                <td className="px-4 py-3">
                  {d.addispstat === 1 ? "Asignado" : "Nuevo"}
                </td>
                <td className="px-4 py-3">
                  {new Date(d.addispfreg!).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/dispositivos/${d.addispcode}/editar`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}

            {dispositivos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No hay dispositivos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
