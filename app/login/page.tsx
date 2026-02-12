"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

import Input from "../ui/componentes/Input";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();

  const [username, setNombreUsuario] = useState("");
  const [password, setPassUsuario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const responseNextAuth = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    // 🔴 VALIDACIÓN CORRECTA
    if (responseNextAuth?.error) {
      setError("Usuario o contraseña incorrectos.");

      setTimeout(() => {
        setError(null);
      }, 3000);

      return;
    }

    // Obtener sesión actualizada y redireccionar según tipo
    try {
      const session = await getSession();
      const tipo = (session as any)?.user?.tipo;

      if (tipo === 2) {
        router.push("/depositador");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      // Fallback
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002B76] to-[#024FD6] relative py-6 sm:py-8">
      {/* Version */}
      <div className="absolute left-3 top-3 text-white/90 text-sm font-medium select-none">
        v26.0.0
      </div>
      {/* Top-right logo */}
      <img
        src="/images/imagenesbcp/Original-pastilla-Dark.svg"
        alt="BCP logo"
        className="absolute top-3 right-6 h-8 sm:h-12 lg:h-14 w-auto z-50 pointer-events-none"
      />
      <div className="max-w-6xl w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 sm:gap-8 lg:gap-16 [@media(max-height:500px)]:grid-cols-2 [@media(max-height:500px)]:gap-4">
          {/* Title */}
          <div className="text-center lg:text-left lg:pl-6 [@media(max-height:500px)]:text-left [@media(max-height:500px)]:pl-2">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight [@media(max-height:500px)]:text-2xl">
              Dispensador
            </h1>
            <p className="mt-2 text-sm sm:text-base lg:text-xl text-[#F26E29] font-semibold [@media(max-height:500px)]:text-xs">
              Sistema de Gestión de Efectivo
            </p>
          </div>

          {/* Form */}
          <div className="w-full max-w-md sm:max-w-xl mx-auto lg:mx-0 [@media(max-height:500px)]:max-w-none">
            <div className="bg-white/95 shadow-2xl rounded-lg p-6 sm:p-8 [@media(max-height:500px)]:p-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 sm:space-y-6 [@media(max-height:500px)]:space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Usuario
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Ingrese Nickname/email"
                        value={username}
                        disabled={loading}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                        className="peer block w-full rounded-md border border-gray-200 py-2.5 sm:py-3 pl-10 sm:pl-12 text-base sm:text-lg placeholder:text-gray-400 text-gray-800 bg-white [@media(max-height:500px)]:py-2"
                      />
                      <UserCircleIcon className="pointer-events-none absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="Ingrese contraseña"
                        value={password}
                        disabled={loading}
                        onChange={(e) => setPassUsuario(e.target.value)}
                        className="peer block w-full rounded-md border border-gray-200 py-2.5 sm:py-3 pl-10 sm:pl-12 text-base sm:text-lg placeholder:text-gray-400 text-gray-800 bg-white [@media(max-height:500px)]:py-2"
                      />
                      <LockClosedIcon className="pointer-events-none absolute left-3 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50/80 px-3 py-2 text-sm text-red-600 text-center">
                      {error}
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full rounded-md py-2.5 sm:py-3 text-base sm:text-lg font-semibold transition [@media(max-height:500px)]:py-2 ${
                        loading
                          ? "bg-[#F26E29]/60 cursor-not-allowed text-white"
                          : "bg-[#F26E29] hover:bg-[#d65a22] text-white"
                      }`}
                    >
                      {loading && (
                        <span className="h-5 w-5 animate-spin inline-block mr-2 rounded-full border-2 border-white border-t-transparent"></span>
                      )}
                      {loading ? "Conectando..." : "INGRESAR"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer derechos reservados - siempre fijo al fondo de la ventana */}
      <footer className="fixed left-0 right-0 bottom-2 sm:bottom-4 pointer-events-none z-20">
        <div className="max-w-full text-center mx-auto text-white/80 text-sm px-4 py-2">
          © 2026 Banco de Crédito del Perú. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
