import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export default auth; // Exporta directamente el middleware

export function middleware(request: NextRequest) {
  // Si la solicitud proviene de una página que ya está generada estáticamente, podemos bloquear el fetch
  // Aquí podemos identificar solicitudes del cliente o del servidor
  const isStaticRequest = request.headers.get("x-nextjs-data");

  if (isStaticRequest) {
    // No ejecutar `fetch` o evitar ciertas acciones si la solicitud es estática o prerenderizada
    return NextResponse.next();
  }

  // Si no es estática, permitimos que la solicitud continúe
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard"], // Protege todas las rutas bajo "/dashboard"
};
//console.log(`asdsad ${config}`);
