"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatDateLatam } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";
import {
  ApiResponse,
  dperfDto,
  dperfMasivoDto,
  pfageMasivoDto,
  ServiciosData,
  SubservicioFiltro,
} from "./definitions";

export async function FetchServiciosTable(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    console.log("METODO FETCH");
    console.log(`${process.env.NEXT_PUBLIC_API_URL}/servicios/`);
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/servicios/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los parámetros");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `ParametrosTable[]`
    /*
    idServicio: number;
    descripcion?: string;
    sigla?: string;
    prioridad?: number;
    servicio?: number;
    tipo?: number;
    */
    const servicios: ServiciosData[] = result.map((item: any) => ({
      idServicio: item.idServicio,
      descripcion: item.descripcion,
      sigla: item.sigla,
      prioridad: item.prioridad,
      posicion: item.posicion,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener los servicios:", error);
    return [];
  }
}

export async function FetchSubServiciosTable(idServicio: number) {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/servicios/subservicios/${idServicio}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los subservicios");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const servicios: ServiciosData[] = result.map((item: any) => ({
      idServicio: item.idServicio,
      descripcion: item.descripcion,
      sigla: item.sigla,
      prioridad: item.prioridad,
      posicion: item.posicion,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener los subservicios:", error);
    return [];
  }
}

export async function FetchServicioById(id: number): Promise<ServiciosData> {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/servicios/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener servicio");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `ParametrosTable[]`
    const servicioData: ServiciosData = {
      idServicio: result.idServicio,
      descripcion: result.descripcion,
      sigla: result.sigla,
      prioridad: result.prioridad,
      posicion: result.posicion,
      servicio: result.servicio,
      tipo: result.tipo,
    };

    // Retornar los parámetros mapeados
    return servicioData;
  } catch (error) {
    console.error("Error al obtener el servicio:", error);
    return {
      responseCode: 401,
      message: " " + error,
    };
  }
}

const CreateServicioSchema = z.object({
  idServicio: z.coerce.number(),
  descripcion: z.string(),
  sigla: z.string(),
  prioridad: z.coerce.number(),
  posicion: z.coerce.number(),
  tipo: z.coerce.number(),
  servicio: z.coerce.number(),
});

const UpdateServicioSchema = z.object({
  descripcion: z.string(),
  sigla: z.string(),
  prioridad: z.coerce.number(),
  posicion: z.coerce.number(),
  tipo: z.coerce.number(),
});

const CreateServicioFormSchema = CreateServicioSchema.omit({});

const UpdateServicioFormSchema = UpdateServicioSchema.omit({});

export async function createServicio(formData: ServiciosData) {
  const parsedData = CreateServicioFormSchema.safeParse({
    idServicio: formData.idServicio,
    descripcion: formData.descripcion?.toUpperCase(),
    sigla: formData.sigla?.toUpperCase(),
    prioridad: formData.prioridad,
    posicion: formData.posicion,
    tipo: formData.tipo,
    servicio: formData.servicio,
  });
  if (!parsedData.success) {
    // Si hay errores, devuelve un objeto JSON con los mensajes de error
    console.log(parsedData.error);
    const errors = parsedData.error.errors; // Obtén la lista de errores
    const errorMessages = errors.map((err) => err.message); // Mapea los mensajes

    return {
      success: false,
      status: 401,
      message: errorMessages,
    };
  }
  // Enviar la solicitud POST al servicio
  console.log(JSON.stringify(parsedData.data));
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicios`, {
    method: "POST",
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

export async function updateServicio(id: number, formData: ServiciosData) {
  const parsedData = UpdateServicioFormSchema.safeParse({
    descripcion: formData.descripcion,
    sigla: formData.sigla,
    prioridad: formData.prioridad,
    posicion: formData.posicion,
    tipo: formData.tipo,
  });
  if (!parsedData.success) {
    // Si hay errores, devuelve un objeto JSON con los mensajes de error
    const errors = parsedData.error.errors; // Obtén la lista de errores
    console.log(errors);
    const errorMessages = errors.map((err) => err.message); // Mapea los mensajes

    return {
      success: false,
      status: 401,
      message: errorMessages,
    };
  }
  // Enviar la solicitud POST al servicio
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/servicios/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    }
  );
  const data = await response.json();
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}

export async function FetchSubServiciosAccionTable() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/servicios/subserviciosaccion`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los subservicios");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const servicios: ServiciosData[] = result.map((item: any) => ({
      idServicio: item.idServicio,
      descripcion: item.descripcion,
      sigla: item.sigla,
      prioridad: item.prioridad,
      posicion: item.posicion,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener los subservicios:", error);
    return [];
  }
}

export async function FetchServiciosPerfil(perfil: number) {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/perfilesservicio/serviciosperfil/${perfil}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los subservicios");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const servicios: dperfDto[] = result.map((item: any) => ({
      codigo: item.codigo,
      perfil: item.perfil,
      servicio: item.servicio,
      tipo: item.tipo,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener los subservicios:", error);
    return [];
  }
}
// servicio que trae los subservicios marcados
export async function FetchSubserviciosPerfil(
  perfil: number,
  servicio: number,
  tipo: number
) {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/perfilesservicio/perfil/subservicios/${perfil}/${servicio}/${tipo}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      `${process.env.NEXT_PUBLIC_API_URL}/perfilesservicio/serviciosperfil/perfil/subservicios/${perfil}/${servicio}/${tipo}`
    );
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los subservicios");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const servicios: dperfDto[] = result.map((item: any) => ({
      codigo: item.codigo,
      perfil: item.perfil,
      servicio: item.servicio,
      subserv: item.subserv,
      tipo: item.tipo,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener los subservicios:", error);
    return [];
  }
}

export async function guardarServiciosPerfil(
  formData: dperfMasivoDto
): Promise<ApiResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/perfilesservicio/bulk`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    }
  );
  const data = await response.json();
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}

export async function FetchFiltrosServicios() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/servicios/filtros/servicios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los subservicios");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const servicios: SubservicioFiltro[] = result.map((item: any) => ({
      value: item.value,
      label: item.label,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener las sucursales", error);
    return [];
  }
}

export async function FetchFiltrosSubServicios() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/servicios/filtros/subservicios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los subservicios");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const servicios: SubservicioFiltro[] = result.map((item: any) => ({
      value: item.value,
      label: item.label,
      idServicio: item.idServicio,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener las sucursales", error);
    return [];
  }
}
