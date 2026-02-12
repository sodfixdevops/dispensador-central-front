import { fetchDispositivoById } from "@/app/lib/dispositivo-actions";
import { DE70_FetchLogsByRange } from "@/app/lib/de70-actions";

type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

function formatInputValue(val?: string | string[] | undefined) {
  if (!val) return "";
  return Array.isArray(val) ? val[0] : val;
}

export default async function EventsPage({ params, searchParams }: Props) {
  const id = params.id;

  // obtener dispositivo para conocer su API URL
  let dispositivo: any = null;
  try {
    dispositivo = await fetchDispositivoById(Number(id));
  } catch (e) {
    dispositivo = null;
  }

  // leer filtros desde query
  const startDate = formatInputValue(searchParams?.startDate);
  const endDate = formatInputValue(searchParams?.endDate);
  const startTime = formatInputValue(searchParams?.startTime);
  const endTime = formatInputValue(searchParams?.endTime);

  let logs: any[] = [];

  if (dispositivo && (startDate || endDate)) {
    // construir ISO datetimes
    const fromDate = startDate || "";
    const toDate = endDate || "";

    const fromIso = fromDate
      ? `${fromDate}T${startTime ? startTime : "00:00"}:00`
      : "";
    const toIso = toDate ? `${toDate}T${endTime ? endTime : "23:59"}:59` : "";

    if (fromIso && toIso && dispositivo.addipsapis) {
      logs = await DE70_FetchLogsByRange(
        dispositivo.addipsapis,
        fromIso,
        toIso,
        dispositivo.addispcode,
      );
    }
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Eventos - {dispositivo?.addispnomb || `ID ${id}`}
        </h1>
      </div>

      <div className="mt-6">
        <form
          method="get"
          className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha inicio
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha fin
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora inicio
            </label>
            <input
              type="time"
              name="startTime"
              defaultValue={startTime}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora fin
            </label>
            <input
              type="time"
              name="endTime"
              defaultValue={endTime}
              className="mt-1 block w-full rounded border px-2 py-1"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6">
        {dispositivo ? (
          logs.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-left">Evento</th>
                    <th className="px-4 py-2 text-left">Detalle</th>
                    <th className="px-4 py-2 text-left">Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l: any, idx: number) => {
                    const dateVal =
                      l.dplogfreg ||
                      l.dplogfreg1 ||
                      l.fecha ||
                      l.timestamp ||
                      l.createdAt ||
                      "-";
                    const eventVal =
                      l.dplogevnt ||
                      l.event ||
                      l.tipo ||
                      l.code ||
                      l.dplogcode ||
                      "-";
                    const detailVal =
                      l.dplogdesc || l.dplogdet || l.message || l.detalle;
                    const originVal =
                      l.device ||
                      l.dispositivo ||
                      l.dplogorig ||
                      l.dplogcode ||
                      "-";

                    // prepare detail display: if it's an object, stringify compactly
                    let detailDisplay = "-";
                    if (detailVal === undefined || detailVal === null) {
                      detailDisplay = "-";
                    } else if (typeof detailVal === "object") {
                      detailDisplay = JSON.stringify(detailVal);
                    } else if (typeof detailVal === "string") {
                      detailDisplay = detailVal;
                    } else {
                      detailDisplay = String(detailVal);
                    }

                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{dateVal}</td>
                        <td className="px-4 py-2 text-sm">{eventVal}</td>
                        <td className="px-4 py-2 text-sm">{detailDisplay}</td>
                        <td className="px-4 py-2 text-sm">{originVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">
              No se encontraron eventos para el rango seleccionado.
            </p>
          )
        ) : (
          <p className="text-red-500">
            No se pudo cargar la información del dispositivo.
          </p>
        )}
      </div>
    </main>
  );
}
