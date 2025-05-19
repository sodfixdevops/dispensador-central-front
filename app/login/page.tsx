"use client";
import Link from "next/link";
import { UserCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Input from "../ui/componentes/Input";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthError } from "next-auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importar el estilo
import { loginAction } from "../lib/actions";

export default function LoginPage() {
  const router = useRouter();
  const [username, setNombreUsuario] = useState<string>("");
  const [password, setPassUsuario] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(password);
    const responseNextAuth = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (responseNextAuth?.error) {
      console.log(responseNextAuth.error, responseNextAuth);

      toast.error(responseNextAuth.error, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    router.push("/dashboard");
    /*try {
    } catch (error) {
      console.log("Salte a error");
      if (error instanceof AuthError) {
        return { error: error.cause?.err?.message };
      }
      return { error: "error 500" };
    }*/
  };

  return (
    <div className="min-h-screen grid place-content-center bg-slate-500">
      <div
        className="w-96 shadow-xl mx-auto text-white bg-clip-padding
            backdrop-filter bg-white bg-opacity-10 backdrop-blur-md mt-20 py-10 px-8 rounded-md"
      >
        <div className="text-center text-2xl">Login</div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 md:p-6 rounded-md">
            {/*Usuario*/}
            <div className="mb-8">
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold font-sans"
              >
                Usuario:
              </label>
              <div className="relative">
                <div>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Ingrese Nickname/email"
                    type="text"
                    onChange={(e) => setNombreUsuario(e.target.value)}
                  />
                  <UserCircleIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] 
                                    -translate-y-1/2 text-gray-700 peer-focus:text-gray-900"
                  />
                </div>
              </div>
            </div>
            {/*Contraseña*/}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold font-sans"
              >
                Contraseña:
              </label>
              <div className="relative">
                <div>
                  <Input
                    id="password"
                    name="password"
                    placeholder="Ingrese contraseña"
                    type="password"
                    onChange={(e) => setPassUsuario(e.target.value)}
                  />
                  <LockClosedIcon
                    className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] 
                                    -translate-y-1/2 text-gray-700 peer-focus:text-gray-900"
                  />
                </div>
              </div>
            </div>
            {error && <label>{error}</label>}
            {/*Contraseña*/}
            <div>
              <button
                className="mt-1 bg-white bg-opacity-30 hover:bg-opacity-40 transition duration-500 
                            rounded-md shadow-sm p-3 w-full font-semibold"
                type="submit"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
