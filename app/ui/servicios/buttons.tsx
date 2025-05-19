import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export function CrearServicio() {
  return (
    <Link
      href="/dashboard/servicios/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nuevo Servicio</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CrearSubServicio({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/servicios/${id}/subservicios/create`}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nuevo Subservicio</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateServicio({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/servicios/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function UpdateSubservicio({
  id,
  subid,
}: {
  id: number;
  subid: number;
}) {
  return (
    <Link
      href={`/dashboard/servicios/${id}/subservicios/${subid}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function ListaServicios({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/servicios/${id}/subservicios`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Detalle</span>
      <ListBulletIcon className="w-5" />
    </Link>
  );
}

export function DeleteServicio({ id }: { id: number }) {
  return (
    <>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
