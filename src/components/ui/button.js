"use client";

import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "md", ...props }) {
  const variants = {
    default: "bg-[linear-gradient(120deg,var(--dash-accent),color-mix(in_hsl,var(--dash-accent),white_25%))] text-slate-950 hover:brightness-95",
    outline: "border border-[var(--dash-border)] bg-black/10 text-[var(--dash-text)] hover:bg-white/10",
    ghost: "text-[var(--dash-text)] hover:bg-white/10"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition duration-150 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
