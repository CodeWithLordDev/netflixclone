# 🏗️ Admin System - Implementation & Usage Guide

## Quick Start

### 1. Environment Setup

```bash
# Create .env.local file
MONGODB_URI=mongodb+srv://your_credentials@cluster.mongodb.net/authdb
JWT_SECRET=your_secure_secret_key_min_32_chars
NODE_ENV=development
```

### 2. Seed Test Data

```bash
# Run the seed script to populate test data
node scripts/seed-admin-system.js

# Expected output:
# ✓ Created 13 users
# ✓ Created 4 plans
# ✓ Created 10 subscriptions
# ✓ Created 30 revenue records
# ✓ Created 15 reports
#
# Test Login Credentials:
# Super Admin: superadmin@example.com / SuperAdmin@123
# Admin: admin@example.com / Admin@123
# Moderator: moderator@example.com / Moderator@123
```

### 3. Start Development Server

```bash
npm run dev
# Access at http://localhost:3000/admin
```

---

## System Architecture

### Folder Structure

```
src/
├── app/
│   ├── api/
│   │   └── admin/
│   │       ├── users/           # User management
│   │       ├── subscriptions/    # Subscription management
│   │       ├── plans/           # Plan management (Super Admin)
│   │       ├── analytics/       # Dashboard analytics
│   │       ├── reports/         # Report management
│   │       └── audit-logs/      # System logs (Super Admin)
│   └── admin/
│       ├── page.js              # Main dashboard
│       ├── users/               # User management UI
│       ├── subscriptions/        # Subscription UI
│       ├── plans/               # Plans management UI
│       ├── analytics/           # Analytics views
│       └── reports/             # Reports UI
├── components/
│   └── admin/
│       ├── dashboard-overview-v2.js      # Main dashboard component
│       ├── admin-sidebar.js              # Sidebar navigation
│       ├── admin-topbar.js               # Top bar with profile
│       └── (other UI components)
├── middleware/
│   ├── auth.js                  # JWT verification
│   └── role.js                  # Role-based access
├── models/
│   ├── User.js
│   ├── Plan.js
│   ├── Subscription.js
│   ├── Revenue.js
│   ├── Report.js
│   ├── AuditLog.js
│   └── (others)
└── lib/
    ├── rbac.js                  # RBAC configuration
    ├── admin-api.js             # Admin API utilities
    └── (helpers)
```

---

## API Reference

### Users API

#### List Users
```bash
GET /api/admin/users
  ?page=1
  &limit=10
  &search=john
  &role=admin
  &status=active

Response: {
  items: [...users],
  pagination: { total, page, limit, pages }
}
```

#### Get User Details
```bash
GET /api/admin/users/[userId]

Response: {
  _id, name, email, role, isActive, isBanned,
  subscription: { planId, expiryDate, ... }
}
```

#### Update User
```bash
PATCH /api/admin/users/[userId]
Body: { name?, email? }

Response: { _id, name, email, role, ... }
```

#### Update User Role (Super Admin Only)
```bash
PATCH /api/admin/users/[userId]/role
Body: { role: "admin|moderator|user" }

Response: { _id, email, name, role }
```

#### Ban/Unban User
```bash
PATCH /api/admin/users/[userId]/ban
Body: { action: "ban|unban", reason?: "reason text" }

Response: { _id, email, name, isBanned, banReason }
```

### Subscriptions API

#### List Subscriptions
```bash
GET /api/admin/subscriptions
  ?page=1
  &limit=10
  &status=active
  &plan=[planId]

Response: {
  items: [...subscriptions],
  pagination: { ... }
}
```

#### Create Subscription for User
```bash
POST /api/admin/subscriptions
Body: {
  userId: "userId",
  planId: "planId",
  amount?: 9.99,
  billingPeriodMonths?: 1
}

Response: {
  _id, userId, planId, expiryDate, isActive
}
```

### Plans API

#### List Plans
```bash
GET /api/admin/plans
  ?page=1
  &limit=10
  &search=premium
  &status=active

Response: {
  items: [...plans],
  pagination: { ... }
}
```

#### Get Plan Details
```bash
GET /api/admin/plans/[planId]

Response: {
  _id, name, price, features, subscriptionCount, ...
}
```

#### Create Plan (Super Admin Only)
```bash
POST /api/admin/plans
Body: {
  name: "Premium Plus",
  description: "Enhanced premium",
  price: 24.99,
  duration: 30,
  billingCycle: "monthly",
  videoQuality: "4K",
  maxDevices: 6,
  hasAds: false,
  features: ["4K streaming", "6 devices"],
  isActive: true,
  isRecommended: false
}

Response: { _id, name, price, ... }
```

#### Update Plan (Super Admin Only)
```bash
PATCH /api/admin/plans/[planId]
Body: { price?, name?, features?, isActive?, ... }

Response: { _id, name, ... }
```

#### Delete Plan (Super Admin Only)
```bash
DELETE /api/admin/plans/[planId]

Response: { message: "Plan deleted successfully" }
```

### Analytics API

#### Get Dashboard Analytics
```bash
GET /api/admin/analytics

Response: {
  metrics: {
    users: { total, active, banned, newThisMonth },
    subscriptions: { total, active },
    reports: { open }
  },
  charts: {
    userGrowth: [{ month, users }, ...],
    revenueData: [{ month, revenue }, ...]  // Admin+ only
  },
  advancedMetrics: {  // Admin+ only
    revenue: { total, avgMonthly },
    planDistribution: [...],
    churnRate: 12.5
  },
  recentActivity: [{ id, name, action, time }, ...]
}
```

---

## Database Models

### User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "user" | "moderator" | "admin" | "superadmin",
  isActive: Boolean,
  isBanned: Boolean,
  banReason: String,
  bannedBy: ObjectId (ref: User),
  lastLoginAt: Date,
  activeSessions: [{
    deviceId: String,
    userAgent: String,
    createdAt: Date,
    lastSeenAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Plan Schema

```javascript
{
  name: String (unique),
  description: String,
  price: Number,
  currency: String,
  duration: Number,
  billingCycle: "monthly" | "yearly",
  videoQuality: "SD" | "HD" | "FHD" | "4K",
  maxDevices: Number,
  hasAds: Boolean,
  features: [String],
  isActive: Boolean,
  isRecommended: Boolean,
  displayOrder: Number,
  createdBy: ObjectId (ref: User),
  subscriptionCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription Schema

```javascript
{
  userId: ObjectId (ref: User),
  planId: ObjectId (ref: Plan),
  startDate: Date,
  expiryDate: Date,
  isActive: Boolean,
  autoRenew: Boolean,
  paymentStatus: "pending" | "paid" | "failed" | "refunded",
  transactionRef: String,
  amount: Number,
  currency: String,
  cancelledAt: Date,
  cancelledReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog Schema

```javascript
{
  actorId: ObjectId (ref: User),
  actorRole: String,
  action: String,           // e.g., "BAN_USER", "CREATE_PLAN"
  entity: String,           // "User", "Plan", "Subscription"
  entityId: String,
  metadata: Mixed,          // Context-specific data
  ip: String,
  userAgent: String,
  createdAt: Date
}
```

---

## Role Capabilities

### Super Admin
- ✅ Create/Delete admin and moderator accounts
- ✅ Assign roles to any user
- ✅ Ban/Unban any user
- ✅ Create/Edit/Delete subscription plans
- ✅ View full analytics and revenue
- ✅ View system audit logs
- ✅ Manage all content
- ✅ Access all settings

### Admin
- ✅ Manage regular users
- ✅ Assign moderator role
- ✅ Ban/Unban regular users (not admins)
- ✅ View limited analytics
- ✅ Manage content (approve/reject)
- ✅ View subscription stats (cannot modify plans)
- ✅ Assign subscriptions to users
- ✅ View reports

### Moderator
- ✅ Moderate user-generated content
- ✅ Approve/Reject posts/comments
- ✅ Handle user reports
- ✅ View basic analytics
- ✅ No access to user management
- ✅ No access to revenue or billing
- ✅ No access to system settings

---

## Frontend Components

### Main Dashboard Component

```javascript
import DashboardOverviewClient from "@/components/admin/dashboard-overview-v2";

export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <DashboardOverviewClient userRole="admin" />
    </div>
  );
}
```

### Protected Route Example

```javascript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAdminAuth } from "@/lib/admin-api";

export default function AdminOnlyPage() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const auth = await checkAdminAuth();
      if (!auth.user) {
        router.push("/signin");
      }
    };

    verify();
  }, [router]);

  return <div>Admin content here</div>;
}
```

---

## Common Workflows

### Creating a New Admin User

```javascript
// 1. Call API
const response = await fetch("/api/admin/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "New Admin",
    email: "newadmin@example.com",
    password: "SecurePass@123",
    role: "admin"
  })
});

// 2. User receives temporary password via email
// 3. User logs in and changes password
```

### Promoting a User to Moderator

```javascript
// PATCH /api/admin/users/[userId]/role
{
  role: "moderator"
}
```

### Creating a Subscription for User

```javascript
// 1. Get plans
const plansRes = await fetch("/api/admin/plans");
const plans = await plansRes.json();

// 2. Create subscription
const subRes = await fetch("/api/admin/subscriptions", {
  method: "POST",
  body: JSON.stringify({
    userId: "userId",
    planId: plans.items[0]._id
  })
});
```

### Banning a User

```javascript
// PATCH /api/admin/users/[userId]/ban
{
  action: "ban",
  reason: "Policy violation"
}
```

---

## Troubleshooting

### "Unauthorized" Response

- Check if user is logged in
- Verify JWT token in cookies
- Check if user role has required permissions

### "Forbidden" Response

- User role doesn't have permission for this action
- Check role hierarchy in `/src/lib/rbac.js`

### Analytics Not Loading

- Verify database connection
- Check if user has analytics permission
- Review server error logs

### Seed Script Fails

- Verify `MONGODB_URI` is set correctly
- Check database connection
- Ensure Models are properly imported

---

## Performance Optimization

### Database Indexes

```javascript
// Already implemented in models:
// User: email (unique), role, createdAt
// Subscription: userId+isActive, planId, expiryDate
// Plan: name (unique), displayOrder, price
// AuditLog: createdAt, actorId+createdAt
```

### API Response Caching

```javascript
// Implement caching for analytics
const analyticsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### Pagination Best Practices

- Always implement pagination (default: limit=10)
- Maximum limit: 100 records per page
- Sort by `createdAt: -1` for consistency

---

## Deployment Instructions

### Production Deployment

1. **Environment Setup**
   ```bash
   export MONGODB_URI="production_mongodb_uri"
   export JWT_SECRET="$(openssl rand -hex 32)"
   export NODE_ENV="production"
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Run**
   ```bash
   npm start
   ```

4. **Verify**
   - Test login flow
   - Verify role-based access
   - Check audit logging
   - Monitor error rates

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

- Failed authentication attempts
- API error rates
- Database response times
- Token refresh frequency
- Unauthorized access attempts

### Sample Monitoring Query

```javascript
// Count failed logins in last hour
AuditLog.countDocuments({
  action: "LOGIN_FAILED",
  createdAt: { $gte: new Date(Date.now() - 3600000) }
});
```

---

## Support & Documentation

- Security Guide: [SECURITY_AND_DEPLOYMENT.md](./SECURITY_AND_DEPLOYMENT.md)
- RBAC Config: `/src/lib/rbac.js`
- API Utils: `/src/lib/admin-api.js`
- Models: `/src/models/`
