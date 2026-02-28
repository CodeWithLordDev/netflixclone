import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import SettingsForm from "@/components/admin/settings-form";
import { getSettings } from "@/lib/admin-data";
import { getSessionFromJwt } from "@/lib/auth/guard";
import { normalizeRole } from "@/lib/auth/rbac";

export default async function SettingsPage() {
  const session = await getSessionFromJwt();
  if (!session?.user || normalizeRole(session.user.role) !== "superadmin") {
    redirect("/admin");
  }

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Platform identity, Stripe-ready keys, and SEO configuration." />
      <SettingsForm initialSettings={settings || { platformName: "StreamFlix" }} />
    </div>
  );
}
