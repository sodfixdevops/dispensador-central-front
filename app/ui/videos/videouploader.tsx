"use client";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Importar toast
import {
  FetchConceptosByPrefijo,
  guardarConceptos,
} from "@/app/lib/conceptos-actions";
import { TrconData, TrconMasivoDto } from "@/app/lib/definitions";
import { useRouter } from "next/navigation";

const VideoUploader = () => {
  const [files, setFiles] = useState<
    { codigo: number; name: string; posicion: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para saber si estamos enviando
  const router = useRouter();
  useEffect(() => {
    // Función para obtener los archivos previos desde el backend
    const fetchFiles = async () => {
      try {
        const response = await FetchConceptosByPrefijo(3); // Asegúrate de que esta ruta sea correcta
        const mappedFiles: any = response.map((item: TrconData) => ({
          codigo: item.correlativo, // Usamos 'descripcion' como el nombre
          posicion: item.abreviacion, // Usamos 'abreviacion' como el número
          name: item.descripcion, // Mantenemos el 'correlativo'
        }));
        setFiles(mappedFiles);
      } catch (error) {
        console.error("Ocurrió un error al obtener los archivos", error);
      }
    };

    fetchFiles();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    // Obtener el último "codigo" en los archivos existentes
    const lastCodigo = files.reduce(
      (max, file) => Math.max(max, file.codigo),
      0
    );

    // Mapear los archivos nuevos asignando un "codigo" correlativo
    const newFiles = acceptedFiles.map((file, index) => ({
      name: file.name,
      codigo: lastCodigo + index + 1, // El código se asigna correlativamente
      posicion: 0, // La posición comienza vacía, el usuario la editará
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    //accept: { "video/*": ["video/mp4", "video/webm", "video/ogg"] }, // Solo aceptar archivos de video
  });

  const handleNumberChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFiles = [...files];
    newFiles[index].posicion = parseInt(event.target.value, 10);
    setFiles(newFiles);
  };

  const handleDelete = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index); // Eliminar el archivo en el índice
    setFiles(newFiles);
  };

  const handleSave = async () => {
    setIsSubmitting(false); // Cambiar a "enviando" al hacer clic en el botón
    const videos: TrconData[] = files.map((data) => ({
      prefijo: 3,
      correlativo: data.codigo,
      descripcion: data.name,
      abreviacion: data.posicion.toString(),
      marca: 0,
    }));
    const masivo: TrconMasivoDto = {
      registros: videos,
      prefijo: 3,
    };

    console.log(videos);
    //return;
    try {
      // Simulación del proceso de envío al backend
      const result = await guardarConceptos(masivo);
      if (result?.success) {
        await toast.success("Se guardaron los cambios", {
          position: "top-center",
          autoClose: 3000,
        });
        //router.push("/dashboard/videos");
      } else {
        if (Array.isArray(result?.message)) {
          result?.message.map((msj: string) => {
            toast.error(`${msj}`, {
              position: "top-center",
              autoClose: 3000,
            });
          });
        }
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error");
    } finally {
      setIsSubmitting(false); // Volver a "listo" después de procesar
    }
  };

  return (
    <div className="w-full p-4">
      {/* Zona de arrastrar y soltar */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-gray-500"
      >
        <input {...getInputProps()} />
        <p className="text-gray-700">Arrastra tus archivos de video aquí</p>
      </div>

      {/* Tabla de archivos */}
      {files.length > 0 && (
        <table className="mt-4 w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left border-b">Codigo</th>
              <th className="px-4 py-2 text-left border-b">Nombre del Video</th>
              <th className="px-4 py-2 text-left border-b">Numeración</th>
              <th className="px-4 py-2 text-left border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index} className="odd:bg-gray-50 even:bg-gray-100">
                <td className="px-4 py-2">{file.codigo}</td>
                <td className="px-4 py-2">{file.name}</td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={file.posicion}
                    onChange={(e) => handleNumberChange(index, e)}
                    className="w-16 p-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(index)} // Eliminar el archivo
                    className="px-4 py-1 text-white bg-red-500 hover:bg-red-600 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Botón para guardar */}
      <div className="mt-4 flex justify-end gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-md text-white ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? "Procesando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
};

export default VideoUploader;
