/**
 * RBAC (Role-Based Access Control) Configuration
 * Centralized permission matrix for the admin system
 * Defines what each role can/cannot do
 */

export const ROLES = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
  SUPERADMIN: "superadmin",
};

export const ROLE_HIERARCHY = {
  superadmin: 4,
  admin: 3,
  moderator: 2,
  user: 1,
};

/**
 * Permission Matrix
 * Defines which actions each role can perform
 */
export const PERMISSIONS = {
  // User Management
  "users.view": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "users.view.all": [ROLES.SUPERADMIN],
  "users.create": [ROLES.SUPERADMIN],
  "users.update": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "users.update.role": [ROLES.SUPERADMIN],
  "users.delete": [ROLES.SUPERADMIN],
  "users.ban": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "users.unban": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "users.view.activity": [ROLES.ADMIN, ROLES.SUPERADMIN],

  // Subscription Management
  "subscriptions.view": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "subscriptions.view.all": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "subscriptions.create": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "subscriptions.update": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "subscriptions.cancel": [ROLES.ADMIN, ROLES.SUPERADMIN],

  // Plans Management (Super Admin Only)
  "plans.view": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "plans.create": [ROLES.SUPERADMIN],
  "plans.update": [ROLES.SUPERADMIN],
  "plans.delete": [ROLES.SUPERADMIN],
  "plans.toggle": [ROLES.SUPERADMIN],

  // Analytics & Reports
  "analytics.view.basic": [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN],
  "analytics.view.detailed": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "analytics.view.revenue": [ROLES.SUPERADMIN],
  "reports.view": [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN],
  "reports.manage": [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN],
  "reports.resolve": [ROLES.ADMIN, ROLES.SUPERADMIN],

  // Content Management
  "content.view": [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN],
  "content.approve": [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN],
  "content.reject": [ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN],
  "content.delete": [ROLES.ADMIN, ROLES.SUPERADMIN],

  // System Logs & Audit
  "logs.view": [ROLES.SUPERADMIN],
  "audit.view": [ROLES.SUPERADMIN],

  // Settings
  "settings.view": [ROLES.ADMIN, ROLES.SUPERADMIN],
  "settings.update": [ROLES.SUPERADMIN],
};

/**
 * Check if a role has permission to perform an action
 */
export function hasPermission(userRole, permission) {
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(userRole);
}

/**
 * Get all permissions for a specific role
 */
export function getRolePermissions(role) {
  return Object.entries(PERMISSIONS).reduce((acc, [permission, roles]) => {
    if (roles.includes(role)) {
      acc.push(permission);
    }
    return acc;
  }, []);
}

/**
 * Check if a role can perform multiple permissions
 */
export function hasAnyPermission(userRole, permissions) {
  return permissions.some((perm) => hasPermission(userRole, perm));
}

export function hasAllPermissions(userRole, permissions) {
  return permissions.every((perm) => hasPermission(userRole, perm));
}

/**
 * Role Labels for UI
 */
export const ROLE_LABELS = {
  user: "User",
  moderator: "Moderator",
  admin: "Admin",
  superadmin: "Super Admin",
};

/**
 * Role Colors for UI
 */
export const ROLE_COLORS = {
  user: "blue",
  moderator: "amber",
  admin: "purple",
  superadmin: "red",
};

/**
 * API Route Protection Helpers
 */
export function requireRole(minRole) {
  return (userRole) => {
    const userRank = ROLE_HIERARCHY[userRole] || 0;
    const minRank = ROLE_HIERARCHY[minRole] || 0;
    return userRank >= minRank;
  };
}

export function requirePermission(permission) {
  return (userRole) => hasPermission(userRole, permission);
}

export function requireAnyRole(roles) {
  return (userRole) => roles.includes(userRole);
}

/**
 * Sidebar Navigation Items by Role
 */
export const SIDEBAR_CONFIG = {
  superadmin: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Users", href: "/admin/users", icon: "Users" },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: "CreditCard" },
    { label: "Plans", href: "/admin/plans", icon: "Package" },
    { label: "Content", href: "/admin/content", icon: "Video" },
    { label: "Reports", href: "/admin/reports", icon: "AlertCircle" },
    { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
    { label: "System Logs", href: "/admin/logs", icon: "FileText" },
    { label: "Settings", href: "/admin/settings", icon: "Settings" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Users", href: "/admin/users", icon: "Users" },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: "CreditCard" },
    { label: "Plans", href: "/admin/plans", icon: "Package" },
    { label: "Content", href: "/admin/content", icon: "Video" },
    { label: "Reports", href: "/admin/reports", icon: "AlertCircle" },
    { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  ],
  moderator: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Reports", href: "/admin/reports", icon: "AlertCircle" },
    { label: "Content", href: "/admin/content", icon: "Video" },
    { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  ],
};

/**
 * Page Access Control
 * Defines minimum role required to access each page
 */
export const PAGE_PERMISSIONS = {
  "/admin": ROLES.MODERATOR,
  "/admin/users": ROLES.ADMIN,
  "/admin/users/[id]": ROLES.ADMIN,
  "/admin/subscriptions": ROLES.ADMIN,
  "/admin/plans": ROLES.ADMIN,
  "/admin/plans/new": ROLES.SUPERADMIN,
  "/admin/plans/[id]/edit": ROLES.SUPERADMIN,
  "/admin/content": ROLES.MODERATOR,
  "/admin/reports": ROLES.MODERATOR,
  "/admin/analytics": ROLES.MODERATOR,
  "/admin/logs": ROLES.SUPERADMIN,
  "/admin/settings": ROLES.SUPERADMIN,
  "/admin/notifications": ROLES.ADMIN,
};
