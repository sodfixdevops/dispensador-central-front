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

  // leer filtros desde query y aplicar defaults/validaciones
  const qStartDate = formatInputValue(searchParams?.startDate);
  const qEndDate = formatInputValue(searchParams?.endDate);
  const qStartTime = formatInputValue(searchParams?.startTime);
  const qEndTime = formatInputValue(searchParams?.endTime);

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const toInputDate = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const DEFAULT_START_TIME = "08:00";
  const DEFAULT_END_TIME = "17:00";

  let startDate = qStartDate || toInputDate(today);
  let endDate = qEndDate || toInputDate(today);
  let startTime = qStartTime || DEFAULT_START_TIME;
  let endTime = qEndTime || DEFAULT_END_TIME;

  // Clamp times to business hours 08:00-17:00
  const clampTime = (t: string) => {
    if (!t) return DEFAULT_START_TIME;
    const [hh, mm] = t.split(":").map((x) => parseInt(x, 10) || 0);
    const total = hh * 60 + mm;
    const minTotal = 8 * 60;
    const maxTotal = 17 * 60;
    const clamped = Math.min(Math.max(total, minTotal), maxTotal);
    const ch = Math.floor(clamped / 60);
    const cm = clamped % 60;
    return `${pad(ch)}:${pad(cm)}`;
  };

  startTime = clampTime(startTime);
  endTime = clampTime(endTime);

  // Ensure start <= end. If not, set end = start
  const fromIsoCheck = startDate
    ? new Date(`${startDate}T${startTime}:00`)
    : null;
  const toIsoCheck = endDate ? new Date(`${endDate}T${endTime}:00`) : null;
  if (fromIsoCheck && toIsoCheck && fromIsoCheck > toIsoCheck) {
    // make end equal to start
    endDate = startDate;
    endTime = startTime;
  }

  let logs: any[] = [];

  if (dispositivo) {
    // construir ISO datetimes usando valores ya validados
    const fromIso = `${startDate}T${startTime}:00`;
    const toIso = `${endDate}T${endTime}:59`;

    if (dispositivo.addipsapis) {
      logs = await DE70_FetchLogsByRange(
        dispositivo.addipsapis,
        fromIso,
        toIso,
        dispositivo.addispcode,
      );
    }
  }

  // helper para formatear fechas a dd/mm/yyyy hh:mm
  const tryParseDate = (val: any): Date | null => {
    if (!val) return null;
    // If already a Date
    if (val instanceof Date) return val;
    // If numeric timestamp
    if (typeof val === "number") return new Date(val);
    if (typeof val !== "string") return null;

    // Try ISO
    const isoCandidate = val.trim();
    const iso = new Date(isoCandidate);
    if (!isNaN(iso.getTime())) return iso;

    // Try common formats dd/mm/yyyy hh:mm or dd-mm-yyyy
    const dmy = isoCandidate.match(
      /(\d{2})[\/-](\d{2})[\/-](\d{4})(?:[ T](\d{2}):(\d{2}))?/,
    );
    if (dmy) {
      const day = parseInt(dmy[1], 10);
      const month = parseInt(dmy[2], 10) - 1;
      const year = parseInt(dmy[3], 10);
      const hh = dmy[4] ? parseInt(dmy[4], 10) : 0;
      const mm = dmy[5] ? parseInt(dmy[5], 10) : 0;
      return new Date(year, month, day, hh, mm);
    }

    return null;
  };

  const formatDisplayDate = (val: any) => {
    const d = tryParseDate(val);
    if (!d) return String(val ?? "-");
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

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
                    const rawDate =
                      l.dplogfreg ||
                      l.dplogfreg1 ||
                      l.fecha ||
                      l.timestamp ||
                      l.createdAt ||
                      "-";
                    const dateVal = formatDisplayDate(rawDate);
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
