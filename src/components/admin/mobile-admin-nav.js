"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getSidebarItems } from "@/components/admin/nav-config";

export default function MobileAdminNav({ role }) {
  const pathname = usePathname();
  const items = getSidebarItems(role).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--dash-border)] bg-[var(--dash-panel)]/95 p-2 backdrop-blur-xl lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mx-auto rounded-xl p-2 text-[var(--dash-muted)]",
              active && "bg-white/10 text-[var(--dash-text)]"
            )}
          >
            <Icon size={18} />
          </Link>
        );
      })}
    </nav>
  );
}
