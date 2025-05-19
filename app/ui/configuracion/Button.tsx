import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export function CrearConcepto() {
  return (
    <Link
      href="/dashboard/configuracion/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nuevo concepto</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function CrearConceptoDetalle({ prefijo }: { prefijo: number }) {
  return (
    <Link
      href={`/dashboard/configuracion/${prefijo}/detalle/create`}
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Nuevo Detalle</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateCabecera({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/configuracion/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function UpdateDetalle({ pref, corr }: { pref: number; corr: number }) {
  return (
    <Link
      href={`/dashboard/configuracion/${pref}/detalle/${corr}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Update</span>
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DetalleConcepto({ id }: { id: number }) {
  return (
    <Link
      href={`/dashboard/configuracion/${id}/detalle`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <span className="sr-only">Detalle</span>
      <ListBulletIcon className="w-5" />
    </Link>
  );
}

export function DeleteConcepto({ id }: { id: number }) {
  return (
    <>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </>
  );
}
