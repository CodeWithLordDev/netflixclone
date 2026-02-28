"use client";

import { useEffect, useRef, useState } from "react";

export function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}>{trigger}</button>
      {open && (
        <div
          className={`absolute z-50 mt-2 min-w-44 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-panel)]/95 p-1 shadow-2xl backdrop-blur-2xl ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          {children({ close: () => setOpen(false) })}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
        danger ? "text-red-300 hover:bg-red-500/10" : "text-[var(--dash-text)] hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
