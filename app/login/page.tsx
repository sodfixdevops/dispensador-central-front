"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-content-center bg-sky-600">
      <div className="w-96 shadow-xl mx-auto text-gray-100 bg-clip-padding backdrop-filter bg-white bg-opacity-10 backdrop-blur-md mt-20 py-10 px-8 rounded-md">
        <div className="text-center text-2xl mb-6">INGRESO A SISTEMA</div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 md:p-6 rounded-md">
            {/* Usuario */}
            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold">
                Usuario:
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ingrese Nickname/email"
                  value={username}
                  disabled={loading}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                />

                <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-700" />
              </div>
            </div>

            {/* Contraseña */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold">
                Contraseña:
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="Ingrese contraseña"
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassUsuario(e.target.value)}
                />

                <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-700" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 animate-fade-in rounded-md bg-red-50/70 px-3 py-2 text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-1 w-full rounded-md p-3 font-semibold transition
              flex items-center justify-center gap-2
              ${
                loading
                  ? "bg-white/20 cursor-not-allowed"
                  : "bg-white bg-opacity-30 hover:bg-opacity-40"
              }`}
            >
              {loading && (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              )}
              {loading ? "Conectando..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
