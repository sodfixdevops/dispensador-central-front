"use client";

import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import { bajaUsuario } from "@/app/lib/usuario-actions";
import { AduserData } from "@/app/lib/definitions";

export function RegisterUsuario() {
  return (
    <Link
      href="/dashboard/usuarios/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Registro Usuario</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateUsuario({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/usuarios/${id}/editar`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteUsuario({ user }: { user: AduserData }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      console.log("=== BAJA DE USUARIO ===");
      console.log("Usuario ID:", user.adusrusrn);
      console.log("Usuario Nick:", user.adusrnick);

      const result = await bajaUsuario(user.adusrusrn);

      console.log("Resultado:", result);

      if (result.success) {
        alert("Usuario dado de baja correctamente");
        setShowModal(false);
        window.location.reload();
      } else {
        console.error("Error en resultado:", result);
        alert(
          "Error al dar de baja el usuario: " +
            (result.message || "Sin mensaje"),
        );
      }
    } catch (error) {
      console.error("Error capturado:", error);
      alert("Error al dar de baja el usuario: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="rounded-md border p-2 hover:bg-gray-100"
      >
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md overflow-hidden">
            <h3 className="text-lg font-semibold mb-4 break-words">
              Confirmar Baja de Usuario
            </h3>
            <p className="text-gray-600 mb-6 break-words whitespace-normal">
              ¿Está seguro que desea dar de baja al usuario{" "}
              <strong className="break-words">{user.adusrnick}</strong>? Esta
              acción marcará el usuario como inactivo.
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Procesando..." : "Dar de Baja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
