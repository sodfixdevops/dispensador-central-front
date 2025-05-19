import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export function NuevoPerfil() {
  return (
    <Link
      href="/dashboard/perfila/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nuevo Perfil</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateSucursal({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/sucursales/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function ServiciosPerfil({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/perfila/${id}/serviciosp`}
      className="rounded-md border p-2 hover:bg-gray-100"
      title="Servicios"
    >
      <span className="sr-only">ServiciosPerfil</span>
      <ClipboardDocumentIcon className="w-5" />
    </Link>
  );
}

export function AgenciasPerfil({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/perfila/${id}/agenciasp`}
      className="rounded-md border p-2 hover:bg-gray-100"
      title="Perfiles de Agencia"
    >
      <span className="sr-only">AgenciasPerfil</span>
      <TableCellsIcon className="w-5" />
    </Link>
  );
}

export function DeleteSucursal({ id }: { id: number }) {
  return (
    <>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
