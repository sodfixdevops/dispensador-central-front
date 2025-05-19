"use client";
import Link from "next/link";
import {
  DocumentIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/app/ui/button";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import { UsuariosData } from "@/app/lib/definitions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUsuario, updateUsuario } from "@/app/lib/usuario-actions";

interface UsuariosFormProps {
  usuario?: UsuariosData;
  codigoUsuario?: string;
}

const UsuarioForm = ({ usuario, codigoUsuario }: UsuariosFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({
    codigoUsuario: "",
    nickUsuario: usuario?.nickUsuario || "",
    password: usuario?.password || "",
    marcaBaja: 0,
    estado: usuario?.estado || "",
    tipo: usuario?.tipo || "",
  });
  const isEditing = !!usuario;
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
        ? await updateUsuario(codigoUsuario!, formData) // Solo si existe 'parametro'
        : await createUsuario(formData);
      if (result?.success) {
        isEditing
          ? await toast.success("Se modifico el usuario exitosamente", {
              position: "top-center",
              autoClose: 3000,
            })
          : await toast.success("Se ha registrado nuevo usuario", {
              position: "top-center",
              autoClose: 3000,
            });
        router.push("/dashboard/usuarios");
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
          {/*Nick de Usuario*/}
          <div className="mb-4">
            <label
              htmlFor="nickUsuario"
              className="mb-2 block text-sm font-medium"
            >
              Nick de Usuario
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="nickUsuario"
                  name="nickUsuario"
                  type="text"
                  placeholder="Ingrese nick de usuario"
                  value={formData.nickUsuario}
                  onChange={handleChange}
                  maxLength={70}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                  required={true}
                />
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Contraseña*/}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  inputMode="text"
                  placeholder="Ingrese contraseña"
                  maxLength={80}
                  required={true}
                  onChange={handleChange}
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-400"
                />
                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Estado*/}
          <div className="mb-4">
            <label htmlFor="plaza" className="mb-2 block text-sm font-medium">
              Estado
            </label>
            <div className="relative">
              <div className="relative">
                <select
                  id="estado"
                  name="estado"
                  className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    .:Seleccione:.
                  </option>
                  <option value="0">Activo</option>
                  <option value="9">Inactivo</option>
                </select>
                <DocumentIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Tipo*/}
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
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    .:Seleccione:.
                  </option>
                  <option value="1">Admin</option>
                  <option value="2">Cajero</option>
                </select>
                <DocumentIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          </div>
          {/*Botones de proceso*/}
          <div className="mt-6 flex justify-end gap-4">
            <Link
              href="/dashboard/usuarios"
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
export default UsuarioForm;
