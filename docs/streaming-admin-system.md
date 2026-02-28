# Streaming Admin System (JWT + MongoDB)

## Implemented Stack
- Next.js App Router
- JavaScript
- MongoDB + Mongoose
- JWT Access + Refresh tokens
- bcrypt
- Cloudinary signed upload endpoint
- Tailwind CSS

## Role Matrix Enforced
- user: browse, subscription actions
- moderator: view users, ban/unban users, view reports, moderate-remove videos
- admin: all moderator permissions + video CRUD + plan create/update + assign subscriptions + analytics
- superadmin: all permissions + role promotion/demotion + delete users + delete plans + audit log access

## Auth
- Access token cookie: `accessToken` (15 min)
- Refresh token cookie: `refreshToken` (7 days)
- Legacy compatibility cookie: `token` mirrors access token
- Endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`

## New Models
- `User`
- `RefreshToken`
- `Plan`
- `Subscription`
- `Video`
- `VideoReport`
- `AuditLog`

## New API Groups
- `app/api/users/*`
- `app/api/plans/*`
- `app/api/subscription/*`
- `app/api/videos/*`
- `app/api/admin/audit-logs`

## Dashboards
- `/dashboard/moderator`
- `/dashboard/admin`
- `/dashboard/superadmin`

## Subscription UX
- `/subscription`
- monthly/yearly toggle
- recommended plan highlighting
- active plan badge + expiry countdown
- upgrade/downgrade action
