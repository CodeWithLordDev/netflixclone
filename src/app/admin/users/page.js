"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAdminSearch } from "@/components/admin/admin-shell";
import UsersToolbar from "@/components/admin/users/users-toolbar";
import UsersTable from "@/components/admin/users/users-table";
import UserDetailsModal from "@/components/admin/users/user-details-modal";
import PageSkeleton from "@/components/admin/common/page-skeleton";

export default function UsersPage() {
  const { query: globalSearch } = useAdminSearch();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [detailsId, setDetailsId] = useState(null);
  const [viewerRole, setViewerRole] = useState("moderator");
  const { push } = useToast();

  const resolveId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.trim();
    if (typeof value === "object") {
      if (typeof value.id === "string") return value.id.trim();
      if (typeof value._id === "string") return value._id.trim();
      if (typeof value.$oid === "string") return value.$oid.trim();
    }
    return "";
  };

  const parseResponse = async (res) => {
    const raw = await res.text();
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error("Unexpected token in server response");
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        const meRes = await fetch("/api/admin/me");
        const meData = await meRes.json();
        if (active && meData?.user?.role) setViewerRole(meData.user.role);

        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: "10",
        });

        const mergedQuery = (localQuery || globalSearch || "").trim();
        if (mergedQuery) params.set("q", mergedQuery);
        if (status) params.set("status", status);
        if (role) params.set("role", role);

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        const data = await res.json();
        if (!active) return;

        if (data?.error) {
          push(data.error.message || "Failed to load users", "error");
          setItems([]);
          return;
        }

        setItems(
          (data.items || []).map((item) => ({
            ...item,
            id: resolveId(item.id || item._id),
          }))
        );
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch {
        push("Failed to load users", "error");
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [globalSearch, localQuery, pagination.page, push, role, status]);

  const changeRole = async (id, nextRole) => {
    const userId = resolveId(id);
    if (!userId) {
      push("Invalid user id", "error");
      return;
    }
    const snapshot = items;
    setItems((prev) => prev.map((row) => (resolveId(row.id || row._id) === userId ? { ...row, role: nextRole } : row)));

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await parseResponse(res);
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Role update failed");
      push("Role updated", "success");
    } catch (error) {
      setItems(snapshot);
      push(error.message || "Role update failed", "error");
    }
  };

  const toggleBan = async (row) => {
    const userId = resolveId(row.id || row._id);
    if (!userId) {
      push("Invalid user id", "error");
      return;
    }
    const snapshot = items;
    const action = row.status === "banned" ? "unban" : "ban";
    setItems((prev) =>
      prev.map((item) =>
        resolveId(item.id || item._id) === userId
          ? { ...item, status: action === "ban" ? "banned" : "active" }
          : item
      )
    );

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await parseResponse(res);
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Failed to update user status");
      setItems((prev) => prev.map((item) => (resolveId(item.id || item._id) === userId ? { ...item, status: data.status } : item)));
      push(action === "ban" ? "User banned" : "User unbanned", "success");
    } catch (error) {
      setItems(snapshot);
      push(error.message || "Failed to update user status", "error");
    }
  };

  if (loading && items.length === 0) return <PageSkeleton withTable />;

  return (
    <div className="space-y-4">
      <UsersToolbar
        query={localQuery}
        onQuery={(value) => {
          setLocalQuery(value);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        role={role}
        onRole={(value) => {
          setRole(value);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        status={status}
        onStatus={(value) => {
          setStatus(value);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
      />

      <UsersTable
        rows={items}
        viewerRole={viewerRole}
        onRoleChange={changeRole}
        onBanToggle={toggleBan}
        onOpenDetails={setDetailsId}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--dash-muted)]">
          Page {pagination.page} of {pagination.pages} • {pagination.total || 0} users
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
          >
            Next
          </Button>
        </div>
      </div>

      <UserDetailsModal userId={detailsId} open={Boolean(detailsId)} onClose={() => setDetailsId(null)} />
    </div>
  );
}

