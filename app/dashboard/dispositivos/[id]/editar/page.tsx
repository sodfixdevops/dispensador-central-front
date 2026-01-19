import {
  fetchDispositivoById,
  actualizarDispositivo,
} from "@/app/lib/dispositivo-actions";
import { redirect } from "next/navigation";

interface Props {
  params: {
    id: string;
  };
}

export default async function EditarDispositivoPage({ params }: Props) {
  const id = Number(params.id);
  const dispositivo = await fetchDispositivoById(id);
  console.log("AQUI B", dispositivo);

  async function action(formData: FormData) {
    "use server";

    const data = {
      addispnomb: formData.get("addispnomb") as string,
      addipsapis: formData.get("addipsapis") as string,
      addispsrl1: formData.get("addispsrl1") as string,
      addispsrl2: formData.get("addispsrl2") as string,
      addispstat: Number(formData.get("addispstat")),
    };

    const result = await actualizarDispositivo(id, data);

    if (result.success) {
      redirect("/dashboard/dispositivos");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">
        Dispositivos / Editar Dispositivo
      </h1>

      <form action={action} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            name="addispnomb"
            defaultValue={dispositivo.addispnomb}
            required
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del Usuario asignado
          </label>
          <input
            value={dispositivo.nomUsuario ?? ""}
            disabled
            className="w-full rounded-md border px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Dirección del servicio
          </label>
          <input
            name="addipsapis"
            defaultValue={dispositivo.addipsapis ?? ""}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Línea 1</label>
          <input
            name="addispsrl1"
            defaultValue={dispositivo.addispsrl1 ?? ""}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Línea 2</label>
          <input
            name="addispsrl2"
            defaultValue={dispositivo.addispsrl2 ?? ""}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            name="addispstat"
            defaultValue={dispositivo.addispstat}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value={0}>Nuevo</option>
            <option value={1}>Asignado</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <a
            href="/dashboard/dispositivos"
            className="rounded-md px-4 py-2 text-sm bg-gray-100"
          >
            Cancelar
          </a>

          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Modificar
          </button>
        </div>
      </form>
    </div>
  );
}
