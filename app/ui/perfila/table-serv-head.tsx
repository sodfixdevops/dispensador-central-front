"use client";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
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
  guardarServiciosPerfil,
} from "@/app/lib/servicios-actions";

interface TableServiciosHeadProps {
  servicios: ServiciosData[];
  perfil?: number;
  onRowClick: (idServicio: number) => void;
}

const TableServiciosHead = ({
  servicios,
  perfil,
  onRowClick,
}: TableServiciosHeadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
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
          const selected = await FetchServiciosPerfil(perfil);

          // Actualizamos el estado con los servicios seleccionados
          setSelectedIds(selected.map((servicio) => servicio.servicio!));
        } catch (error) {
          console.error("Error al obtener los servicios seleccionados:", error);
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

  const handleRowClick = (idServicio: number) => {
    setSelectedRow(idServicio); // Cambiar la fila seleccionada
    onRowClick(idServicio); // Pasar el idServicio al componente padre (table-subserv)
  };

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
              </tr>
            </thead>
            <tbody className="bg-white">
              {servicios?.map((serv) => (
                <tr
                  key={serv.idServicio}
                  className={`w-full border-b py-3 text-sm last-of-type:border-none 
                    ${selectedRow === serv.idServicio ? "bg-blue-100" : ""} 
                    hover:bg-blue-50`}
                  onClick={() => handleRowClick(serv.idServicio!)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableServiciosHead;
