"use client";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import { FetchConceptosByPrefijo } from "@/app/lib/conceptos-actions";
import { AgenciasPerfil, ServiciosPerfil } from "./button";
import { useEffect, useState } from "react";
import {
  dperfMasivoDto,
  pfageMasivoDto,
  ServiciosData,
} from "@/app/lib/definitions";
import { useRouter } from "next/navigation";
import {
  FetchServiciosPerfil,
  FetchSubserviciosPerfil,
  guardarServiciosPerfil,
} from "@/app/lib/servicios-actions";

interface ServiciosPerfilProps {
  servicios: ServiciosData[];
  perfil?: number;
  servicio?: number;
  tipo?: number;
}

const PerfilServiciosTable = ({
  servicios,
  perfil,
  servicio,
  tipo,
}: ServiciosPerfilProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // Asegúrate de que este componente se renderice solo en el cliente
    setIsMounted(true);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para los checkboxes seleccionados
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Recuperar los servicios seleccionados cuando el componente se monta
  useEffect(() => {
    const fetchSelectedServicios = async () => {
      if (perfil) {
        try {
          // Aquí llamamos a la función que obtiene los servicios seleccionados para este perfil
          const selected = await FetchSubserviciosPerfil(
            perfil,
            servicio!,
            tipo!
          );
          // Actualizamos el estado con los servicios seleccionados
          setSelectedIds(selected.map((servicio) => servicio.subserv!));
        } catch (error) {
          console.error("Error al obtener los servicios seleccionados:", error);
        }
      }
    };

    fetchSelectedServicios();
  }, [perfil, servicio]); // Solo se ejecuta cuando el perfil cambia

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
    const validSelectedIds = selectedIds.filter((id) =>
      servicios.some((serv) => serv.idServicio === id)
    );

    const payload = validSelectedIds.map((id) => ({
      subserv: id,
      perfil: perfil,
      tipo: tipo,
      servicio: servicio,
    }));
    const pfageMasivo: dperfMasivoDto = {
      registros: payload,
      perfil: perfil,
      tipo: tipo,
      servicio: servicio,
    };
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await guardarServiciosPerfil(pfageMasivo);
      if (result?.success) {
        await toast.success("Se guardaron los cambios", {
          position: "top-center",
          autoClose: 3000,
        });
        router.push("/dashboard/perfila");
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

  if (!isMounted) {
    return null; // O podrías renderizar un loading spinner mientras se monta
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Codigo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Descripcion
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Servicio
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Marca</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {servicios?.map((serv) => (
                <tr
                  key={serv.idServicio}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="truncate max-w-36" title={serv.descripcion}>
                        {serv.idServicio}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {serv.descripcion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {serv.servicio}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(serv.idServicio!)}
                      onChange={() => handleCheckboxChange(serv.idServicio!)}
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

export default PerfilServiciosTable;
