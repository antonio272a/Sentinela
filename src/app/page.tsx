import type { Metadata } from "next";
import { AuthPageShell } from "./(auth)/layout";
import { LoginForm } from "./(auth)/_components/LoginForm";

export const metadata: Metadata = {
  title: "Sentinela — Acesse sua conta",
  description: "Faça login para monitorar seus ambientes com o Sentinela.",
};

export default function LoginPage() {
  return (
    <AuthPageShell>
      <LoginForm />
    </AuthPageShell>
  );
}
