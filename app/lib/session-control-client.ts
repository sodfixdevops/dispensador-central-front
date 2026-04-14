"use client";

import { getSession, signOut } from "next-auth/react";

export async function enviarHeartbeatSesion(
  liacsseri: number | undefined,
  userId: string,
): Promise<{
  success: boolean;
  active: boolean;
  mrcb?: number;
  liacsseri?: number;
}> {
  try {
    const resp = await fetch(`/api/session/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liacsseri, userId }),
      cache: "no-store",
    });

    if (!resp.ok) return { success: false, active: false };
    return await resp.json();
  } catch {
    return { success: false, active: true };
  }
}

export async function cerrarSesionControlada(callbackUrl = "/login") {
  try {
    const session = await getSession();
    const liacsseri = (session?.user as any)?.liacsseri;
    const userId = session?.user?.id;

    if (userId) {
      await fetch(`/api/session/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liacsseri, userId }),
        cache: "no-store",
        keepalive: true,
      });
    }
  } catch (error) {
    console.error("No se pudo notificar logout al backend:", error);
  } finally {
    await signOut({ callbackUrl });
  }
}
