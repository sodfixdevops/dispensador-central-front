"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCuentaUsuario,
  updateCuentaUsuario,
} from "@/app/lib/aduser-actions";
import type { AduserDataCrud } from "@/app/lib/definitions";
import { fetchDispositivos } from "@/app/lib/dispositivo-actions";

type Dispositivo = { addispcode: number; addispnomb: string };

type Props = {
  mode: "create" | "edit";
  id?: string; // requerido en edit
  initialData?: Partial<AduserDataCrud>;
};

export default function UsuarioForm({ mode, id, initialData }: Props) {
  const router = useRouter();

  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    adusrnick: initialData?.adusrnick ?? "",
    adusrclav: "", // solo para create o si decides cambiar clave
    adusrtipo: String(initialData?.adusrtipo ?? ""),
    adusrstat: Number(initialData?.adusrstat ?? 1),
    addispcode: initialData?.addispcode ? String(initialData.addispcode) : "",
  });

  useEffect(() => {
    fetchDispositivos().then(setDispositivos);
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload: AduserDataCrud = {
        adusrusrn: initialData?.adusrusrn ?? "",
        adusrnick: form.adusrnick,
        adusrclav: form.adusrclav || undefined,
        adusrtipo: Number(form.adusrtipo),
        adusrstat: Number(form.adusrstat),
        adusrmrcb: 0,
        adusrusra: "system",
        addispcode: form.addispcode ? Number(form.addispcode) : undefined,
        adusrfreg: initialData?.adusrfreg ?? new Date(),
      };

      if (mode === "create") {
        await createCuentaUsuario(payload);
      } else {
        if (!id) throw new Error("Falta id para editar");
        await updateCuentaUsuario(id, payload);
      }

      router.push("/dashboard/usuarios");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "No se pudo completar la operación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-lg bg-white p-6 shadow-sm space-y-6"
    >
      {errorMsg && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de Usuario
        </label>
        <input
          name="adusrnick"
          value={form.adusrnick}
          onChange={onChange}
          required
          disabled={mode === "edit"} // si no quieres cambiar nick en edit
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          name="adusrclav"
          value={form.adusrclav}
          onChange={onChange}
          required={mode === "create"}
          placeholder={mode === "edit" ? "(Opcional) Nueva contraseña" : ""}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          name="adusrtipo"
          value={form.adusrtipo}
          onChange={onChange}
          required
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">::: Seleccione :::</option>
          <option value="1">Administrador</option>
          <option value="2">Usuario</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dispositivo asignado
        </label>
        <select
          name="addispcode"
          value={form.addispcode}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">::: Sin asignar :::</option>
          {dispositivos.map((d) => (
            <option key={d.addispcode} value={d.addispcode}>
              {d.addispnomb}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          name="adusrstat"
          value={form.adusrstat}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Activo</option>
          <option value={0}>Inactivo</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white
          hover:bg-blue-700 disabled:opacity-50"
        >
          {mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
