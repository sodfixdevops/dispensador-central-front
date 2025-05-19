"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { ApiResponse, UsuariosData } from "./definitions";

/**
 * tabla usuarios
 */
const CreateUsuarioSchema = z.object({
  codigoUsuario: z.string(),
  nickUsuario: z.string(),
  password: z.string(),
  marcaBaja: z.coerce.number(),
  estado: z.coerce.number(),
  tipo: z.coerce.number(),
});

const UpdateUsuarioSchema = z.object({
  nickUsuario: z.string(),
  password: z.string(),
  marcaBaja: z.coerce.number(),
  estado: z.coerce.number(),
  tipo: z.coerce.number(),
});

const CreateUsuarioFormSchema = CreateUsuarioSchema.omit({});
const UpdateUsuarioFormSchema = UpdateUsuarioSchema.omit({});

export async function createUsuario(formData: UsuariosData) {
  const parsedData = CreateUsuarioFormSchema.safeParse({
    codigoUsuario: uuidv4(),
    nickUsuario: formData.nickUsuario,
    password: formData.password,
    marcaBaja: formData.marcaBaja,
    estado: formData.estado,
    tipo: formData.tipo,
  });

  if (!parsedData.success) {
    // Si hay errores, devuelve un objeto JSON con los mensajes de error
    const errors = parsedData.error.errors; // Obtén la lista de errores
    const errorMessages = errors.map((err) => err.message); // Mapea los mensajes

    return {
      success: false,
      status: 401,
      message: errorMessages,
    };
  }

  // Enviar la solicitud POST al servicio

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/usuarios/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    }
  );
  console.log(response);
  const data = await response.json();
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}

export async function updateUsuario(
  codigoUsuario: string,
  formData: UsuariosData
) {
  const parsedData = UpdateUsuarioFormSchema.safeParse({
    nickUsuario: formData.nickUsuario,
    password: formData.password,
    marcaBaja: formData.marcaBaja,
    estado: formData.estado,
    tipo: formData.tipo,
  });

  if (!parsedData.success) {
    // Si hay errores, devuelve un objeto JSON con los mensajes de error
    const errors = parsedData.error.errors; // Obtén la lista de errores
    const errorMessages = errors.map((err) => err.message); // Mapea los mensajes

    return {
      success: false,
      status: 401,
      message: errorMessages,
    };
  }

  // Enviar la solicitud POST al servicio

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedData.data),
  });
  const data = await response.json();
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}
