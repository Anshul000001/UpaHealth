import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
}

const variants = {
  default: "bg-slate-800/80 text-slate-300 border-slate-700/50",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  danger:  "bg-red-500/10 text-red-400 border-red-500/25",
  info:    "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
  purple:  "bg-purple-500/10 text-purple-400 border-purple-500/25",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
