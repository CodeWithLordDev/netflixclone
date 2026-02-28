# RBAC Dashboard Architecture

## Folder Structure

```txt
src/
  app/
    admin/
      layout.js
      loading.js
      page.js
      users/page.js
      content/page.js
      reports/page.js
      notifications/page.js
      logs/page.js
    api/admin/
      me/route.js
      dashboard/route.js
      users/route.js
      users/[id]/route.js
      content/route.js
      content/[id]/route.js
      reports/route.js
      reports/[id]/route.js
      notifications/route.js
      notifications/read/route.js
      audit-logs/route.js
  components/
    admin/
      admin-shell.js
      admin-sidebar.js
      admin-topbar.js
      mobile-admin-nav.js
      profile-menu.js
      notifications-drawer.js
      dashboard-overview-client.js
      theme-provider.js
      nav-config.js
    ui/
      button.js
      badge.js
      card.js
      input.js
      skeleton.js
      toast.js
      drawer.js
      dropdown.js
      modal.js
      tabs.js
      table.js
  lib/
    auth/
      guard.js
      permissions.js
      rbac.js
    api.js
    audit.js
    validators/admin.js
  models/
    User.js
    Content.js
    Report.js
    Notification.js
    AuditLog.js
scripts/
  seed-rbac-dashboard.js
```

## Security Practices Implemented

- Access + refresh JWT flow with server-validated refresh token records.
- HTTP-only auth cookies with secure flags in production.
- Centralized permission matrix in `src/lib/auth/permissions.js`.
- API-level permission guards with `requirePermission` / `requireAnyPermission`.
- Zod validation for admin payloads.
- Audit trail for sensitive actions.
- Pagination defaults and limits to avoid expensive unbounded queries.
- Role-safe route rendering in admin layout.
