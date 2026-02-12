import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default auth; // Exporta directamente el middleware de NextAuth

// Middleware personalizado para bloquear acceso a /dashboard a usuarios tipo 2
export async function middleware(request: NextRequest) {
  const isStaticRequest = request.headers.get("x-nextjs-data");

  // Permitir solicitudes estáticas sin procesar
  if (isStaticRequest) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Solo evaluamos cuando se accede a rutas bajo /dashboard
  if (pathname.startsWith("/dashboard")) {
    try {
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
      const token = await getToken({ req: request as any, secret });

      // Si el token existe y el usuario es tipo 2, redirigir al depositador
      if ((token as any)?.tipo === 2) {
        const url = new URL("/depositador", request.url);
        return NextResponse.redirect(url);
      }
    } catch (err) {
      // En caso de error al leer token, simplemente permitir que NextAuth lo maneje
      console.error("Middleware getToken error:", err);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"], // Protege todas las rutas bajo "/dashboard"
};
