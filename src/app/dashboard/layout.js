import { redirect } from "next/navigation";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { normalizeRole } from "@/lib/auth/rbac";

export default async function DashboardLayout({ children }) {
  const session = await getSessionFromJwt();
  if (!session?.user) redirect("/signin");

  const role = normalizeRole(session.user.role);
  if (role === "user") redirect("/browse");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1b1b20,#0a0a0d_45%)] text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 px-6 py-4 backdrop-blur">
        <h1 className="text-xl font-semibold tracking-wide">STREAMFLIX CONTROL CENTER</h1>
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
