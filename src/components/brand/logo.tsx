import { cn } from "@/lib/utils";

type LogoVariant = "mark" | "full" | "stacked";

interface LogoProps {
  variant?: LogoVariant;
  /** Pixel size of the icon mark. Wordmark scales relative to this. */
  size?: number;
  /** Tailwind class for the wordmark color. Defaults to white. */
  wordmarkClassName?: string;
  /** Tailwind class for the tagline color. */
  taglineClassName?: string;
  /** Show the "Your Path to Wellness" tagline (full/stacked only). */
  showTagline?: boolean;
  className?: string;
}

/**
 * UpaHealth brand logo.
 *
 * - `mark`     → just the icon (medical cross + wellness leaf)
 * - `full`     → icon + wordmark on a single horizontal line
 * - `stacked`  → icon centered above the wordmark and tagline
 */
export function Logo({
  variant = "mark",
  size = 32,
  wordmarkClassName,
  taglineClassName,
  showTagline = true,
  className,
}: LogoProps) {
  const Mark = (
    <LogoMark size={size} />
  );

  if (variant === "mark") {
    return <span className={cn("inline-flex", className)}>{Mark}</span>;
  }

  if (variant === "stacked") {
    return (
      <div className={cn("inline-flex flex-col items-center gap-2", className)}>
        {Mark}
        <div className="flex flex-col items-center leading-tight">
          <span
            className={cn(
              "font-bold tracking-tight",
              wordmarkClassName ?? "text-white"
            )}
            style={{ fontSize: size * 0.7 }}
          >
            <span className="text-blue-300">Upa</span>
            <span className="text-teal-300">Health</span>
          </span>
          {showTagline && (
            <span
              className={cn(
                "uppercase tracking-[0.25em]",
                taglineClassName ?? "text-teal-400/80"
              )}
              style={{ fontSize: Math.max(9, size * 0.22) }}
            >
              Your Path to Wellness
            </span>
          )}
        </div>
      </div>
    );
  }

  // full
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {Mark}
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-bold tracking-tight",
            wordmarkClassName ?? "text-white"
          )}
          style={{ fontSize: size * 0.55 }}
        >
          <span className="text-blue-300">Upa</span>
          <span className="text-teal-300">Health</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "uppercase tracking-[0.2em] mt-1",
              taglineClassName ?? "text-teal-400/70"
            )}
            style={{ fontSize: Math.max(8, size * 0.18) }}
          >
            Your Path to Wellness
          </span>
        )}
      </div>
    </div>
  );
}

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Standalone icon mark — medical cross outline with a wellness leaf inside. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="UpaHealth"
      className={className}
    >
      <defs>
        <linearGradient id="upa-cross-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="0.5" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="upa-leaf-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="0.5" stopColor="#06b6d4" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <path
        d="M43 5 L57 5 A8 8 0 0 1 65 13 L65 35 L87 35 A8 8 0 0 1 95 43 L95 57 A8 8 0 0 1 87 65 L65 65 L65 87 A8 8 0 0 1 57 95 L43 95 A8 8 0 0 1 35 87 L35 65 L13 65 A8 8 0 0 1 5 57 L5 43 A8 8 0 0 1 13 35 L35 35 L35 13 A8 8 0 0 1 43 5 Z"
        fill="none"
        stroke="url(#upa-cross-grad)"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d="M50 22 C 70 36 70 64 50 80 C 30 64 30 36 50 22 Z"
        fill="url(#upa-leaf-grad)"
      />
      <path
        d="M50 28 C 50 40 50 60 50 74"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
