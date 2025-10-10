import Link from "next/link";
import { ReactNode } from "react";

import { DashboardNavLink } from "@/components/dashboard/NavLink";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { Logo } from "@/components/Logo";
import { requireUser } from "@/lib/auth";

const navigation = [
  { href: "/home", label: "Home" },
  { href: "/daily-check-in", label: "Check-in Diário" },
  { href: "/analytics", label: "Analytics" },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] bg-slate-950/80">
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-sm sm:px-6">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/home" className="flex items-center gap-3">
              <Logo size="sm" subtitle={`Olá, ${firstName}`} className="min-w-0" />
            </Link>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              <nav className="flex w-full items-center justify-start gap-2 overflow-x-auto rounded-2xl border border-slate-800/60 bg-slate-900/40 p-1 sm:w-auto sm:overflow-visible sm:rounded-none sm:border-none sm:bg-transparent sm:p-0">
                {navigation.map((item) => (
                  <DashboardNavLink key={item.href} href={item.href}>
                    {item.label}
                  </DashboardNavLink>
                ))}
              </nav>
              <LogoutButton className="w-full sm:w-auto sm:items-end sm:self-end" />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
