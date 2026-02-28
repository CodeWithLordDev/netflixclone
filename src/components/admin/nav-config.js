import {
  Bell,
  FileWarning,
  Film,
  LayoutDashboard,
  CreditCard,
  PieChart,
  Settings,
  Shield,
  Users,
  ScrollText,
} from "lucide-react";
import { Permissions, hasAnyPermission } from "@/lib/auth/permissions";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, perms: [Permissions.DASHBOARD_VIEW] },
  { href: "/admin/users", label: "Users", icon: Users, perms: [Permissions.USERS_VIEW] },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, perms: [Permissions.SUBSCRIPTIONS_VIEW, Permissions.PLANS_VIEW] },
  { href: "/admin/content", label: "Content", icon: Film, perms: [Permissions.CONTENT_VIEW, Permissions.CONTENT_MANAGE] },
  { href: "/admin/reports", label: "Reports", icon: FileWarning, perms: [Permissions.REPORTS_VIEW] },
  { href: "/admin/analytics", label: "Analytics", icon: PieChart, perms: [Permissions.ANALYTICS_LIMITED, Permissions.ANALYTICS_FULL] },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, perms: [Permissions.NOTIFICATIONS_VIEW] },
  { href: "/admin/logs", label: "System Logs", icon: ScrollText, perms: [Permissions.LOGS_VIEW] },
  { href: "/admin/settings", label: "Settings", icon: Settings, perms: [Permissions.SETTINGS_VIEW, Permissions.SETTINGS_MANAGE] },
];

export function getSidebarItems(role) {
  return ITEMS.filter((item) => hasAnyPermission(role, item.perms));
}

export function getRoleLabel(role) {
  if (role === "superadmin") return "Super Admin";
  if (role === "moderator") return "Moderator";
  if (role === "admin") return "Admin";
  return "User";
}

export const RoleBadgeIcon = Shield;
