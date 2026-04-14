import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Middleware para proteger dashboard y redirigir segun tipo de usuario
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const blockedDashboardRoutes = [
    "/dashboard/recolectar",
    "/dashboard/autorizaciones",
  ];
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isDepositadorRoute = pathname.startsWith("/depositador");
  const isRecolectorRoute = pathname.startsWith("/recolector");
  const isProtectedRoute =
    isDashboardRoute || isDepositadorRoute || isRecolectorRoute;

  if (isProtectedRoute) {
    try {
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
      const token = await getToken({ req: request as any, secret });

      // Sin sesion/token no se permite acceso a rutas protegidas
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const tipoUsuario = Number((token as any)?.tipo);

      if (isDashboardRoute) {
        // Usuario tipo 2 no entra al dashboard, va al flujo depositador
        if (tipoUsuario === 2) {
          return NextResponse.redirect(new URL("/depositador", request.url));
        }
        // Usuario tipo 3 no entra al dashboard, va al flujo recolector
        if (tipoUsuario === 3) {
          return NextResponse.redirect(new URL("/recolector", request.url));
        }

        // Flujo temporalmente deshabilitado por negocio
        if (
          blockedDashboardRoutes.some(
            (route) => pathname === route || pathname.startsWith(`${route}/`),
          )
        ) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      if (isDepositadorRoute && tipoUsuario !== 2) {
        const fallback = tipoUsuario === 3 ? "/recolector" : "/dashboard";
        return NextResponse.redirect(new URL(fallback, request.url));
      }

      if (isRecolectorRoute && tipoUsuario !== 3) {
        const fallback = tipoUsuario === 2 ? "/depositador" : "/dashboard";
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    } catch (err) {
      console.error("Middleware getToken error:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/depositador/:path*",
    "/depositador",
    "/recolector/:path*",
    "/recolector",
  ],
};
