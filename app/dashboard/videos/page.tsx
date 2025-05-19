// Asegúrate de que la ruta sea correcta
import VideoUploader from "@/app/ui/videos/videouploader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo

export default async function Page({ params }: { params: { id: number } }) {
  const query = "";
  const currentPage = 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Perfiles</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* Aquí podrías incluir otros componentes */}
      </div>

      {/* Aquí se agrega el componente VideoUploader */}
      <VideoUploader />
      <ToastContainer />

      {/* Aquí puedes agregar otros componentes como Pagination, etc. */}
    </div>
  );
}
