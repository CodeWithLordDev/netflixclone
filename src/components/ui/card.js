import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/70 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_60px_-28px_rgba(0,0,0,0.65)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("px-5 pt-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-sm font-semibold text-[var(--dash-text)]", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}
