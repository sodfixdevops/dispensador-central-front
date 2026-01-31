"use server";
import { AduserData, AduserDataCrud } from "./definitions";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function FetchUsuariosTable(
  query: string,
  currentPage: number,
): Promise<AduserData[]> {
  try {
    // await delay(3500); // simula 3.5 segundos de carga
    console.log(
      "APIXXXXXXXXXXXXXXXXXXXXXXXXXX:",
      process.env.NEXT_PUBLIC_API_URL,
    );

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aduser`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Error al obtener las cabeceras de conceptos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    return [];
  }
}

export async function FetchUsuarioById(
  id: string,
): Promise<AduserDataCrud | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aduser/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("No se encontró el usuario");
    }

    const item = await response.json();

    return {
      adusrusrn: item.adusrusrn,
      adusrnick: item.adusrnick,
      adusrtipo: item.adusrtipo,
      adusrstat: item.adusrstat,
      adusrfreg: new Date(item.adusrfreg),
      adusrusra: item.adusrusra,
      adusrmrcb: item.adusrmrcb,
      addispcode: item.addispcode,
    };
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    return null;
  }
}

export async function createUsuario(data: AduserDataCrud) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aduser/registrar`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error al crear usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createUsuario:", error);
    throw error;
  }
}

export async function createCuentaUsuario(data: AduserDataCrud) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aduser/new`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error al crear usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createCuentaUsuario:", error);
    throw error;
  }
}

export async function updateUsuario(id: string, data: AduserDataCrud) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aduser/modificar/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error al actualizar usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateUsuario:", error);
    throw error;
  }
}

export async function updateCuentaUsuario(id: string, data: AduserDataCrud) {
  try {
    console.log(JSON.stringify(data));
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aduser/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error al actualizar usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en updateCuentaUsuario:", error);
    throw error;
  }
}

export async function loginUsuario(
  username: string,
  password: string,
): Promise<{
  id?: string;
  token?: string;
  username?: string;
  tipo?: number;
  status: number;
  message?: string;
  dispositivo?: {
    codigo: number;
    descripcion: string;
    api_url: string;
  };
}> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/aduser/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ username, password }),
      },
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    return {
      status: 500,
      message: "Error de conexión con el servidor.",
    };
  }
}
