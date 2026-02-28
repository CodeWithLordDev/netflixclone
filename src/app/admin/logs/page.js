import { redirect } from "next/navigation";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { normalizeRole } from "@/lib/auth/rbac";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import { DataTable } from "@/components/ui/table";

export default async function LogsPage() {
  const session = await getSessionFromJwt();
  if (!session?.user || normalizeRole(session.user.role) !== "superadmin") {
    redirect("/admin");
  }

  await connectDB();
  const items = await AuditLog.find().sort({ createdAt: -1 }).limit(30).lean();

  return (
    <DataTable
      columns={["When", "Actor", "Action", "Entity", "Metadata"]}
      rows={items}
      renderRow={(row) => (
        <tr key={String(row._id)} className="border-b border-[var(--dash-border)]">
          <td className="px-4 py-3 text-[var(--dash-muted)]">{new Date(row.createdAt).toLocaleString()}</td>
          <td className="px-4 py-3 text-[var(--dash-text)]">{row.actorRole}</td>
          <td className="px-4 py-3 text-[var(--dash-text)]">{row.action}</td>
          <td className="px-4 py-3 text-[var(--dash-muted)]">{row.entity}</td>
          <td className="px-4 py-3 text-[var(--dash-muted)]">{JSON.stringify(row.metadata || {}).slice(0, 80)}</td>
        </tr>
      )}
    />
  );
}
