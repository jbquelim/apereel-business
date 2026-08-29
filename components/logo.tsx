import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
};

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={cn("h-7 w-7 text-ink", markClassName)}
      >
        <circle
          cx="16"
          cy="16"
          r="12.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <circle cx="16" cy="16" r="4.4" fill="#3d9eff" />
      </svg>
      {showWordmark ? (
        <span className="text-[13px] font-semibold tracking-[0.28em] text-ink">
          APEREEL
        </span>
      ) : null}
    </span>
  );
}
