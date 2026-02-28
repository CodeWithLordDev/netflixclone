"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { createContext, useContext, useMemo, useState } from "react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminTopbar from "@/components/admin/admin-topbar";

const SearchContext = createContext({ query: "" });

export function useAdminSearch() {
  return useContext(SearchContext);
}

export default function AdminShell({ user, children }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchValue = useMemo(() => ({ query }), [query]);

  return (
    <SearchContext.Provider value={searchValue}>
      <div className="min-h-screen overflow-x-hidden bg-[var(--dash-bg)] text-[var(--dash-text)]">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.08),transparent_32%),linear-gradient(180deg,var(--dash-bg),color-mix(in_hsl,var(--dash-bg),black_10%))]" />
        <AdminSidebar role={user.role} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="lg:pl-[286px]">
          <AdminTopbar user={user} onSearch={setQuery} onMenu={() => setMobileOpen(true)} />
          <div className="px-4 pb-8 pt-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </SearchContext.Provider>
  );
}
