import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { DashboardNavLink } from "@/components/dashboard/NavLink";
import { ReactNode } from "react";

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

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr] bg-slate-950/80">
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-sm">
          <Link href="/home" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-amber-400 text-lg font-semibold text-slate-950 shadow-lg shadow-amber-500/30">
              S
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold text-slate-50">Sentinela</p>
              <p className="text-xs text-slate-300">Olá, {user.name}</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            {navigation.map((item) => (
              <DashboardNavLink key={item.href} href={item.href}>
                {item.label}
              </DashboardNavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
