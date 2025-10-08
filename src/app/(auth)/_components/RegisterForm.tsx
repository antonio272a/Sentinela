"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { calculateAgeFromBirthDate } from "@/lib/date";

interface FormState {
  name: string;
  birthDate: string;
  email: string;
  password: string;
}

interface VerificationDetails {
  email: string;
  sentAt: string | null;
  resendAvailableAt: string;
  resendIntervalMs: number;
}

type ApiError = Error & { details?: unknown };

const INITIAL_STATE: FormState = {
  name: "",
  birthDate: "",
  email: "",
  password: "",
};

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function parseApiError(response: Response, fallbackMessage: string) {
  return response
    .json()
    .catch(() => ({ message: fallbackMessage }))
    .then((errorBody) => ({
      message: errorBody?.message ?? fallbackMessage,
      details: errorBody,
    }));
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
    const error = await parseApiError(response, "Não foi possível criar conta.");
    const apiError = new Error(error.message) as ApiError;
    apiError.details = error.details;
    throw apiError;
  }

  return (await response.json()) as { message: string; verification: VerificationDetails };
}

async function verifyCodeRequest(payload: { email: string; code: string }) {
  const response = await fetch("/api/auth/register/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await parseApiError(response, "Não foi possível validar o código informado.");
    const apiError = new Error(error.message) as ApiError;
    apiError.details = error.details;
    throw apiError;
  }

  return response.json();
}

async function resendCodeRequest(payload: { email: string }) {
  const response = await fetch("/api/auth/register/resend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({ message: "Não foi possível reenviar o código." }));

  if (!response.ok) {
    const error = new Error(body?.message ?? "Não foi possível reenviar o código.") as ApiError;
    error.details = body;
    throw error;
  }

  return body as { message: string; verification: VerificationDetails };
}

function formatCountdown(ms: number) {
  if (ms <= 0) {
    return "00:00";
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function RegisterForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!verificationDetails) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, [verificationDetails]);

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

  const resendRemainingMs = useMemo(() => {
    if (!verificationDetails) {
      return 0;
    }

    const availableTime = new Date(verificationDetails.resendAvailableAt).getTime();

    if (Number.isNaN(availableTime)) {
      return 0;
    }

    return Math.max(0, availableTime - now);
  }, [verificationDetails, now]);

  const canResend = resendRemainingMs <= 0;
  const resendCountdown = useMemo(() => formatCountdown(resendRemainingMs), [resendRemainingMs]);

  const headerTitle = step === "verify" ? "Confirme seu e-mail" : "Crie sua conta Sentinela";
  const headerDescription = step === "verify"
    ? `Enviamos um código de verificação para ${verificationDetails?.email ?? "o e-mail informado"}.`
    : "Preencha os dados abaixo para iniciar seu monitoramento inteligente.";

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
      const response = await registerRequest({
        name: form.name.trim(),
        birthDate: form.birthDate,
        email: form.email.toLowerCase(),
        password: form.password,
      });

      setVerificationDetails(response.verification);
      setVerificationCode("");
      setSuccess(response.message);
      setStep("verify");
      setForm(INITIAL_STATE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!verificationDetails) {
      setError("Não encontramos uma solicitação de verificação.");
      return;
    }

    if (!verificationCode.trim()) {
      setError("Informe o código recebido por e-mail.");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyCodeRequest({ email: verificationDetails.email, code: verificationCode.trim() });
      setSuccess("Conta confirmada com sucesso! Redirecionando para o painel...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível validar o código informado.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!verificationDetails || !canResend) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const response = await resendCodeRequest({ email: verificationDetails.email });
      setVerificationDetails(response.verification);
      setSuccess(response.message);
    } catch (err) {
      const apiError = err as ApiError;
      const details = apiError.details as { verification?: VerificationDetails } | undefined;

      if (details?.verification) {
        setVerificationDetails(details.verification);
      }

      setError(apiError.message ?? "Não foi possível reenviar o código.");
    } finally {
      setIsResending(false);
    }
  };

  const handleEditInformation = () => {
    setStep("form");
    setError(null);
    setSuccess(null);
    setVerificationCode("");
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
      <header className="space-y-2 text-left">
        <h2 className="text-3xl font-semibold text-white">{headerTitle}</h2>
        <p className="text-sm text-slate-300">{headerDescription}</p>
      </header>

      {step === "form" ? (
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
            {!isEmailValid && <p className="text-xs text-red-200">Informe um e-mail válido.</p>}
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
            {passwordErrorMessage ? <p className="text-xs text-red-200">{passwordErrorMessage}</p> : null}
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
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleVerifySubmit} noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="verificationCode">
              Código de verificação
            </label>
            <input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              className="w-full rounded-xl border border-white/10 bg-[#090f1f]/70 px-4 py-3 text-center text-lg font-semibold tracking-[0.5em] text-white outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/40"
              placeholder="000000"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ""))}
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
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isVerifying}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isVerifying ? "Validando..." : "Confirmar código"}
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className="flex w-full items-center justify-center rounded-xl border border-emerald-300/40 px-4 py-3 text-sm font-semibold text-emerald-200 transition focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isResending
                ? "Reenviando..."
                : canResend
                ? "Reenviar código"
                : `Reenviar em ${resendCountdown}`}
            </button>
          </div>
          <p className="text-center text-xs text-slate-300">
            Informações incorretas?{" "}
            <button
              type="button"
              onClick={handleEditInformation}
              className="font-semibold text-emerald-200 hover:text-emerald-100"
            >
              Voltar e ajustar cadastro
            </button>
          </p>
        </form>
      )}

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
