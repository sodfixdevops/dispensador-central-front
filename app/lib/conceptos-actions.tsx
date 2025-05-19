"use server";
import { number, z } from "zod";
import {
  AgenData,
  ApiResponse,
  TrconData,
  TrconMasivoDto,
} from "./definitions";
export async function FetchConceptosByPrefijo(prefijo: number) {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conceptos/prefijo/${prefijo}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener lista del prefijo");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const conceptos: TrconData[] = result.map((item: any) => ({
      prefijo: item.prefijo,
      correlativo: item.correlativo,
      descripcion: item.descripcion,
      abreviacion: item.abreviacion,
      marca: item.marca,
      responseCode: item.responseCode,
      message: item.message,
    }));

    // Retornar los parámetros mapeados
    return conceptos;
  } catch (error) {
    console.error("Error al obtener la lista del prefijo:", error);
    return [];
  }
}

export async function FetchConceptosByUnique(
  prefijo: number,
  correletivo: number
) {
  try {
    // Enviar la solicitud GET al servicio
    console.log(
      `${process.env.NEXT_PUBLIC_API_URL}/conceptos/concepto/${prefijo}/${correletivo}`
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conceptos/concepto/${prefijo}/${correletivo}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener el concepto");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const concepto: TrconData = {
      prefijo: result.prefijo,
      correlativo: result.correlativo,
      descripcion: result.descripcion,
      abreviacion: result.abreviacion,
      marca: result.marca,
    };

    // Retornar los parámetros mapeados
    return concepto;
  } catch (error) {
    console.error("Error al obtener la lista del prefijo:", error);
    return null;
  }
}

export async function FetchConceptosPerfiles() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conceptos/perfiles/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener lista del perfiles");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const servicios: TrconData[] = result.map((item: any) => ({
      prefijo: item.prefijo,
      correlativo: item.correlativo,
      descripcion: item.descripcion,
      abreviacion: item.abreviacion,
      marca: item.marca,
      responseCode: item.responseCode,
      message: item.message,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener la lista del prefijo:", error);
    return [];
  }
}

export async function FetchConceptosCabecera() {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conceptos/cabecera/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener las cabeceras de conceptos");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const servicios: TrconData[] = result.map((item: any) => ({
      prefijo: item.prefijo,
      correlativo: item.correlativo,
      descripcion: item.descripcion,
      abreviacion: item.abreviacion,
      marca: item.marca,
    }));

    // Retornar los parámetros mapeados
    return servicios;
  } catch (error) {
    console.error("Error al obtener la lista del prefijo:", error);
    return [];
  }
}

export async function FetchConceptosDetalle(prefijo: number) {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conceptos/prefijo/${prefijo}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener detalle de prefijo");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `Agencia[]`
    const detalle: TrconData[] = result.map((item: any) => ({
      prefijo: item.prefijo,
      correlativo: item.correlativo,
      descripcion: item.descripcion,
      abreviacion: item.abreviacion,
      marca: item.marca,
    }));

    // Retornar los parámetros mapeados
    return detalle;
  } catch (error) {
    console.error("Error al obtener la lista del prefijo:", error);
    return [];
  }
}

const CreateConceptoSchema = z.object({
  prefijo: z.coerce.number(),
  correlativo: z.coerce.number(),
  descripcion: z.string(),
  abreviacion: z.string(),
  marca: z.coerce.number(),
});

const CreateConceptoFormSchema = CreateConceptoSchema.omit({});

export async function createConcepto(formData: TrconData) {
  const parsedData = CreateConceptoFormSchema.safeParse({
    prefijo: formData.prefijo,
    correlativo: formData.correlativo,
    descripcion: formData.descripcion?.toUpperCase(),
    abreviacion: formData.abreviacion,
    marca: formData.marca,
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
  //console.log(JSON.stringify(parsedData.data));
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conceptos`, {
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

const UpdateConceptoSchema = z.object({
  prefijo: z.coerce.number(),
  correlativo: z.coerce.number(),
  descripcion: z.string(),
  abreviacion: z.string(),
  marca: z.coerce.number(),
});

const UpdateConceptoFormSchema = UpdateConceptoSchema.omit({});
export async function updateConcepto(
  prefijo: number,
  correlativo: number,
  formData: TrconData
) {
  const parsedData = UpdateConceptoFormSchema.safeParse({
    prefijo: formData.prefijo,
    correlativo: formData.correlativo,
    descripcion: formData.descripcion?.toUpperCase(),
    abreviacion: formData.abreviacion,
    marca: formData.marca,
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
    `${process.env.NEXT_PUBLIC_API_URL}/conceptos/${prefijo}/${correlativo}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    }
  );
  const data = await response.json();
  console.log(">>>" + data);
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}

export async function guardarConceptos(
  formData: TrconMasivoDto
): Promise<ApiResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conceptos/bulk`,
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
