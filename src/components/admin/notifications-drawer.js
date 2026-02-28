"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function NotificationsDrawer({ open, onOpenChange, unread, setUnread }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const { push } = useToast();

  useEffect(() => {
    if (!open) return;

    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (!active) return;
        setItems(data.items || []);
        setUnread(data.unread || 0);
      } catch {
        push("Failed to load notifications", "error");
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [open, push, setUnread]);

  const markAllRead = async () => {
    try {
      await fetch("/api/admin/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setUnread(0);
      setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
      push("Notifications updated", "success");
    } catch {
      push("Failed to update notifications", "error");
    }
  };

  return (
    <Drawer open={open} onClose={() => onOpenChange(false)}>
      <DrawerContent className="right-0 top-0 h-screen w-full max-w-md border-l border-[var(--dash-border)] bg-[var(--dash-panel)]/95 p-4 backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--dash-text)]">Notifications</h3>
          <Button size="sm" variant="ghost" onClick={markAllRead}>
            <CheckCheck size={15} className="mr-1.5" /> Mark all
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--dash-muted)]"><LoaderCircle className="animate-spin" size={15} /> Loading...</div>
        ) : (
          <div className="space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-[var(--dash-muted)]">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <div key={item._id} className="rounded-2xl border border-[var(--dash-border)] bg-black/20 p-3">
                  <p className="text-sm font-medium text-[var(--dash-text)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--dash-muted)]">{item.message}</p>
                  {!item.readAt && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-1 text-[10px] text-sky-300">
                      <Bell size={11} /> Unread
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
