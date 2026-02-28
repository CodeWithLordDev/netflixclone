"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, Ban, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function UserBadge({ role }) {
  const roleColors = {
    superadmin: "bg-red-500/20 text-red-300",
    admin: "bg-purple-500/20 text-purple-300",
    moderator: "bg-amber-500/20 text-amber-300",
    user: "bg-blue-500/20 text-blue-300",
  };

  return (
    <Badge className={`${roleColors[role] || roleColors.user} capitalize`}>
      {role}
    </Badge>
  );
}

function StatusBadge({ isActive, isBanned }) {
  if (isBanned) {
    return <Badge className="bg-red-500/20 text-red-300">Banned</Badge>;
  }
  if (!isActive) {
    return <Badge className="bg-slate-500/20 text-slate-300">Inactive</Badge>;
  }
  return <Badge className="bg-green-500/20 text-green-300">Active</Badge>;
}

export default function UsersManagementTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });

      const res = await fetch(`/api/admin/users-list?${params}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.items || []);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, currentBanned) => {
    try {
      setActionLoading(true);
      const action = currentBanned ? "unban" : "ban";
      
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: curently ? "" : "Suspended by admin",
        }),
      });

      if (!res.ok) throw new Error("Failed to update user");

      // Refresh users list
      await fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      await fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="border-red-900/50 bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <div className="flex gap-3 mt-4 flex-wrap">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-100 placeholder-slate-400"
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-100"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-700/50 rounded animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No users found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700/50 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Plan</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-700/20 transition">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-slate-300">{user.email}</td>
                      <td className="px-4 py-3">
                        <UserBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={user.isActive} isBanned={user.isBanned} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {user.plan || "free"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="p-2 hover:bg-slate-700/50 rounded transition"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleBanUser(user._id, user.isBanned)}
                            disabled={actionLoading}
                            className="p-2 hover:bg-slate-700/50 rounded transition disabled:opacity-50"
                            title={user.isBanned ? "Unban user" : "Ban user"}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, pagination.total)} of {pagination.total} users
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-slate-700/50 rounded disabled:opacity-50 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const btnPage = i + 1;
                    return (
                      <button
                        key={btnPage}
                        onClick={() => setPage(btnPage)}
                        className={`px-3 py-1 rounded transition ${
                          page === btnPage
                            ? "bg-blue-500/30 text-blue-300"
                            : "hover:bg-slate-700/50"
                        }`}
                      >
                        {btnPage}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                    className="p-2 hover:bg-slate-700/50 rounded disabled:opacity-50 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
