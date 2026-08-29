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
        "inline-flex h-12 items-center justify-center rounded-full border px-6 text-[13px] font-semibold tracking-[0.08em] uppercase transition-colors duration-200",
        styles[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
