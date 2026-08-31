import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  const styles = {
    primary:
      "border-electric bg-electric text-navy hover:bg-electric-deep hover:border-electric-deep",
    secondary:
      "border-white/20 bg-transparent text-ink hover:border-electric hover:text-electric",
    ghost: "border-transparent bg-transparent text-ink hover:text-electric",
  } as const;

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-[13px] font-semibold tracking-[0.08em] uppercase transition-all duration-300",
        styles[variant],
        className,
      )}
    >
      {children}
      <svg
        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 10h11M11 5l5 5-5 5" />
      </svg>
    </Link>
  );
}
