import { cn } from "@/lib/utils";

export function Badge({ className, tone = "default", ...props }) {
  const tones = {
    default: "bg-black/20 text-[var(--dash-text)] border border-[var(--dash-border)]",
    success: "bg-emerald-900/30 text-emerald-300 border border-emerald-700/30",
    danger: "bg-red-900/30 text-red-300 border border-red-700/30",
    warning: "bg-amber-900/30 text-amber-300 border border-amber-700/30"
  };

  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs", tones[tone], className)} {...props} />;
}
