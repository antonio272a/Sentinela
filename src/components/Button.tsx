import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsAnchor = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const baseStyles =
  "group inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60";

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-[#f6c46d] via-[#f5b451] to-[#f1a63f] text-[#0a152e] shadow-[0_18px_40px_-24px_rgba(246,196,109,0.9)] hover:shadow-[0_24px_48px_-18px_rgba(246,196,109,0.75)] hover:-translate-y-[1px] active:translate-y-0",
  secondary:
    "border border-white/20 bg-white/10 text-white/95 hover:bg-white/16 hover:border-white/30 hover:-translate-y-[1px]",
  ghost:
    "text-white/80 hover:text-white hover:bg-white/8 hover:-translate-y-[1px]",
};

function classNames(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    icon,
    iconPosition = "start",
    className,
    children,
    href,
    ...rest
  } = props as ButtonProps & { href?: string };

  const content = (
    <span className="flex items-center gap-2">
      {icon && iconPosition === "start" ? (
        <span className="text-lg text-current opacity-90">{icon}</span>
      ) : null}
      <span className="whitespace-nowrap">{children}</span>
      {icon && iconPosition === "end" ? (
        <span className="text-lg text-current opacity-90">{icon}</span>
      ) : null}
    </span>
  );

  if (href) {
    const { target, rel, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link
        href={href}
        className={classNames(baseStyles, variantStyles[variant], className)}
        target={target}
        rel={rel}
        {...anchorRest}
      >
        {content}
      </Link>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classNames(baseStyles, variantStyles[variant], className)}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
