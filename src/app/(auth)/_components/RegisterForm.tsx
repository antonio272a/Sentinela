"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { calculateAgeFromBirthDate } from "@/lib/date";

interface FormState {
  name: string;
  birthDate: string;
  email: string;
  password: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  birthDate: "",
  email: "",
  password: "",
};

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

async function registerRequest(payload: { name: string; birthDate: string; email: string; password: string }) {
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
  const birthDateErrorMessage = useMemo(() => {
    if (!form.birthDate) {
      return null;
    }

    const age = calculateAgeFromBirthDate(form.birthDate);

    if (age === null) {
      return "Informe uma data de nascimento válida.";
    }

    if (age < 18) {
      return "Usuários precisam ter ao menos 18 anos.";
    }

    return null;
  }, [form.birthDate]);

  const passwordErrorMessage = useMemo(() => {
    if (!form.password) {
      return null;
    }

    if (form.password.length < 8) {
      return "A senha deve ter ao menos 8 caracteres.";
    }

    return null;
  }, [form.password]);

  const maxBirthDate = useMemo(() => {
    const today = new Date();
    const reference = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
    return reference.toISOString().slice(0, 10);
  }, []);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.birthDate || !form.email || !form.password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!isEmailValid) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (birthDateErrorMessage) {
      setError(birthDateErrorMessage);
      return;
    }

    if (passwordErrorMessage) {
      setError(passwordErrorMessage);
      return;
    }

    setIsLoading(true);
    try {
      await registerRequest({
        name: form.name.trim(),
        birthDate: form.birthDate,
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
          <label className="text-sm font-medium text-slate-200" htmlFor="birthDate">
            Data de nascimento
          </label>
          <input
            id="birthDate"
            type="date"
            autoComplete="bday"
            max={maxBirthDate}
            className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
            value={form.birthDate}
            onChange={handleChange("birthDate")}
            required
          />
          {birthDateErrorMessage ? (
            <p className="text-xs text-red-200">{birthDateErrorMessage}</p>
          ) : null}
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
          {passwordErrorMessage ? (
            <p className="text-xs text-red-200">{passwordErrorMessage}</p>
          ) : null}
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
