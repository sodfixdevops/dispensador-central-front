"use client";
import Link from "next/link";
import { DocumentIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import { ApiResponse, ServiciosData } from "@/app/lib/definitions";
import React, { useState } from "react";
import { createServicio, updateServicio } from "@/app/lib/servicios-actions";
import { useRouter } from "next/navigation";

interface ServicioFormProps {
  servicio?: ServiciosData;
  idServicio?: number;
}

const ServicioForm = ({ servicio, idServicio }: ServicioFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    idServicio: servicio?.idServicio || "",
    descripcion: servicio?.descripcion || "",
    sigla: servicio?.sigla || "",
    prioridad: servicio?.prioridad || "",
    posicion: servicio?.posicion || "",
    servicio: !!idServicio ? idServicio : 0,
    tipo: servicio?.tipo,
  });
  const isEditing = !!servicio;
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
      /*console.log(formData);
      console.log(!!idServicio ? idServicio : 0);
      return;*/
      const result = isEditing
        ? await updateServicio(servicio.idServicio!, formData) // Solo si existe 'parametro'
        : await createServicio(formData);
      if (result?.success) {
        isEditing
          ? await toast.success("Se modifico el servicio exitosamente", {
              position: "top-center",
              autoClose: 3000,
            })
          : await toast.success("Se ha registrado nuevo servicio", {
              position: "top-center",
              autoClose: 3000,
            });
        router.push("/dashboard/servicios");
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
          {/*Codigo de servicio*/}
          <div className="mb-4">
            <label
              htmlFor="idServicio"
              className="mb-2 block text-sm font-medium"
            >
              Codigo de Servicio
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="idServicio"
                  name="idServicio"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ingrese un codigo para el servicio"
                  maxLength={5}
                  readOnly={isEditing}
                  value={formData.idServicio}
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
                  maxLength={3}
                  value={formData.sigla}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Prioridad*/}
          <div className="mb-4">
            <label
              htmlFor="prioridad"
              className="mb-2 block text-sm font-medium"
            >
              Prioridad
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="prioridad"
                  name="prioridad"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ingrese numero de prioridad"
                  maxLength={5}
                  value={formData.prioridad}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Prioridad*/}
          <div className="mb-4">
            <label
              htmlFor="posicion"
              className="mb-2 block text-sm font-medium"
            >
              Posicion
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="posicion"
                  name="posicion"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ingrese posicion"
                  maxLength={5}
                  value={formData.posicion}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <PencilIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Sucursal*/}
          <div className="mb-4">
            <label htmlFor="tipo" className="mb-2 block text-sm font-medium">
              Tipo
            </label>
            <div className="relative">
              <div className="relative">
                <select
                  id="tipo"
                  name="tipo"
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  value={formData.tipo || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  <option value="1">Principal</option>
                  <option value="2">Secundario</option>
                  <option value="99">Accion</option>
                </select>
                <DocumentIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Botones de proceso*/}
          <div className="mt-6 flex justify-end gap-4">
            <Link
              href="/dashboard/servicios"
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
export default ServicioForm;
