"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Option = {
  value: string;
  label: string;
};

type DailyCheckInDateSelectorProps = {
  options: Option[];
  selected: string;
};

export function DailyCheckInDateSelector({
  options,
  selected,
}: DailyCheckInDateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-2 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      value={selected}
      onChange={(event) => {
        const newValue = event.target.value;
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("error");
          if (newValue) {
            params.set("date", newValue);
          } else {
            params.delete("date");
          }

          const query = params.toString();
          const url = query ? `/daily-check-in?${query}` : "/daily-check-in";
          router.replace(url);
        });
      }}
      disabled={isPending}
      aria-label="Selecione a data do check-in"
      aria-busy={isPending}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
