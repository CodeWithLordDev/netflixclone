import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/70 px-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] focus:border-sky-400 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
