"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface FormState {
  name: string;
  age: string;
  email: string;
  password: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  age: "",
  email: "",
  password: "",
};

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

async function registerRequest(payload: { name: string; age: number; email: string; password: string }) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Não foi possível criar conta." }));
    throw new Error(error.message ?? "Não foi possível criar conta.");
  }

  return response.json();
}

export function RegisterForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = useMemo(() => !form.email || validateEmail(form.email), [form.email]);
  const isAgeValid = useMemo(() => !form.age || Number.parseInt(form.age, 10) >= 18, [form.age]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.age || !form.email || !form.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!isEmailValid) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (!isAgeValid) {
      setError("Usuários precisam ter ao menos 18 anos.");
      return;
    }

    const age = Number.parseInt(form.age, 10);

    setIsLoading(true);
    try {
      await registerRequest({
        name: form.name.trim(),
        age,
        email: form.email.toLowerCase(),
        password: form.password,
      });
      setSuccess("Conta criada com sucesso! Você já pode acessar o painel.");
      setForm(INITIAL_STATE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
      <header className="space-y-2 text-left">
        <h2 className="text-3xl font-semibold text-white">Crie sua conta Sentinela</h2>
        <p className="text-sm text-slate-300">
          Preencha os dados abaixo para iniciar seu monitoramento inteligente.
        </p>
      </header>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="name">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            placeholder="Como prefere ser chamado?"
            value={form.name}
            onChange={handleChange("name")}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="age">
            Idade
          </label>
          <input
            id="age"
            type="number"
            min={18}
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            placeholder="Informe sua idade"
            value={form.age}
            onChange={handleChange("age")}
            required
          />
          {!isAgeValid && (
            <p className="text-xs text-red-200">Usuários precisam ter ao menos 18 anos.</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            placeholder="nome@empresa.com"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
          {!isEmailValid && (
            <p className="text-xs text-red-200">Informe um e-mail válido.</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            placeholder="Crie uma senha segura"
            value={form.password}
            onChange={handleChange("password")}
            required
          />
        </div>
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        ) : null}
        {success ? (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Enviando..." : "Criar conta"}
        </button>
      </form>
      <footer className="mt-8 text-center text-sm text-slate-300">
        Já possui acesso?{" "}
        <Link href="/" className="font-medium text-emerald-300 hover:text-emerald-200">
          Fazer login
        </Link>
      </footer>
    </div>
  );
}

export default RegisterForm;
