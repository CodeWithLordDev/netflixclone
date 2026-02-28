# StreamFlix Admin Architecture

## Stack
- Next.js App Router (JavaScript)
- Tailwind CSS + reusable UI primitives (ShadCN-style composition)
- Mongoose + MongoDB
- NextAuth credentials auth + role-based guards
- Recharts analytics widgets
- Cloudinary signed-upload endpoint

## Modules
- `src/app/admin/*`: Server-rendered admin pages
- `src/components/admin/*`: Page-specific, interactive dashboard components
- `src/components/ui/*`: Primitive design system components (`Button`, `Card`, `Input`, `Badge`)
- `src/app/api/admin/*`: Protected REST endpoints for dashboard operations
- `src/lib/*`: Shared infra (auth, RBAC, mongodb, validators, data queries)
- `src/models/*`: MongoDB models and relations

## Security
- `middleware.js`: Admin route protection and redirect control
- `src/lib/auth/guard.js`: API-level role checks
- `src/lib/validators/admin.js`: Zod schema validation for all admin mutations

## Seed Credentials
- `superadmin@streamflix.com` / `Admin@123`
