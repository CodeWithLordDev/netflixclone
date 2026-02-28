"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, MoonStar, Search, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProfileMenu from "@/components/admin/profile-menu";
import NotificationsDrawer from "@/components/admin/notifications-drawer";
import { useTheme } from "@/components/admin/theme-provider";

export default function AdminTopbar({ user, onSearch, onMenu }) {
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch?.(query);
    }, 220);
    return () => clearTimeout(timeout);
  }, [query, onSearch]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (!active) return;
        setUnread(data.unread || 0);
      } catch {}
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--dash-border)] bg-[var(--dash-bg)]/80 px-4 py-3 backdrop-blur-xl lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="rounded-xl border border-[var(--dash-border)] bg-black/10 p-2 text-[var(--dash-muted)] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={16} />
          </button>
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-2.5 text-[var(--dash-muted)]" size={16} />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users, reports, content"
              className="rounded-2xl border-[var(--dash-border)] bg-black/10 pl-9"
            />
          </div>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-[var(--dash-border)] bg-black/10 p-2 text-[var(--dash-muted)] transition hover:text-[var(--dash-text)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <MoonStar size={16} />}
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="relative rounded-xl border border-[var(--dash-border)] bg-black/10 p-2 text-[var(--dash-muted)] transition hover:text-[var(--dash-text)]"
            aria-label="Open notifications"
          >
            <Bell size={16} />
            {unread > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-sky-500 px-1 text-[10px] text-black">{unread}</span>}
          </button>

          <ProfileMenu user={user} />
        </div>
      </header>

      <NotificationsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} unread={unread} setUnread={setUnread} />
    </>
  );
}
