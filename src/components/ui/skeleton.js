export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-800/70 ${className}`.trim()} />;
}
