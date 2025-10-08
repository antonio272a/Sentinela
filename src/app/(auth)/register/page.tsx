import type { Metadata } from "next";
import { RegisterForm } from "../_components/RegisterForm";

export const metadata: Metadata = {
  title: "Sentinela — Criar conta",
  description: "Cadastre-se para começar a monitorar com o Sentinela.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
