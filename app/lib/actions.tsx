"use server";
import { z } from "zod";
import {
  ApiResponse,
  ComerciosData,
  ConceptosData,
  DispositivoData,
  LoginUser,
  ParametrosTable,
  PrecioPosData,
  PrecioTranData,
  UsuariosData,
} from "./definitions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatDateLatam } from "./utils";
import { v4 as uuidv4 } from "uuid";
import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";

export async function createInvoice(formData: FormData) {}

const CreateparametroSchema = z.object({
  nombreEmpresa: z.string(),
  numeroNit: z.string(),
  usrBankHome: z.coerce.number(),
  passBankHome: z.string(),
  tokenAPIBankHome: z.string(),
  nroCtaBankHome: z.string(),
  sobregiroMax: z.string(),
  diasGracia: z.coerce.number(),
});

const UpdateparametroSchema = z.object({
  Codigo: z.coerce.number(),
  nombreEmpresa: z.string(),
  numeroNit: z.string(),
  usrBankHome: z.coerce.number(),
  passBankHome: z.string(),
  tokenAPIBankHome: z.string(),
  nroCtaBankHome: z.string(),
  sobregiroMax: z.string(),
  diasGracia: z.coerce.number(),
});

const CreateparametroFormSchema = CreateparametroSchema.omit({});

const UpdateparametroFormSchema = UpdateparametroSchema.omit({
  Codigo: true,
});

export async function createParametro(formData: FormData) {
  const parsedData = CreateparametroFormSchema.safeParse({
    nombreEmpresa: formData.get("nombreEmpresa"),
    numeroNit: formData.get("numeroNit"),
    usrBankHome: formData.get("usrBankHome"),
    passBankHome: formData.get("passBankHome"),
    tokenAPIBankHome: formData.get("tokenAPIBankHome"),
    nroCtaBankHome: formData.get("nroCtaBankHome"),
    sobregiroMax: formData.get("sobregiroMax"),
    diasGracia: formData.get("diasGracia"),
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
    `${process.env.NEXT_PUBLIC_API_URL}/parametros-saas/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedData.data),
    }
  );
  /*console.log(response);
  response.status;
  const result = await response.json();
  console.log(`Resultado ${result}`);*/
  //convertir data en JSON
  const data = await response.json();
  const respuesta: ApiResponse = {
    success: response.ok,
    status: response.status,
    message: data.message,
  };

  return respuesta;
}

export async function updateParametro(id: string, formData: FormData) {
  const {
    nombreEmpresa,
    numeroNit,
    usrBankHome,
    passBankHome,
    tokenAPIBankHome,
    nroCtaBankHome,
    sobregiroMax,
    diasGracia,
  } = UpdateparametroFormSchema.parse({
    nombreEmpresa: formData.get("nombreEmpresa"),
    numeroNit: formData.get("numeroNit"),
    usrBankHome: formData.get("usrBankHome"),
    passBankHome: formData.get("passBankHome"),
    tokenAPIBankHome: formData.get("tokenAPIBankHome"),
    nroCtaBankHome: formData.get("nroCtaBankHome"),
    sobregiroMax: formData.get("sobregiroMax"),
    diasGracia: formData.get("diasGracia"),
  });

  // Enviar la solicitud POST al servicio
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/parametros-saas/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombreEmpresa,
        numeroNit,
        usrBankHome,
        passBankHome,
        tokenAPIBankHome,
        nroCtaBankHome,
        sobregiroMax,
        diasGracia,
      }),
    }
  );

  // Verificar si la solicitud fue exitosa
  if (!response.ok) {
    throw new Error("Error al crear el parámetro");
  }

  const result = await response.json();
  console.log("Parámetro modificado con éxito:", result);

  revalidatePath("/dashboard/parametros");
  redirect("/dashboard/parametros");
}

export async function FetchParametrosTable(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    console.log("METODO FETCH");
    console.log();
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/parametros-saas/`,
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
    const parametros: ParametrosTable[] = result.map((item: any) => ({
      Codigo: item.Codigo,
      nombreEmpresa: item.nombreEmpresa,
      numeroNit: item.numeroNit,
      usrBankHome: item.usrBankHome,
      passBankHome: item.passBankHome,
      tokenAPIBankHome: item.tokenAPIBankHome,
      nroCtaBankHome: item.nroCtaBankHome,
      sobregiroMax: item.sobregiroMax,
      diasGracia: item.diasGracia,
    }));

    // Retornar los parámetros mapeados
    return parametros;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

export async function FetchParametroById(id: string): Promise<any> {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/parametros-saas/${id}`,
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
    const parametro: ParametrosTable = {
      Codigo: result.Codigo,
      nombreEmpresa: result.nombreEmpresa,
      numeroNit: result.numeroNit,
      usrBankHome: result.usrBankHome,
      passBankHome: result.passBankHome,
      tokenAPIBankHome: result.tokenAPIBankHome,
      nroCtaBankHome: result.nroCtaBankHome,
      sobregiroMax: result.sobregiroMax,
      diasGracia: result.diasGracia,
    };

    // Retornar los parámetros mapeados
    return parametro;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return null;
  }
}

const CreatepComercioSchema = z.object({
  nombreComercio: z.string(),
  tipoIdentificacion: z.coerce.number(),
  nroIdentificacion: z.coerce.number(),
  emailComercio: z.string(),
  usrBankComer: z.string(),
  passBankComer: z.string(),
  tokenApiBankComer: z.string(),
  nroCtaBankComer: z.string(),
  estado: z.coerce.number(),
  diasGracia: z.coerce.number(),
  sobreGiro: z.coerce.number(),
});

const CreateComercioFormSchema = CreatepComercioSchema.omit({});

/*Table Comercio*/
export async function createComercio(formData: FormData) {
  const parsedData = CreateComercioFormSchema.safeParse({
    nombreComercio: formData.get("nombreComercio"),
    tipoIdentificacion: formData.get("tipoIdentificacion"),
    nroIdentificacion: formData.get("nroIdentificacion"),
    emailComercio: formData.get("emailComercio"),
    usrBankComer: formData.get("usrBankComer"),
    passBankComer: formData.get("passBankComer"),
    tokenApiBankComer: formData.get("tokenApiBankComer"),
    nroCtaBankComer: formData.get("nroCtaBankComer"),
    estado: formData.get("estado"),
    diasGracia: 15,
    sobreGiro: 20,
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
  console.log(JSON.stringify(parsedData.data));
  // Enviar la solicitud POST al servicio
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comercio/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsedData.data),
  });
  const result = await response.json();
  console.log("AQUI ", result, `${process.env.NEXT_PUBLIC_API_URL}/comercio`);
  // Verificar si la solicitud fue exitosa
  if (!result.success) {
    //throw new Error("Error al crear el comercio");
    return {
      success: false,
      status: 400,
      message: result.message,
    };
  }

  console.log("Comercio creado exitosamente:", result);

  revalidatePath("/dashboard/comercio");
  //

  return {
    success: true,
    status: result.status,
    message: result.message,
  };
}

export async function FetchComerciosTable(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;

    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/comercio/`,
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
    const comercios: ComerciosData[] = result.map((item: any) => ({
      idComercio: item.idComerciom,
      nombreComercio: item.nombreComercio,
      tipoIdentificacion: item.tipoIdentificacion,
      nroIdentificacion: item.nroIdentificacion,
      emailComercio: item.emailComercio,
      usrBankComer: item.usrBankComer,
      passBankComer: item.passBankComer,
      tokenApiBankComer: item.tokenApiBankComer,
      nroCtaBankComer: item.nroCtaBankComer,
      estado: item.estado,
      nroListaPrecioPos: item.nroListaPrecioPos,
      nroListaPreciosTrx: item.nroListaPreciosTrx,
      diasGracia: item.diasGracia,
      sobreGiro: item.sobreGiro,
      fechaRegistro: item.fechaRegistro,
      fechaUpdate: item.fechaUpdate,
    }));

    // Retornar los parámetros mapeados
    return comercios;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

/**
 * Conceptos
 */

export async function FetchConceptoTable(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;

    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/concepto/${query}`,
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

    // Mapear los datos al tipo `ConceptosData[]`
    const conceptos: ConceptosData[] = result.map((item: any) => ({
      prefijo: item.prefijo,
      correlativo: item.correlativo,
      descripcion: item.descripcion,
      abreviacion: item.abreviacion,
    }));

    // Retornar los parámetros mapeados
    return conceptos;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

export async function FetchConceptoByTable(query: string, currentPage: number) {
  try {
    currentPage = 1;

    // Enviar la solicitud GET al servicio
    console.log(`${process.env.NEXT_PUBLIC_API_URL}/concepto/${query}`);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/concepto/${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los conceptos");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `ConceptosData[]`
    const conceptos: ConceptosData[] = result.map((item: any) => ({
      prefijo: item.prefijo,
      correlativo: item.correlativo,
      descripcion: item.descripcion,
      abreviacion: item.abreviacion,
    }));

    // Retornar los parámetros mapeados
    return conceptos;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

/**
 * Lista de precios Pos
 */

const CreateListaPrecioPOSSchema = z.object({
  descripcion: z.string(),
  codigoMoneda: z.coerce.number(),
  estado: z.coerce.number(),
});
const UpdateListaPrecioPOSSchema = z.object({
  descripcion: z.string(),
  codigoMoneda: z.coerce.number(),
  estado: z.coerce.number(),
});

const CreateListaPrecioPOSFormSchema = CreateListaPrecioPOSSchema.omit({});
const UpdateListaPrecioPOSFormSchema = UpdateListaPrecioPOSSchema.omit({});

export async function createListaPreciosPOS(formData: FormData) {
  const { descripcion, codigoMoneda, estado } =
    CreateListaPrecioPOSFormSchema.parse({
      descripcion: formData.get("descripcion"),
      codigoMoneda: formData.get("moneda"),
      estado: formData.get("status"),
    });

  // Enviar la solicitud POST al servicio
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prepos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      descripcion,
      codigoMoneda,
      estado,
    }),
  });

  // Verificar si la solicitud fue exitosa
  if (!response.ok) {
    throw new Error("Error al crear parametro Lista de precio POS");
  }

  const result = await response.json();
  console.log("Parámetro Lista de precio creado con éxito:", result);

  revalidatePath("/dashboard/precio-pos");
  redirect("/dashboard/precio-pos");
}

export async function updateListaPreciosPOS(id: string, formData: FormData) {
  const { descripcion, codigoMoneda, estado } =
    UpdateListaPrecioPOSFormSchema.parse({
      descripcion: formData.get("descripcion"),
      codigoMoneda: formData.get("moneda"),
      estado: formData.get("status"),
    });

  // Enviar la solicitud POST al servicio
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/prepos/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        descripcion,
        codigoMoneda,
        estado,
      }),
    }
  );

  // Verificar si la solicitud fue exitosa
  if (!response.ok) {
    throw new Error("Error al crear parametro Lista de precio POS");
  }

  const result = await response.json();
  console.log("Parámetro Lista de precio creado con éxito:", result);

  revalidatePath("/dashboard/precio-pos");
  redirect("/dashboard/precio-pos");
}

export async function FetchPrecioPOSById(id: string): Promise<any> {
  try {
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/prepos/${id}`,
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
    const parametro: PrecioPosData = {
      nroListaPrecioPos: result.nroListaPrecioPos,
      descripcion: result.descripcion,
      codigoMoneda: result.codigoMoneda,
      estado: result.estado,
      fechaRegistro: formatDateLatam(result.fechaRegistro),
    };

    // Retornar los parámetros mapeados
    return parametro;
  } catch (error) {
    console.error("Error al obtener precio POS:", error);
    return null;
  }
}

export async function FetchPreciosPos(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    // Enviar la solicitud GET al servicio
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/prepos/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los parámetros");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `ParametrosTable[]`
    const precioPos: PrecioPosData[] = result.map((item: PrecioPosData) => ({
      nroListaPrecioPos: item.nroListaPrecioPos,
      descripcion: item.descripcion,
      codigoMoneda: item.codigoMoneda,
      estado: item.estado,
      fechaRegistro: formatDateLatam(item.fechaRegistro),
    }));

    // Retornar los parámetros mapeados
    return precioPos;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

/**
 * Lista de precios Tran
 */
const CreateListaPrecioTranSchema = z.object({
  descripcion: z.string(),
  moneda: z.coerce.number(),
  estado: z.coerce.number(),
  rangoInicio: z.coerce.number(),
  rangoFinal: z.coerce.number(),
  precio: z.string(),
});

const CreateListaPrecioTranFormSchema = CreateListaPrecioTranSchema.omit({});

export async function createListaPreciosTran(formData: FormData) {
  const parsedData = CreateListaPrecioTranFormSchema.safeParse({
    descripcion: formData.get("descripcion"),
    moneda: formData.get("moneda"),
    estado: formData.get("status"),
    rangoInicio: formData.get("rangoInicio"),
    rangoFinal: formData.get("rangoFinal"),
    precio: formData.get("precio"),
  });
  console.log("AQUI", parsedData);
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
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pretran`, {
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

  revalidatePath("/dashboard/precios-tran");
  redirect("/dashboard/precios-tran");
}

export async function FetchPreciosTran(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pretran/`,
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
    const precioPos: PrecioTranData[] = result.map((item: PrecioTranData) => ({
      nroListaPreciosTrx: item.nroListaPreciosTrx,
      descripcion: item.descripcion,
      moneda: item.moneda,
      estado: item.estado,
      rangoInicio: item.rangoInicio,
      rangoFinal: item.rangoFinal,
      precio: item.precio,
      fechaRegistro: formatDateLatam(item.fechaRegistro),
    }));

    // Retornar los parámetros mapeados
    return precioPos;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

/**
 * tabla usuarios
 */
const CreateUsuarioSchema = z.object({
  idComercio: z.coerce.number(),
  codigoUsuario: z.string(),
  nombreUsuario: z.coerce.string(),
  nickUsuario: z.coerce.string(),
  password: z.coerce.string(),
  tipoUsuario: z.coerce.number(),
  mailUsuario: z.coerce.string(),
  estadoUsuario: z.coerce.number(),
});

const CreateUsuarioFormSchema = CreateUsuarioSchema.omit({});

export async function createUsuario(formData: FormData) {
  const {
    idComercio,
    codigoUsuario,
    nombreUsuario,
    nickUsuario,
    password,
    tipoUsuario,
    mailUsuario,
    estadoUsuario,
  } = CreateUsuarioFormSchema.parse({
    idComercio: 1,
    codigoUsuario: uuidv4(),
    nombreUsuario: formData.get("nombreUsuario"),
    nickUsuario: formData.get("nickUsuario"),
    password: formData.get("password"),
    tipoUsuario: 1,
    mailUsuario: formData.get("mailUsuario"),
    estadoUsuario: 1,
  });

  // Enviar la solicitud POST al servicio

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idComercio,
      codigoUsuario,
      nombreUsuario,
      nickUsuario,
      password,
      tipoUsuario,
      mailUsuario,
      estadoUsuario,
    }),
  });

  // Verificar si la solicitud fue exitosa
  if (!response.ok) {
    throw new Error("Error al crear parametro Lista de precio POS");
  }

  const result = await response.json();
  console.log("Parámetro Lista de precio creado con éxito:", result);

  revalidatePath("/dashboard/usuarios");
  redirect("/dashboard/usuarios");
}

export async function FetchUsuariosTable(query: string, currentPage: number) {
  try {
    query = "";
    currentPage = 1;
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/usuarios/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Verificar si la solicitud fue exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los usuarios");
    }

    // Parsear la respuesta JSON
    const result = await response.json();

    // Mapear los datos al tipo `ParametrosTable[]`
    const precioPos: UsuariosData[] = result.map((item: UsuariosData) => ({
      codigoUsuario: item.codigoUsuario,
      nickUsuario: item.nickUsuario,
      password: item.password,
      tipo: item.tipo,
      marcaBaja: item.marcaBaja,
      estado: item.estado,
      fechaRegistro: item.fechaRegistro,
    }));

    // Retornar los parámetros mapeados
    return precioPos;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return [];
  }
}
/**
 * Tabla de dispositivos POS
 */

const CreateDispositivoSchema = z.object({
  idComercio: z.coerce.number(),
  idPos: z.coerce.number(),
  nombrePos: z.string(),
  estadoPos: z.coerce.number(),
  fechaRegistro: z.string(),
  fechaUpdate: z.string(),
});

const CreateDispositivoFormSchema = CreateDispositivoSchema.omit({
  idPos: true,
  fechaRegistro: true,
  fechaUpdate: true,
});

export async function createDispositivo(formData: FormData) {
  const { idComercio, nombrePos, estadoPos } = CreateDispositivoSchema.parse({
    idComercio: 1,
    nombrePos: formData.get("nombrePos"),
    estadoPos: formData.get("estadoPos"),
  });

  // Enviar la solicitud POST al servicio
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dispositivos`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idComercio,
        nombrePos,
        estadoPos,
      }),
    }
  );

  // Verificar si la solicitud fue exitosa
  if (!response.ok) {
    throw new Error("Error al crear dispositivo");
  }

  const result = await response.json();
  console.log("Dispositivo registrado exitosamente:", result);

  revalidatePath("/dashboard/dispositivos");
  redirect("/dashboard/dispositivos");
}

export async function FetchDispositivosTable(
  query: string,
  currentPage: number
) {
  try {
    query = "";
    currentPage = 1;
    // Enviar la solicitud GET al servicio
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dispositivos/`,
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
    const dispositivos: DispositivoData[] = result.map((item: any) => ({
      idPos: item.idPos,
      nombrePos: item.nombrePos,
      estadoPos: item.estadoPos,
      fechaRegistro: formatDateLatam(item.fechaRegistro),
      fechaUpdate: formatDateLatam(item.fechaUpdate),
    }));

    // Retornar los parámetros mapeados
    return dispositivos;
  } catch (error) {
    console.error("Error al obtener los parámetros:", error);
    return [];
  }
}

/*
  Accion de login
*/
export const loginAction = async (values: LoginUser) => {
  try {
    console.log(`${values.username} - ${values.password}`);
    const resp = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });
    console.log("emmmm", resp);
  } catch (error) {
    console.log("zzzz", error);
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: `error 500 ${error}` };
  }
};
