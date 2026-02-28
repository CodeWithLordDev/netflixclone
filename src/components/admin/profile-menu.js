"use client";

import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileMenu({ user }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <Dropdown
      trigger={
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(130deg,#38bdf8,#34d399)] text-sm font-semibold text-zinc-900">
          {(user?.name || "A").slice(0, 1).toUpperCase()}
        </span>
      }
    >
      {({ close }) => (
        <>
          <div className="border-b border-[var(--dash-border)] px-3 py-2">
            <p className="truncate text-sm text-[var(--dash-text)]">{user?.name || "Admin"}</p>
            <p className="truncate text-xs text-[var(--dash-muted)]">{user?.email}</p>
          </div>
          <DropdownItem onClick={() => close()}>
            <span className="inline-flex items-center gap-2"><UserRound size={14} /> Profile</span>
          </DropdownItem>
          <DropdownItem
            danger
            onClick={() => {
              close();
              logout();
            }}
          >
            <span className="inline-flex items-center gap-2"><LogOut size={14} /> Logout</span>
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
