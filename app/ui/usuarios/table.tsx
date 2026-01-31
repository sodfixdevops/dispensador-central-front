"use client";
import Image from "next/image";
import { UpdateUsuario, DeleteUsuario } from "@/app/ui/usuarios/buttons";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { useState, useEffect } from "react";
import { AduserData, UsuariosData } from "@/app/lib/definitions";
import { FetchUsuariosTable } from "@/app/lib/aduser-actions";
import BankAccountModal from "@/app/ui/usuarios/bank-account-modal";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function UsuariosTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const [usuarios, setUsuarios] = useState<AduserData[]>([]);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    async function cargarUsuarios() {
      const data = await FetchUsuariosTable(query, currentPage);
      setUsuarios(data);
    }
    cargarUsuarios();
  }, [query, currentPage]);

  const handleBankAccountClick = (username: string) => {
    setSelectedUser(username);
    setBankModalOpen(true);
  };

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
                <th scope="col" className="relative py-3 pl-6 pr-3 w-[90px]">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {usuarios.map((user) => (
                <tr
                  key={user.adusrusrn}
                  className="w-full border-b text-sm last-of-type:border-none
              [&:first-child>td:first-child]:rounded-tl-lg
              [&:first-child>td:last-child]:rounded-tr-lg
              [&:last-child>td:first-child]:rounded-bl-lg
              [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {user.adusrnick}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(String(user.adusrfreg))}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {user.adusrtipo}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {user.adusrstat === 1 ? "Activo" : "Inactivo"}
                  </td>

                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleBankAccountClick(user.adusrusrn)}
                        className="rounded-md bg-green-100 p-2 hover:bg-green-200 transition"
                        title="Cuenta Bancaria"
                      >
                        <PencilIcon className="w-4 h-4 text-green-600" />
                      </button>
                      <UpdateUsuario id={user.adusrusrn} />
                      <DeleteUsuario id={user.adusrusrn} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BankAccountModal
        isOpen={bankModalOpen}
        onClose={() => setBankModalOpen(false)}
        username={selectedUser}
      />
    </div>
  );
}
