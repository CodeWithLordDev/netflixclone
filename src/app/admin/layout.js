import { redirect } from "next/navigation";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { normalizeRole } from "@/lib/auth/rbac";
import AdminShell from "@/components/admin/admin-shell";
import { ThemeProvider } from "@/components/admin/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export default async function AdminLayout({ children }) {
  const session = await getSessionFromJwt();

  if (!session?.user) redirect("/signin");

  const role = normalizeRole(session.user.role);
  const allowed = ["superadmin", "admin", "moderator"];
  if (!allowed.includes(role)) redirect("/browse");

  return (
    <ThemeProvider>
      <ToastProvider>
        <AdminShell user={{ ...session.user, role }}>{children}</AdminShell>
      </ToastProvider>
    </ThemeProvider>
  );
}
