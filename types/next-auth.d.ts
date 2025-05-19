import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      codigoUsuario?: string;
      username?: string;
      token?: string;
      tipo?: number;
      status: number;
      message?: string;
    } & DefaultSession["user"];
    username?: string?;
  }

  interface User {
    role?: string;
    codigoUsuario?: string;
    username?: string;
    token?: string;
    status?: number;
    tipo?: number;
    message?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    codigoUsuario?: string;
    username?: string;
    token?: string;
    status?: number;
    tipo?: number;
    message?: number;
  }
}
