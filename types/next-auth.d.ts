// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    username?: string;
    token?: string;
    tipo?: number;
    status?: number;
    message?: string;
    dispositivo?: {
      codigo: number;
      descripcion: string;
      api_url: string;
    };
  }

  interface Session {
    user: User;
  }
}

interface Session {
  user: {
    id: string;
    username?: string;
    token?: string;
    tipo?: number;
    status?: number;
    message?: string;
  } & DefaultSession["user"];
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    token?: string;
    tipo?: number;
    status?: number;
    message?: string;
    dispositivo?: {
      codigo: number;
      descripcion: string;
      api_url: string;
    };
  }
}
