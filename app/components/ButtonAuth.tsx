"use client";

import { signIn, useSession } from "next-auth/react";
import { cerrarSesionControlada } from "@/app/lib/session-control-client";

export default function ButtonAuth() {
  const { data: session, status } = useSession();
  console.log({ session, status });
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <button
          onClick={() => cerrarSesionControlada("/login")}
          className="btn btn-danger"
        >
          Sign out
        </button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()} className="btn btn-primary">
        Sign in
      </button>
    </>
  );
}
