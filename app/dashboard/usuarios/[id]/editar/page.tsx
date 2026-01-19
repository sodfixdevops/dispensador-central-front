import UsuarioForm from "@/app/ui/usuarios/form";
import { FetchUsuarioById } from "@/app/lib/aduser-actions";
import { lusitana } from "@/app/ui/fonts";

export default async function Page({ params }: { params: { id: string } }) {
  const user = await FetchUsuarioById(params.id);

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-2xl mb-6`}>
        Usuarios / Editar Usuario
      </h1>

      <UsuarioForm mode="edit" id={params.id} initialData={user ?? undefined} />
    </div>
  );
}
