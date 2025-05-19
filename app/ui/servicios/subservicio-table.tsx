import Image from "next/image";
import {
  UpdateServicio,
  DeleteServicio,
  ListaServicios,
  UpdateSubservicio,
} from "@/app/ui/servicios/buttons";
import { formatDateToLocal, formatCurrency } from "@/app/lib/utils";
import { FetchSubServiciosTable } from "@/app/lib/servicios-actions";

export default async function SubservicioTable({ id }: { id: number }) {
  const servicios = await FetchSubServiciosTable(id);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Id
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Descripcion
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Sigla
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Modificar</span>
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
                  <td className="whitespace-nowrap px-3 py-3">{serv.sigla}</td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateSubservicio id={id} subid={serv.idServicio!} />
                      <DeleteServicio id={serv.idServicio!} />
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
