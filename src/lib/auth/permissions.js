import { Roles, normalizeRole } from "@/lib/auth/rbac";

export const Permissions = {
  DASHBOARD_VIEW: "dashboard:view",
  ACTIVITY_VIEW: "activity:view",
  ANALYTICS_FULL: "analytics:full",
  ANALYTICS_LIMITED: "analytics:limited",
  REVENUE_VIEW: "revenue:view",
  USERS_VIEW: "users:view",
  USERS_VIEW_ALL: "users:view:all",
  USERS_MANAGE: "users:manage",
  ROLES_MANAGE: "roles:manage",
  USERS_BAN: "users:ban",
  USERS_UNBAN: "users:unban",
  SUBSCRIPTIONS_VIEW: "subscriptions:view",
  SUBSCRIPTIONS_ASSIGN: "subscriptions:assign",
  PLANS_VIEW: "plans:view",
  PLANS_MANAGE: "plans:manage",
  CONTENT_VIEW: "content:view",
  CONTENT_MANAGE: "content:manage",
  CONTENT_APPROVE: "content:approve",
  REPORTS_VIEW: "reports:view",
  REPORTS_HANDLE: "reports:handle",
  REPORTS_ESCALATE: "reports:escalate",
  SETTINGS_VIEW: "settings:view",
  SETTINGS_MANAGE: "settings:manage",
  LOGS_VIEW: "logs:view",
  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_MANAGE: "notifications:manage",
};

const PERMISSIONS_BY_ROLE = {
  [Roles.SUPER_ADMIN]: Object.values(Permissions),
  [Roles.ADMIN]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.ACTIVITY_VIEW,
    Permissions.ANALYTICS_LIMITED,
    Permissions.REVENUE_VIEW,
    Permissions.USERS_VIEW,
    Permissions.USERS_VIEW_ALL,
    Permissions.USERS_MANAGE,
    Permissions.USERS_BAN,
    Permissions.USERS_UNBAN,
    Permissions.ROLES_MANAGE,
    Permissions.SUBSCRIPTIONS_VIEW,
    Permissions.SUBSCRIPTIONS_ASSIGN,
    Permissions.PLANS_VIEW,
    Permissions.CONTENT_VIEW,
    Permissions.CONTENT_MANAGE,
    Permissions.CONTENT_APPROVE,
    Permissions.REPORTS_VIEW,
    Permissions.REPORTS_HANDLE,
    Permissions.NOTIFICATIONS_VIEW,
    Permissions.NOTIFICATIONS_MANAGE,
  ],
  [Roles.MODERATOR]: [
    Permissions.DASHBOARD_VIEW,
    Permissions.ACTIVITY_VIEW,
    Permissions.ANALYTICS_LIMITED,
    Permissions.CONTENT_VIEW,
    Permissions.CONTENT_APPROVE,
    Permissions.REPORTS_VIEW,
    Permissions.REPORTS_HANDLE,
    Permissions.REPORTS_ESCALATE,
    Permissions.NOTIFICATIONS_VIEW,
  ],
  [Roles.USER]: [],
};

export function getRolePermissions(role) {
  return PERMISSIONS_BY_ROLE[normalizeRole(role)] || [];
}

export function hasPermission(role, permission) {
  return getRolePermissions(role).includes(permission);
}

export function hasAnyPermission(role, permissions = []) {
  const owned = getRolePermissions(role);
  return permissions.some((item) => owned.includes(item));
}
