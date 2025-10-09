"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CheckInSuccessToastProps = {
  message: string;
  duration?: number;
};

export function CheckInSuccessToast({ message, duration = 4000 }: CheckInSuccessToastProps) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(false);
      router.replace("/home", { scroll: false });
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [duration, router]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-emerald-400/40 bg-slate-950/90 px-4 py-3 text-sm text-emerald-100 shadow-xl shadow-emerald-500/20">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-semibold text-emerald-300">
          ✓
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-100">Check-in registrado</p>
          <p className="text-xs text-slate-300">{message}</p>
        </div>
      </div>
    </div>
  );
}

