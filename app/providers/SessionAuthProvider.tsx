"use client";
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import {
  cerrarSesionControlada,
  enviarHeartbeatSesion,
} from "@/app/lib/session-control-client";

interface Props {
  children: React.ReactNode;
}

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const HEARTBEAT_MS = 30 * 1000;
const SESSION_START_KEY = "session-start-ms";

function SessionTimeoutGuard({ children }: Props) {
  const { data: session, status } = useSession();
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const signingOutRef = useRef(false);
  const liacsRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      signingOutRef.current = false;
      return;
    }

    const userId = session.user.id;
    const tipoUsuario = Number((session.user as any)?.tipo);
    const omitirTimeoutCliente = tipoUsuario === 3;
    const liacsseri = (session.user as any)?.liacsseri as number | undefined;
    liacsRef.current = liacsseri;

    const now = Date.now();
    const storageValue = sessionStorage.getItem(SESSION_START_KEY);
    const parsedValue = storageValue ? Number(storageValue) : NaN;

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      sessionStartRef.current = parsedValue;
    } else {
      sessionStartRef.current = now;
      sessionStorage.setItem(SESSION_START_KEY, String(now));
    }

    lastActivityRef.current = now;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    for (const eventName of events) {
      window.addEventListener(eventName, markActivity, { passive: true });
    }

    const intervalId = window.setInterval(async () => {
      if (signingOutRef.current) return;

      const ts = Date.now();
      const idleExpired = ts - lastActivityRef.current >= IDLE_TIMEOUT_MS;
      const absoluteExpired =
        ts - sessionStartRef.current >= ABSOLUTE_TIMEOUT_MS;

      if (!omitirTimeoutCliente && (idleExpired || absoluteExpired)) {
        signingOutRef.current = true;
        sessionStorage.removeItem(SESSION_START_KEY);
        await cerrarSesionControlada("/login");
        return;
      }

      const hb = await enviarHeartbeatSesion(liacsRef.current, userId);
      if (hb.liacsseri) {
        liacsRef.current = hb.liacsseri;
      }
      if (hb.success && !hb.active) {
        signingOutRef.current = true;
        sessionStorage.removeItem(SESSION_START_KEY);
        await cerrarSesionControlada("/login");
      }
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(intervalId);
      for (const eventName of events) {
        window.removeEventListener(eventName, markActivity);
      }
    };
  }, [
    status,
    session?.user?.id,
    (session?.user as any)?.liacsseri,
    (session?.user as any)?.tipo,
  ]);

  return <>{children}</>;
}

const SessionAuthProvider = ({ children }: Props) => {
  return (
    <SessionProvider>
      <SessionTimeoutGuard>{children}</SessionTimeoutGuard>
    </SessionProvider>
  );
};
export default SessionAuthProvider;
