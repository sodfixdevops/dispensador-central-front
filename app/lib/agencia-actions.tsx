"use server";
import { number, z } from "zod";
import {
  Agenciafiltro,
  AgenData,
  ApiResponse,
  pfageDto,
  pfageMasivoDto,
  Sucursalfiltro,
} from "./definitions";

export async function FetchSucursales(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/agencia/sucursales`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener las sucursales");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const servicios: AgenData[] = result.map((item: any) => ({
      idAgencia: item.idAgencia,
      descripcion: item.descripcion,
      sigla: item.sigla,
      plaza: item.plaza,
      fechaRegistro: item.fechaRegistro,
      marca: item.marca,
      responseCode: item.responseCode,
      message: item.message,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener las sucursales:", error);
    return [];
  }
}

export async function fetchSucursales(sucursales: AgenData[]) {
  let sucursalesMap: Record<number, AgenData> = {};
  // Convertimos el array de sucursales en un hash map
  sucursalesMap = sucursales.reduce((acc, sucursal) => {
    if (sucursal.idAgencia) {
      acc[sucursal.idAgencia] = sucursal;
    }
    return acc;
  }, {} as Record<number, AgenData>);

  return sucursalesMap;
}

export async function FetchSucursalById(id: number): Promise<AgenData> {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/agencia/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener el registro");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `ParametrosTable[]`
    const agenData: AgenData = {
      idAgencia: result.idAgencia,
      descripcion: result.descripcion,
      sigla: result.sigla,
      plaza: result.plaza,
      fechaRegistro: result.fechaRegistro,
      marca: result.marca,
      responseCode: 201,
      message: result.message,
    };

    // Retornar los parámetros mapeados
    return agenData;
  } catch (error) {
    console.error("Error al obtener el registro:", error);
    return {
      responseCode: 401,
      message: " " + error,
    };
  }
}

export async function FetchAgencias(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/agencia/lista`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener las sucursales");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const servicios: AgenData[] = result.map((item: any) => ({
      idAgencia: item.idAgencia,
      descripcion: item.descripcion,
      sigla: item.sigla,
      plaza: item.plaza,
      fechaRegistro: item.fechaRegistro,
      marca: item.marca,
      responseCode: item.responseCode,
      message: item.message,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener las sucursales:", error);
    return [];
  }
}

export async function FetchAgenciasPerfil(perfil: number) {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/perfilesagencia/agenciasperfil/${perfil}`,
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
    const servicios: pfageDto[] = result.map((item: any) => ({
      codigo: item.codigo,
      perfil: item.perfil,
      agencia: item.agencia,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener las agencias del perfil:", error);
    return [];
  }
}

const CreateAgenSchema = z.object({
  idAgencia: z.coerce.number(),
  descripcion: z.string(),
  sigla: z.string(),
  plaza: z.coerce.number(),
  marca: z.coerce.number(),
});

const UpdateAgenSchema = z.object({
  descripcion: z.string(),
  sigla: z.string(),
  plaza: z.coerce.number(),
  marca: z.coerce.number(),
});

const CreateAgenFormSchema = CreateAgenSchema.omit({});

const UpdateAgenFormSchema = UpdateAgenSchema.omit({});

export async function createAgencia(formData: AgenData) {
  const parsedData = CreateAgenFormSchema.safeParse({
    idAgencia: formData.idAgencia,
    descripcion: formData.descripcion?.toUpperCase(),
    sigla: formData.sigla?.toUpperCase(),
    plaza: formData.plaza || 0,
    marca: 0,
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
  console.log(JSON.stringify(parsedData.data));
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencia`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedData.data),
  });
  console.log(response);
  const data = await response.json();
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}

export async function updateAgencia(id: number, formData: AgenData) {
  const parsedData = UpdateAgenFormSchema.safeParse({
    descripcion: formData.descripcion?.toUpperCase(),
    sigla: formData.sigla?.toUpperCase(),
    plaza: formData.plaza || 0,
    marca: 0,
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
  console.log(`${process.env.NEXT_PUBLIC_API_URL}/agencia/${id}`);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/agencia/${id}`,
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

export async function guardarAgenciasPerfil(
  formData: pfageMasivoDto
): Promise<ApiResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/perfilesagencia/bulk`,
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

export async function FetchFiltrosSucursales() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/agencia/filtros/sucursales`,
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
    const sucursales: Sucursalfiltro[] = result.map((item: any) => ({
      value: item.value,
      label: item.label,
    }));

    // Retornar los parámetros mapeados
    return sucursales;
  } catch (error) {
    console.error("Error al obtener las sucursales", error);
    return [];
  }
}

export async function FetchFiltrosAgencias() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/agencia/filtros/agencias`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los filtros de agencia");
    }
    // Parsear la respuesta JSON
    const result = await response.json();
    // Mapear los datos al tipo `ServiciosData[]`
    const agencias: Agenciafiltro[] = result.map((item: any) => ({
      value: item.value,
      label: item.label,
      idSucursal: item.idSucursal,
    }));

    // Retornar los parámetros mapeados
    return agencias;
  } catch (error) {
    console.error("Error al obtener las sucursales", error);
    return [];
  }
}
