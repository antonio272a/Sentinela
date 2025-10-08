"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function loginRequest(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Não foi possível entrar." }));
    throw new Error(error.message ?? "Não foi possível entrar.");
  }

  return response.json();
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Informe e-mail e senha para continuar.");
      return;
    }

    setIsLoading(true);
    try {
      await loginRequest(email, password);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
      <header className="space-y-2 text-left">
        <h2 className="text-3xl font-semibold text-white">Acesse o Sentinela</h2>
        <p className="text-sm text-slate-300">
          Informe suas credenciais para acompanhar seus indicadores de segurança em tempo real.
        </p>
      </header>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="email">
            E-mail institucional
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            placeholder="nome@empresa.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-slate-200">
            <label htmlFor="password">Senha</label>
            <button type="button" className="text-emerald-300 hover:text-emerald-200">
              Esqueci a senha
            </button>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            placeholder="Digite sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <footer className="mt-8 text-center text-sm text-slate-300">
        Ainda não possui conta?{" "}
        <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
          Criar conta
        </Link>
      </footer>
    </div>
  );
}

export default LoginForm;
