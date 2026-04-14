import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { loginUsuario } from "@/app/lib/aduser-actions";

// Validación del formulario
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      async authorize(credentials, _req) {
        console.log("JUSTO AQUI A");

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { username, password } = parsed.data;

        console.log("JUSTO AQUI B");

        const result = await loginUsuario(username, password);

        console.log("JUSTO AQUI D", result);

        // 🔴 CREDENCIALES INCORRECTAS → return null
        if (result.status !== 200 || !result.token) {
          return null;
        }

        // ✅ LOGIN CORRECTO
        return {
          id: result.id,
          username: result.username,
          token: result.token,
          tipo: result.tipo,
          status: result.status,
          message: result.message,
          dispositivo: result.dispositivo,
          dispositivos: result.dispositivos,
          liacsseri: result.liacsseri,
        };
      },
    }),
  ],

  trustHost: true,

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas (timeout absoluto)
  },

  jwt: {
    maxAge: 8 * 60 * 60, // 8 horas (timeout absoluto)
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      // Permite rutas internas como "/login"
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Permite redirecciones al mismo origen
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Fallback seguro
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.username = user.username;
        token.token = user.token;
        token.tipo = user.tipo;
        token.status = user.status;
        token.message = user.message;
        token.dispositivo = user.dispositivo;
        token.dispositivos = (user as any).dispositivos;
        token.liacsseri = (user as any).liacsseri;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.username = token.username as string;
      session.user.token = token.token as string;
      session.user.tipo = token.tipo as number;
      session.user.status = token.status as number;
      session.user.message = token.message as string;
      session.user.dispositivo = token.dispositivo as any;
      (session.user as any).dispositivos = token.dispositivos as any;
      (session.user as any).liacsseri = token.liacsseri as number;

      return session;
    },
  },

  events: {
    async signOut(message) {
      try {
        const token = (message as any)?.token;
        const userId = token?.id as string | undefined;
        const liacsseri = token?.liacsseri as number | undefined;
        if (!userId) return;

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/aduser/session/logout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ liacsseri, userId }),
            cache: "no-store",
          },
        );
      } catch (error) {
        console.error("No se pudo cerrar liacs en signOut event:", error);
      }
    },
  },
});
