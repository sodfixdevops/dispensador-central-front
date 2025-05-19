"use client";
import Link from "next/link";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import { AgenData, ApiResponse, ServiciosData } from "@/app/lib/definitions";
import React, { useState } from "react";
import { createServicio, updateServicio } from "@/app/lib/servicios-actions";
import { useRouter } from "next/navigation";
import { createAgencia, updateAgencia } from "@/app/lib/agencia-actions";
interface SucursalFormProps {
  sucursal?: AgenData;
  idAgencia?: number;
}

const SucursalForm = ({ sucursal, idAgencia }: SucursalFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    idAgencia: sucursal?.idAgencia || "",
    descripcion: sucursal?.descripcion || "",
    sigla: sucursal?.sigla || "",
  });
  const isEditing = !!sucursal;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = isEditing
        ? await updateAgencia(idAgencia!, formData) // Solo si existe 'parametro'
        : await createAgencia(formData);
      if (result?.success) {
        isEditing
          ? await toast.success("Se modifico el la sucursal", {
              position: "top-center",
              autoClose: 3000,
            })
          : await toast.success("Se ha registrado una sucursal", {
              position: "top-center",
              autoClose: 3000,
            });
        router.push("/dashboard/sucursales");
      } else {
        if (Array.isArray(result?.message)) {
          result?.message.map((msj: string) => {
            toast.error(`${msj}`, {
              position: "top-center",
              autoClose: 3000,
            });
          });
        }
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          {/*Id Agencia*/}
          <div className="mb-4">
            <label
              htmlFor="idAgencia"
              className="mb-2 block text-sm font-medium"
            >
              Codigo
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="idAgencia"
                  name="idAgencia"
                  type="number"
                  inputMode="numeric"
                  placeholder="Ingrese Codigo"
                  maxLength={5}
                  value={formData.idAgencia}
                  onChange={handleChange}
                  disabled={!!sucursal}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                  required={true}
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Descripcion Agencia*/}
          <div className="mb-4">
            <label
              htmlFor="descripcion"
              className="mb-2 block text-sm font-medium"
            >
              Descripcion
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  placeholder="Ingrese descripcion"
                  maxLength={70}
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>

          {/*Sigla*/}
          <div className="mb-4">
            <label htmlFor="sigla" className="mb-2 block text-sm font-medium">
              Sigla
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="sigla"
                  name="sigla"
                  type="text"
                  placeholder="Ingrese una sigla"
                  maxLength={15}
                  value={formData.sigla}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>

          {/*Botones de proceso*/}
          <div className="mt-6 flex justify-end gap-4">
            <Link
              href="/dashboard/parametros"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              Cancelar
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Procesando..."
                : isEditing
                ? "Modificar"
                : "Crear"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
export default SucursalForm;
