"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

  if (!visible || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10"
      onClick={() => setVisible(false)}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-emerald-400/40 bg-slate-950/95 p-6 text-slate-100 shadow-2xl shadow-emerald-500/30"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xl font-semibold text-emerald-300">
            ✓
          </div>
          <div className="space-y-2 text-sm">
            <h2 className="text-base font-semibold text-emerald-100">Check-in registrado</h2>
            <p className="text-xs leading-relaxed text-slate-200">{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
        >
          Entendi
        </button>
      </div>
    </div>,
    document.body
  );
}

