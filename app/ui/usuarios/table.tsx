"use client";
import Image from "next/image";
import { UpdateUsuario, DeleteUsuario } from "@/app/ui/usuarios/buttons";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { FetchParametrosTable, FetchUsuariosTable } from "@/app/lib/actions";
import { useState, useEffect } from "react";
import { UsuariosData } from "@/app/lib/definitions";
export default function UsuariosTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [usuarios, setUsuarios] = useState<UsuariosData[]>([]);
  useEffect(() => {
    // Fetch de cajeros
    async function cargarUsuarios() {
      const data = await FetchUsuariosTable(query, currentPage);
      setUsuarios(data);
    }
    cargarUsuarios();
  }, []);
  //const usuarios = await FetchUsuariosTable(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Usuario
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Registro
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Estado
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Modificar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {usuarios?.map((user) => (
                <tr
                  key={user.codigoUsuario}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="truncate max-w-36" title={user.nickUsuario}>
                        {user.nickUsuario}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {user.fechaRegistro}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{user.tipo}</td>
                  <td className="whitespace-nowrap px-3 py-3">{user.estado}</td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateUsuario id={user.codigoUsuario!} />
                      <DeleteUsuario id={user.codigoUsuario!} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
