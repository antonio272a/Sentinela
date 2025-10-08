"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function DashboardNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
        active
          ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/40"
          : "text-slate-200 hover:bg-slate-800/70"
      }`}
    >
      {children}
    </Link>
  );
}
