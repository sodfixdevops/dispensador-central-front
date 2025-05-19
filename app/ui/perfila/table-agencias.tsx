"use client";
import Image from "next/image";
import {
  UpdateServicio,
  DeleteServicio,
  ListaServicios,
} from "@/app/ui/servicios/buttons";
import {
  formatDateToLocal,
  formatCurrency,
  showMessage,
} from "@/app/lib/utils";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import { FetchConceptosByPrefijo } from "@/app/lib/conceptos-actions";
import { AgenciasPerfil, ServiciosPerfil } from "./button";
import { useEffect, useState } from "react";
import {
  AgenData,
  dperfMasivoDto,
  pfageMasivoDto,
  ServiciosData,
} from "@/app/lib/definitions";
import { useRouter } from "next/router";
import {
  FetchServiciosPerfil,
  guardarServiciosPerfil,
} from "@/app/lib/servicios-actions";
import {
  FetchAgenciasPerfil,
  guardarAgenciasPerfil,
} from "@/app/lib/agencia-actions";

interface AgenciasPerfilProps {
  agencias: AgenData[];
  perfil?: number;
  tipo?: number;
}

const PerfilAgenciasTable = ({
  agencias,
  perfil,
  tipo,
}: AgenciasPerfilProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para los checkboxes seleccionados
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Recuperar los servicios seleccionados cuando el componente se monta
  useEffect(() => {
    const fetchSelectedServicios = async () => {
      if (perfil) {
        try {
          // Aquí llamamos a la función que obtiene los servicios seleccionados para este perfil
          const selected = await FetchAgenciasPerfil(perfil);

          // Actualizamos el estado con los servicios seleccionados
          setSelectedIds(selected.map((agencia) => agencia.agencia!));
        } catch (error) {
          console.error("Error al obtener las agencias seleccionadas:", error);
        }
      }
    };

    fetchSelectedServicios();
  }, [perfil]); // Solo se ejecuta cuando el perfil cambia

  // Función para manejar el cambio de estado de los checkboxes
  const handleCheckboxChange = (id: number) => {
    setSelectedIds(
      (prevSelected) =>
        prevSelected.includes(id)
          ? prevSelected.filter((item) => item !== id) // Deseleccionar
          : [...prevSelected, id] // Seleccionar
    );
  };

  // Función para manejar el envío de los datos seleccionados
  const handleSave = async () => {
    const payload = selectedIds.map((id) => ({
      perfil: perfil,
      agencia: id,
      tipo: tipo,
    }));

    const pfageMasivo: pfageMasivoDto = {
      registros: payload,
      perfil: perfil,
      tipo: tipo,
    };
    console.log(pfageMasivo);
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await guardarAgenciasPerfil(pfageMasivo);
      if (result?.success) {
        showMessage("success", "Se guardaron los cambios");
        //router.push("/dashboard/perfila");
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
      showMessage("error", "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Codigo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Agencia
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Marca</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {agencias?.map((agen) => (
                <tr
                  key={agen.idAgencia}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="truncate max-w-36" title={agen.descripcion}>
                        {agen.idAgencia}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {agen.descripcion}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(agen.idAgencia!)}
                      onChange={() => handleCheckboxChange(agen.idAgencia!)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Botón de guardar */}
          <div className="mt-4 text-right">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleSave}
            >
              Guardar Seleccionados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAgenciasTable;
