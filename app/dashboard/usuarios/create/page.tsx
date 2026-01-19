import UsuarioForm from "@/app/ui/usuarios/form";
import { lusitana } from "@/app/ui/fonts";

export default function Page() {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-2xl mb-6`}>
        Usuarios / Nuevo Usuario
      </h1>
      <UsuarioForm mode="create" />
    </div>
  );
}
