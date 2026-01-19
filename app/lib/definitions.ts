// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: "pending" | "paid";
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: "pending" | "paid";
};
/*Definiciones venturus*/
export type ParametrosFormCreate = {
  nombreEmpresa: string;
  numeroNit: string;
  usrBankHome: number;
  passBankHome: string;
  tokenAPIBankHome: string;
  nroCtaBankHome: string;
  sobregiroMax: string;
  diasGracia: number;
};

export type ParametrosTable = {
  Codigo: number;
  nombreEmpresa: string;
  numeroNit: string;
  usrBankHome: number;
  passBankHome: string;
  tokenAPIBankHome: string;
  nroCtaBankHome: string;
  sobregiroMax: string;
  diasGracia: number;
};

export type ConceptosData = {
  prefijo: number;
  correlativo: number;
  descripcion: string;
  abreviacion: string;
};

export type ComerciosData = {
  idComercio: number;
  nombreComercio: string;
  tipoIdentificacion: number;
  nroIdentificacion: number;
  emailComercio: string;
  usrBankComer: string;
  passBankComer: string;
  tokenApiBankComer: string;
  nroCtaBankComer: string;
  estado: number;
  nroListaPrecioPos: number;
  nroListaPreciosTrx: number;
  diasGracia?: number;
  sobreGiro?: number;
  fechaRegistro?: Date;
  fechaUpdate?: Date;
};
/*Lista de precios Pos*/
export type PrecioPosData = {
  nroListaPrecioPos: number;
  descripcion: string;
  codigoMoneda: number;
  estado: number;
  fechaRegistro: string;
};
/**
 * Lista de precios Transacciones
 */
export type PrecioTranData = {
  nroListaPreciosTrx: number;
  descripcion: string;
  moneda: number;
  estado: number;
  rangoInicio: number;
  rangoFinal: number;
  precio: string;
  fechaRegistro: string;
};

/*Tabla usuarios*/
export type UsuariosData = {
  codigoUsuario?: string;
  nickUsuario?: string;
  password?: string;
  fechaRegistro?: string;
  marcaBaja?: number;
  estado?: number;
  tipo?: number;
};

export type LoginUser = {
  username: string;
  password: string;
};

export type LoginUserResponse = {
  username?: string;
  token?: string;
  tipo?: number;
  status?: number;
  message?: string;
};

export type ApiResponse = {
  success?: boolean;
  status?: number;
  message?: string[];
};

/*
Definiciones de Turnero
*/

export type ServiciosData = {
  idServicio?: number;
  descripcion?: string;
  sigla?: string;
  prioridad?: number;
  posicion?: number;
  servicio?: number;
  tipo?: number;
  responseCode?: number;
  message?: string;
};

export type AgenData = {
  idAgencia?: number;
  descripcion?: string;
  sigla?: string;
  plaza?: number;
  fechaRegistro?: Date;
  marca?: number;
  responseCode?: number;
  message?: string;
};

export type TrconData = {
  prefijo: number;
  correlativo: number; // ← este es el código de moneda
  descripcion: string;
  abreviacion: string;
  marca: number;
  responseCode?: number;
  message?: string;
};

export interface TrconMasivoDto {
  registros?: TrconData[];
  prefijo?: number;
}

export type pfageDto = {
  perfil?: number;
  agencia?: number;
};

export type pfageMasivoDto = {
  registros?: pfageDto[];
  perfil?: number;
  tipo?: number;
};

export type dperfDto = {
  codigo?: number;
  perfil?: number;
  servicio?: number;
  subserv?: number;
  tipo?: number;
};

export type dperfMasivoDto = {
  registros?: dperfDto[];
  perfil?: number;
  servicio?: number;
  tipo?: number;
};

export interface Sucursalfiltro {
  value: number;
  label: string;
}

export interface Agenciafiltro {
  value: number;
  label: string;
  idSucursal: number;
}

export interface ServicioFiltro {
  value: number;
  label: string;
}

export interface SubservicioFiltro {
  value: number;
  label: string;
  idServicio: number;
}

/*Interfaces de Dispensador local*/
export interface dpmtr {
  dpmtrcode?: number;
  dpmtrntra?: number;
  dpmtrdsid?: number;
  dpmtrcant?: number;
  dpmtrstat?: number;
}

export interface gbcucy {
  gbcucygnid?: number;
  gbcucydnid?: number;
  gbcucycmon?: number;
  gbcucydesc?: string;
  gbcucyvlor?: number;
  gbcucyseri?: string;
  gbcucymrcb?: number;
  gbcucycant?: number;
}

export interface Cortes {
  gbcucygnid: number; // ID interno (PK)
  gbcucydnid: number; // ID de denominación
  gbcucycmon: number; // Código de moneda
  gbcucydesc: string; // Descripción (ej. "10", "20")
  gbcucyvlor: number; // Valor numérico (ej. 10, 20)
  gbcucymrcb: number; // Marca de baja (0 = activo, 1 = inactivo)
}

/*Interfaces backend*/
export interface DispositivoDto {
  addispcode: number;
  addispnomb: string;
  addispusrn?: string;
  addipsapis: string;
  addispsrl1?: string;
  addispsrl2?: string;
  addispmrcb: number;
  addispstat: number;
  addispfreg: Date;
  addispfupt?: Date;
  addispusra?: string;
  addispusru?: string;
  nomUsuario: string;
}

export type AduserData = {
  adusrusrn: string;
  adusrnick: string;
  adusrtipo: number;
  adusrfreg: string | Date;
  adusrusra: string;
  adusrstat: number;
  adusrmrcb: number;
  addispcode?: number;
};

export interface AduserDataCrud {
  adusrusrn?: string;
  adusrnick: string;
  adusrclav?: string;
  adusrtipo: number;
  adusrfreg?: Date;
  adusrfupt?: Date;
  adusrusra: string;
  adusrusru?: string;
  adusrstat: number;
  adusrmrcb: number;
  addispcode?: number; // 👈 DEBE ser opcional
}

export class LoginUserResponseDTO {
  status?: number;
  username?: string;
  tipo?: number;
  token?: string;
  message?: string;
  dispositivo?: {
    codigo: number;
    descripcion: string;
    apis: string;
  } | null;
}

// src/transaccion/dto/registrar-transaccion.dto.ts
export interface RegistrarTransaccionDto {
  usuario: string; // UUID del usuario que realiza la transacción
  moneda: number;
  detalle: {
    gbcucyvlor: number; // valor del billete
    gbcucycant: number; // cantidad de billetes
  }[];
}

export interface DpautInterface {
  dpautSeri?: number; // Autogenerado
  dpautFsol?: Date;
  dpautNdes?: number;
  dpautUsrs?: string;
  dpautUsra?: string;
  dpautFaut?: Date;
  dpautStat: number; // Requerido
}

export interface Dptrn {
  dptrnntra: number;
  dptrnndes: number;
  dptrncmon: number;
  dptrnftra: string; // o Date si mantienes tipo Date en frontend
  dptrnimpo: number;
  dptrnmrcb: number;
  dptrnstat: number;
  dptrnfreg: string; // o Date
  dptrnusrn: string;
}

export interface FiltroTransaccion {
  fechaInicio: Date;
  fechaFinal: Date;
  estado: number;
}

export interface DpautInterface {
  dpautSeri?: number;
  dpautFsol?: Date;
  dpautNdes?: number;
  dpautUsrs?: string;
  dpautUsra?: string;
  dpautFaut?: Date;
  dpautStat: number;
}

export type DispositivoData = {
  addispcode: number;
  addispnomb: string;
  addispusrn?: string;
  addipsapis: string;
  addispsrl1?: string;
  addispsrl2?: string;
  addispmrcb: number;
  addispstat: number;
  addispfreg: Date;
  addispfupt?: Date;
  addispusra?: string;
  addispusru?: string;

  nomUsuario: string;
};
