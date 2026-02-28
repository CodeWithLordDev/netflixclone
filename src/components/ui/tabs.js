"use client";

export function Tabs({ value, onChange, items = [] }) {
  return (
    <div className="inline-flex rounded-2xl border border-[var(--dash-border)] bg-black/20 p-1">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={`rounded-xl px-3 py-1.5 text-sm transition ${
            value === item.value ? "bg-white/10 text-[var(--dash-text)]" : "text-[var(--dash-muted)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
