import type { HTMLAttributes } from "react";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type LogoSize = "sm" | "md" | "lg";

type LogoProps = {
  /**
   * Texto principal da marca. Padrão: "Sentinela".
   */
  title?: string;
  /**
   * Texto auxiliar exibido abaixo do título.
   */
  subtitle?: string;
  /**
   * Define o tamanho do ícone circular.
   */
  size?: LogoSize;
  /**
   * Alinhamento do texto em relação ao ícone.
   */
  align?: "left" | "center" | "right";
  /**
   * Define se o ícone e o texto ficam lado a lado ou empilhados.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Permite personalizar classes CSS adicionais no contêiner externo.
   */
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const SIZE_STYLES: Record<LogoSize, { circle: string; icon: string; title: string; subtitle: string; gap: string }> = {
  sm: {
    circle:
      "h-12 w-12 text-lg shadow-[0_20px_35px_rgba(56,189,248,0.25)]",
    icon: "h-6 w-6",
    title: "text-base",
    subtitle: "text-xs",
    gap: "gap-3",
  },
  md: {
    circle:
      "h-16 w-16 text-xl shadow-[0_22px_40px_rgba(56,189,248,0.28)]",
    icon: "h-8 w-8",
    title: "text-2xl",
    subtitle: "text-sm",
    gap: "gap-4",
  },
  lg: {
    circle:
      "h-24 w-24 text-3xl shadow-[0_30px_60px_rgba(56,189,248,0.25)]",
    icon: "h-12 w-12",
    title: "text-4xl",
    subtitle: "text-base",
    gap: "gap-6",
  },
};

export function Logo({
  title = "Sentinela",
  subtitle,
  size = "md",
  align = "left",
  orientation = "horizontal",
  className,
  ...props
}: LogoProps) {
  const direction =
    orientation === "vertical"
      ? "flex-col"
      : align === "right"
        ? "flex-row-reverse"
        : "flex-row";

  const containerAlignment =
    orientation === "vertical"
      ? align === "center"
        ? "items-center"
        : align === "right"
          ? "items-end"
          : "items-start"
      : "items-center";

  const sizeStyles = SIZE_STYLES[size];

  return (
    <div
      className={classNames(
        "flex text-white",
        direction,
        containerAlignment,
        sizeStyles.gap,
        className,
      )}
      {...props}
    >
      <span
        className={classNames(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          "bg-[radial-gradient(circle_at_25%_20%,_rgba(56,189,248,0.9),_rgba(99,102,241,0.95)_45%,_rgba(245,158,11,0.9)_95%)]",
          "before:absolute before:inset-0 before:bg-[radial-gradient(circle,_rgba(255,255,255,0.35),_transparent_65%)] before:opacity-60 before:mix-blend-screen",
          "after:absolute after:inset-0 after:rounded-full after:border after:border-white/20",
          sizeStyles.circle,
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 32 32"
          className={classNames("relative text-slate-900", sizeStyles.icon)}
        >
          <path
            d="M16 3.5c-2.36 1.08-4.76 1.63-7.21 1.63c-.78 0-1.42.63-1.42 1.41v8.14c0 5.62 3.45 10.7 8.63 12.77a1.2 1.2 0 0 0 .9 0c5.18-2.07 8.63-7.15 8.63-12.77V6.54c0-.78-.64-1.41-1.42-1.41c-2.45 0-4.85-.55-7.21-1.63a1.23 1.23 0 0 0-1.9 0Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M10.75 16.64l2.52-3.57a.9.9 0 0 1 1.49.07l1.2 1.96l1.08-1.56a.9.9 0 0 1 1.54.12l2.57 4.65a.7.7 0 0 1-.62 1.05H11.4a.7.7 0 0 1-.65-1.07Z"
            fill="#fef3c7"
          />
          <path
            d="M12.7 16.78l1.13-1.6c.15-.21.44-.19.57.04l1.32 2.2l1.62-2.36c.18-.26.56-.22.69.07l1.22 2.75"
            stroke="#1f2937"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.4"
          />
        </svg>
      </span>
      <div
        className={classNames(
          "flex min-w-0 flex-col",
          align === "center"
            ? "items-center"
            : align === "right"
              ? "items-end"
              : "items-start",
        )}
      >
        <span
          className={classNames(
            "font-semibold tracking-tight text-white drop-shadow-[0_2px_6px_rgba(8,47,73,0.35)]",
            sizeStyles.title,
          )}
        >
          {title}
        </span>
        {subtitle ? (
          <span
            className={classNames(
              "text-slate-200/80",
              sizeStyles.subtitle,
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default Logo;
