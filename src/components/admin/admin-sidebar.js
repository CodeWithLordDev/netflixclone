"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getRoleLabel, getSidebarItems, RoleBadgeIcon } from "@/components/admin/nav-config";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

function SidebarBody({ role, collapsed, setCollapsed, pathname, mobile = false, onNavigate }) {
  const navItems = useMemo(() => getSidebarItems(role), [role]);

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-[var(--dash-border)] px-4">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              key="brand"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="truncate text-sm font-semibold tracking-[0.12em] text-[var(--dash-text)]"
            >
              ADMIN CONSOLE
            </motion.p>
          )}
        </AnimatePresence>
        {!mobile ? (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-xl border border-[var(--dash-border)] bg-black/10 p-1.5 text-[var(--dash-muted)] transition hover:text-[var(--dash-text)]"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        ) : null}
      </div>

      <nav className="space-y-1.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[linear-gradient(120deg,rgba(56,189,248,0.12),rgba(148,163,184,0.1))] text-[var(--dash-text)]"
                  : "text-[var(--dash-muted)] hover:bg-white/5 hover:text-[var(--dash-text)]"
              )}
            >
              <Icon size={18} />
              <span className={cn("whitespace-nowrap", collapsed && !mobile && "hidden")}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-[var(--dash-border)] bg-black/10 p-3 text-xs text-[var(--dash-muted)]">
        <div className="flex items-center gap-2">
          <RoleBadgeIcon size={14} />
          <span className={cn(collapsed && !mobile && "hidden")}>{getRoleLabel(role)}</span>
        </div>
      </div>
    </>
  );
}

export default function AdminSidebar({ role, mobileOpen = false, setMobileOpen = () => {} }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 94 : 286 }}
        className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-[var(--dash-border)] bg-[var(--dash-panel)]/84 shadow-2xl backdrop-blur-2xl lg:block"
      >
        <SidebarBody role={role} collapsed={collapsed} setCollapsed={setCollapsed} pathname={pathname} />
      </motion.aside>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <DrawerContent className="inset-y-0 left-0 w-[82vw] max-w-[320px] overflow-hidden border-r border-[var(--dash-border)] bg-[var(--dash-panel)]/95 backdrop-blur-2xl">
          <SidebarBody
            role={role}
            collapsed={false}
            setCollapsed={() => {}}
            pathname={pathname}
            mobile
            onNavigate={() => setMobileOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
}
