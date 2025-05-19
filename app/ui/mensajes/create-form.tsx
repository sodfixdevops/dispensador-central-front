"use client";
import Link from "next/link";
import { DocumentIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import {
  ApiResponse,
  ConceptosData,
  ServiciosData,
  TrconData,
} from "@/app/lib/definitions";
import React, { useState } from "react";
import { createServicio, updateServicio } from "@/app/lib/servicios-actions";
import { useRouter } from "next/navigation";
import { createConcepto, updateConcepto } from "@/app/lib/conceptos-actions";

interface MensajeFormProps {
  mensaje?: TrconData;
}

const MensajeForm = ({ mensaje }: MensajeFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    prefijo: 2,
    correlativo: mensaje?.correlativo || "",
    descripcion: mensaje?.descripcion || "",
    abreviacion: mensaje?.abreviacion || "",
    marca: 0,
  });
  const isEditing = !!mensaje;
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
        ? await updateConcepto(2, mensaje.correlativo!, formData) // Solo si existe 'parametro'
        : await createConcepto(formData);
      if (result?.success) {
        isEditing
          ? await toast.success("Se modifico el mensaje", {
              position: "top-center",
              autoClose: 3000,
            })
          : await toast.success("Se ha registrado nuevo mensaje", {
              position: "top-center",
              autoClose: 3000,
            });
        router.push("/dashboard/mensajes");
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
          {/*Codigo*/}
          <div className="mb-4">
            <label
              htmlFor="correlativo"
              className="mb-2 block text-sm font-medium"
            >
              Codigo
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="correlativo"
                  name="correlativo"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ingrese codigo"
                  maxLength={5}
                  value={formData.correlativo}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Descripcion Servicio*/}
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
                  placeholder="Ingrese Nombre Empresa"
                  maxLength={200}
                  value={formData.descripcion || ""}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Descripcion Servicio*/}
          <div className="mb-4">
            <label
              htmlFor="abreviacion"
              className="mb-2 block text-sm font-medium"
            >
              Posicion
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="abreviacion"
                  name="abreviacion"
                  type="number"
                  placeholder="Ingrese Nombre Empresa"
                  maxLength={5}
                  value={formData.abreviacion}
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
export default MensajeForm;
