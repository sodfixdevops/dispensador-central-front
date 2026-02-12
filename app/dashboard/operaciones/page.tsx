import { FetchAdapisTable } from "@/app/lib/adapi-actions";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";

function getParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function statusLabel(status?: number) {
  if (status === 2) {
    return { text: "Exitoso", color: "bg-green-100 text-green-800" };
  }
  if (status === 3) {
    return { text: "Error", color: "bg-red-100 text-red-800" };
  }
  return { text: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
}

function formatDate(value?: string | Date) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  };
}) {
  const data = await FetchAdapisTable();
  const safeData = data ?? [];
  const rowsPerPage = 10;

  const startDate = getParam(searchParams?.startDate);
  const endDate = getParam(searchParams?.endDate);

  const startDateTime = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const endDateTime = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
  const hasInvalidRange = Boolean(
    startDateTime && endDateTime && startDateTime > endDateTime,
  );

  const filteredData = hasInvalidRange
    ? []
    : safeData.filter((item) => {
        if (!startDateTime && !endDateTime) return true;

        const createdAt = new Date(item.adapifreg as unknown as string);
        if (Number.isNaN(createdAt.getTime())) return false;

        if (startDateTime && createdAt < startDateTime) return false;
        if (endDateTime && createdAt > endDateTime) return false;
        return true;
      });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const requestedPage = Number(getParam(searchParams?.page)) || 1;
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageData = filteredData.slice(startIndex, endIndex);

  const createPageURL = (page: number) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Operaciones (adapi)
        </h1>
      </div>

      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-3">
        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-600" htmlFor="startDate">
            Fecha inicio
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={startDate}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm text-gray-600" htmlFor="endDate">
            Fecha fin
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={endDate}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Filtrar
        </button>

        <Link
          href="/dashboard/operaciones"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Limpiar
        </Link>
      </form>

      {hasInvalidRange && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
          La fecha inicio no puede ser mayor que la fecha fin.
        </div>
      )}

      {filteredData.length === 0 ? (
        <div className="mt-4 rounded-md bg-gray-100 p-3 text-gray-700">
          {hasInvalidRange
            ? "Corrige el rango de fechas para ver resultados."
            : safeData.length === 0
              ? "No hay registros de operaciones."
              : "No hay registros para el rango de fechas seleccionado."}
        </div>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">URL</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Observacion</th>
                  <th className="px-4 py-2 text-left">Respuesta</th>
                  <th className="px-4 py-2 text-left">Creado</th>
                  <th className="px-4 py-2 text-left">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {pageData.map((item) => {
                  const st = statusLabel(item.adapistat);
                  return (
                    <tr key={item.adapiseri} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-gray-600">
                        {item.adapiseri}
                      </td>
                      <td className="break-all px-4 py-2">{item.adapicurl}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${st.color}`}
                        >
                          {st.text}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {item.adapiobse || ""}
                      </td>
                      <td
                        className="max-w-[260px] truncate px-4 py-2 text-gray-700"
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

          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, filteredData.length)} de {filteredData.length}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={createPageURL(currentPage - 1)}
                className={`rounded-md border px-3 py-1 ${
                  currentPage <= 1
                    ? "pointer-events-none border-gray-200 text-gray-400"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Anterior
              </Link>
              <span>
                Pagina {currentPage} de {totalPages}
              </span>
              <Link
                href={createPageURL(currentPage + 1)}
                className={`rounded-md border px-3 py-1 ${
                  currentPage >= totalPages
                    ? "pointer-events-none border-gray-200 text-gray-400"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Siguiente
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
