import type { ReactNode } from "react";

type Accent = "primary" | "success" | "alert" | "info";

const accentGradients: Record<Accent, string> = {
  primary: "from-[#f6c46d]/70 via-[#f6c46d]/0 to-transparent",
  success: "from-[#5dd39e]/70 via-[#5dd39e]/0 to-transparent",
  alert: "from-[#ff8c6a]/70 via-[#ff8c6a]/0 to-transparent",
  info: "from-[#7cb8ff]/70 via-[#7cb8ff]/0 to-transparent",
};

export type CardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  accent?: Accent;
  highlight?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Card({
  title,
  description,
  icon,
  accent = "primary",
  highlight,
  actions,
  children,
  className,
}: CardProps) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_30px_90px_-60px_rgba(8,22,48,0.9)] backdrop-blur-xl transition hover:border-white/30 hover:shadow-[0_32px_100px_-60px_rgba(246,196,109,0.45)] ${className ?? ""}`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${accentGradients[accent]}`}
        aria-hidden
      />
      <div className="flex items-start gap-4">
        {icon ? (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl text-[var(--color-primary)] shadow-[0_10px_30px_-20px_rgba(246,196,109,0.9)]">
            {icon}
          </span>
        ) : null}
        <div className="flex-1 space-y-2">
          {highlight ? (
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {highlight}
            </span>
          ) : null}
          <h3 className="text-lg font-semibold text-white/95 sm:text-xl">{title}</h3>
          {description ? (
            <p className="text-sm text-[var(--color-text-muted)] sm:text-base">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-6 space-y-4 text-sm text-[var(--color-text-muted)]">{children}</div> : null}
      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </article>
  );
}
