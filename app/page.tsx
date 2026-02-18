import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="w-full max-w-3xl text-center">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logobcp.png"
            width={240}
            height={80}
            alt="BCP Logo"
            priority
          />
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-[#003DA5] mb-4">
          Bienvenido a Dispensador Central
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          Administra y monitorea tus dispensadores de billetes de forma segura y
          centralizada.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-[#003DA5] px-6 py-3 text-white font-semibold hover:bg-[#002B80] transition"
          >
            Ingresar
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-md border border-[#003DA5] px-6 py-3 text-[#003DA5] font-semibold hover:bg-[#f5f9ff] transition"
          >
            Acceder al panel
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          ¿Necesitas ayuda? Contacta al equipo técnico de tu institución.
        </p>
      </div>
    </main>
  );
}
