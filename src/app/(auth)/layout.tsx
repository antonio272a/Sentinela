import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

const highlights = [
  "Monitoramento contínuo",
  "Alertas proativos",
];

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.45),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(20,184,166,0.35),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-36 top-10 hidden h-96 w-96 rounded-full bg-[#38bdf8]/40 blur-3xl lg:block" />
      <div className="pointer-events-none absolute -bottom-24 right-[-120px] hidden h-[420px] w-[420px] rounded-full bg-[#6366f1]/30 blur-[180px] lg:block" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
        <aside className="mb-12 max-w-xl lg:mb-0 lg:w-[55%]">
          <Logo
            size="lg"
            orientation="vertical"
            subtitle="A plataforma inteligente para a gestão da saúde mental e conformidade corporativa"
            className="mb-8 max-w-sm"
          />
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Sentinela em destaque
          </Link>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Vigilância inteligente para proteger o que importa.
          </h1>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Acompanhe ambientes críticos, identifique riscos em tempo real e tome decisões com segurança graças ao painel integrado do Sentinela.
          </p>
          <ul className="mt-8 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
            {highlights.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 backdrop-blur sm:justify-start"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </aside>
        <main className="w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthPageShell>{children}</AuthPageShell>;
}
