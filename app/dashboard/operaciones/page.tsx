import { FetchAdapisTable } from "@/app/lib/adapi-actions";
import { lusitana } from "@/app/ui/fonts";

function statusLabel(status?: number) {
  if (status === 2)
    return { text: "Exitoso", color: "bg-green-100 text-green-800" };
  if (status === 3) return { text: "Error", color: "bg-red-100 text-red-800" };
  return { text: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
}

function formatDate(value?: string | Date) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export default async function Page() {
  const data = await FetchAdapisTable();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Operaciones (adapi)
        </h1>
      </div>

      {!data || data.length === 0 ? (
        <div className="mt-4 rounded-md bg-gray-100 text-gray-700 p-3">
          No hay registros de operaciones.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">URL</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Observación</th>
                <th className="px-4 py-2 text-left">Respuesta</th>
                <th className="px-4 py-2 text-left">Creado</th>
                <th className="px-4 py-2 text-left">Actualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-800">
              {data.map((item) => {
                const st = statusLabel(item.adapistat);
                return (
                  <tr key={item.adapiseri} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">
                      {item.adapiseri}
                    </td>
                    <td className="px-4 py-2 break-all">{item.adapicurl}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${st.color}`}
                      >
                        {st.text}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {item.adapiobse || ""}
                    </td>
                    <td
                      className="px-4 py-2 text-gray-700 max-w-[260px] truncate"
                      title={item.adapiresp || ""}
                    >
                      {item.adapiresp || ""}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatDate(item.adapifreg as unknown as string)}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {formatDate(item.adapifupt as unknown as string)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
