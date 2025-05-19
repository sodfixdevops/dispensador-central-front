import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginUserResponse } from "./app/lib/definitions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: {
          label: "username",
          type: "text",
        },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/usuarios/login`,
          {
            method: "POST",
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
            headers: { "Content-Type": "application/json" },
          }
        );

        const resp = await res.json();
        console.log(">>", resp);

        if (resp.status == 401) {
          throw new Error(resp.message);
        }
        //const user: LoginUserResponse = resp;
        //const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
        const user: User = {
          username: resp.username,
          token: resp.token,
          status: resp.status,
          codigoUsuario: resp.codigoUsuario,
        };
        return user;
      },
    }),
  ],
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    //error: "/login?error=CredentialsSignin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        //token.username = user.username;
        token.username = user.username;
        token.token = user.token;
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = token as any;
        //session.user.token = token.token;
      }
      return session;
    },
  },
});
