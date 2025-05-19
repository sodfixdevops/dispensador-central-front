"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const SignInPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      console.error("Error signing in:", result.error);
    } else {
      // Redirigir a la página deseada tras un inicio de sesión exitoso
      window.location.href = "/"; // o la ruta a la que quieras redirigir
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
};

export default SignInPage;
