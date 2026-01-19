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

      return session;
    },
  },
});
