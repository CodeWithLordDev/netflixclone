# 🎬 StreamFlix Clone - Admin System

A production-ready admin dashboard system with 3 specialized dashboards, built with Next.js 16, MongoDB, JWT authentication, and Tailwind CSS.

## 📋 Overview

This admin system provides comprehensive management and moderation capabilities across three distinct dashboards:

- **Super Admin Dashboard**: Full system control, user/plan management, analytics & revenue
- **Admin Dashboard**: User management, content moderation, limited analytics
- **Moderator Dashboard**: Content moderation, report handling, basic analytics

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with access & refresh tokens
- HTTP-only secure cookies with CSRF protection
- Role-based access control (RBAC) with 4-tier hierarchy
- Centralized permission matrix system
- Session management with device tracking
- Automatic token rotation and revocation

### 👥 User Management
- Create, read, update, delete user accounts
- Role assignment and promotion/demotion
- User banning/unbanning with audit trails
- Activity tracking and last login timestamps
- User status management (active/inactive)

### 💳 Subscription Management
- Plan creation and configuration (Super Admin only)
- Tiered pricing: Free, Basic, Standard, Premium
- Subscription lifecycle management
- Auto-renewal configuration
- Plan modification and deactivation
- Subscription count tracking per plan

### 📊 Advanced Analytics
- Real-time dashboard metrics
- User growth trends
- Revenue analysis and trends
- Plan distribution visualization
- Churn rate calculation
- Recent activity logging
- Role-specialized data views

### 🛡️ Security & Compliance
- Password hashing with bcrypt (10 salt rounds)
- Comprehensive audit logging
- Action tracking for all admin operations
- IP and user-agent logging
- Rate limiting support
- CSRF protection via SameSite cookies
- Input validation with Zod schema
- XSS protection through React escaping

### 🎨 Modern UI/UX
- Glassmorphism design inspired by Stripe/Linear/Vercel
- Responsive grid-based layout
- Smooth animations with Framer Motion
- Dark/Light theme support
- Loading skeletons for better UX
- Toast notifications (ready for integration)
- Tailwind CSS with custom design tokens
- Fully accessible components

### 📈 Performance Optimized
- Database indexing on critical fields
- Pagination support (max 100 records/page)
- Lean queries for faster responses
- Connection pooling
- Efficient aggregation pipelines

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── admin/
│   │       ├── users/              # User management API
│   │       ├── subscriptions/       # Subscription API
│   │       ├── plans/              # Plan management API
│   │       ├── analytics/          # Dashboard analytics API
│   │       ├── reports/            # Report management API
│   │       └── audit-logs/         # System audit logs
│   └── admin/
│       ├── page.js                 # Main dashboard
│       ├── users/                  # User management pages
│       ├── subscriptions/           # Subscription pages
│       ├── plans/                  # Plans management
│       └── analytics/              # Analytics views
├── components/
│   └── admin/
│       ├── dashboard-overview-v2.js    # Main dashboard
│       ├── users-management-table.js   # User table
│       ├── admin-sidebar.js            # Navigation
│       ├── admin-topbar.js             # Top bar
│       ├── metric-card.js              # Metric cards
│       └── (other components)
├── models/
│   ├── User.js
│   ├── Plan.js
│   ├── Subscription.js
│   ├── Revenue.js
│   ├── Report.js
│   ├── AuditLog.js
│   ├── Notification.js
│   └── RefreshToken.js
├── middleware/
│   ├── auth.js                 # JWT verification
│   └── role.js                 # Role-based access
└── lib/
    ├── rbac.js                 # RBAC configuration
    ├── admin-api.js            # Admin API utilities
    ├── jwt.js                  # JWT helpers
    ├── mongodb.js              # Database connection
    └── auth-service.js         # Authentication logic

scripts/
├── seed-admin-system.js        # Test data population

docs/
├── ADMIN_SYSTEM_GUIDE.md       # Complete usage guide
└── SECURITY_AND_DEPLOYMENT.md  # Security best practices
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Create .env.local
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/authdb
JWT_SECRET=$(openssl rand -hex 32)  # Generate 32-byte secret
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Populate Test Data

```bash
node scripts/seed-admin-system.js
```

### 4. Start Development Server

```bash
npm run dev
# Open http://localhost:3000/admin
```

### 5. Login with Test Credentials

```
Super Admin: superadmin@example.com / SuperAdmin@123
Admin: admin@example.com / Admin@123
Moderator: moderator@example.com / Moderator@123
User: user1@example.com / User@123
```

## 🔑 Key Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16+ | Full-stack framework with App Router |
| **React** | 19+ | UI library |
| **MongoDB** | 5.0+ | Document database |
| **Mongoose** | 9+ | ODM for MongoDB |
| **JWT** | 9+ | Authentication tokens |
| **bcryptjs** | 3+ | Password hashing |
| **Tailwind CSS** | 4 | Styling |
| **Recharts** | 3+ | Data visualization |
| **Framer Motion** | 11+ | Animations |
| **Zod** | 3+ | Schema validation |

## 📚 API Endpoints

### User Management
```
GET    /api/admin/users-list                  List users with filters
POST   /api/admin/users                       Create new user
GET    /api/admin/users/[id]                  Get user details
PATCH  /api/admin/users/[id]                  Update user
DELETE /api/admin/users/[id]                  Delete user
PATCH  /api/admin/users/[id]/role             Update user role
PATCH  /api/admin/users/[id]/ban              Ban/Unban user
```

### Subscription Management
```
GET    /api/admin/subscriptions               List subscriptions
POST   /api/admin/subscriptions               Create subscription
```

### Plan Management
```
GET    /api/admin/plans                       List plans
POST   /api/admin/plans                       Create plan
GET    /api/admin/plans/[id]                  Get plan details
PATCH  /api/admin/plans/[id]                  Update plan
DELETE /api/admin/plans/[id]                  Delete plan
```

### Analytics
```
GET    /api/admin/analytics                   Get dashboard analytics
```

## 🔐 Role Hierarchy & Permissions

### Super Admin (Level 4)
- Full system access
- Create/Delete admin users
- Assign all roles
- Ban any user
- Create/Edit/Delete plans
- View all analytics & revenue
- Access audit logs
- System settings

### Admin (Level 3)
- Manage regular users
- Assign moderator role
- Ban regular users
- Limited analytics view
- Content management
- View subscriptions (no modification)
- Create subscriptions for users

### Moderator (Level 2)
- Moderate content
- Approve/Reject posts
- Handle reports
- View basic analytics
- No user management
- No billing access

### User (Level 1)
- Access own profile
- View subscriptions
- Limited to user-level features

## 📊 Database Models

### User
- Authentication & profile info
- Role assignment
- Ban/Suspension tracking
- Session management
- Last login tracking

### Plan
- Pricing and features
- Quality tiers (SD, HD, FHD, 4K)
- Device limits
- Display ordering
- Active/Recommended status

### Subscription
- User-Plan relationship
- Billing cycle tracking
- Payment status
- Auto-renewal settings
- Cancellation tracking

### Revenue
- Transaction tracking
- Payment completion status
- Billing period tracking
- Refund management

### Report
- Content/User reports
- Status tracking
- Priority levels
- Assignment tracking
- Resolution notes

### AuditLog
- Action timestamp
- Actor information
- Target details
- Metadata preservation
- Immutable records

## 🛡️ Security Features

- ✅ JWT authentication with short-lived tokens (15m)
- ✅ Refresh token rotation (7 days)
- ✅ HTTP-only secure cookies
- ✅ CSRF protection via SameSite
- ✅ bcrypt password hashing
- ✅ Comprehensive audit logging
- ✅ Role-based access control
- ✅ Input validation with Zod
- ✅ XSS protection
- ✅ Rate limiting ready
- ✅ SQL injection prevention
- ✅ Session per-device tracking

## 📝 Documentation

- **[Admin System Guide](./docs/ADMIN_SYSTEM_GUIDE.md)** - Complete usage guide, API reference, workflows
- **[Security & Deployment](./docs/SECURITY_AND_DEPLOYMENT.md)** - Security best practices, deployment checklist

## 🧪 Testing

### Running Seed Script
```bash
node scripts/seed-admin-system.js
```

### Manual Testing Flow
1. Sign in as Super Admin
2. Create a new Admin account
3. Assign a user as Moderator
4. Create a subscription plan
5. Assign subscription to user
6. View analytics dashboard
7. Check audit logs

## 📦 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t admin-system .
docker run -p 3000:3000 admin-system
```

## 🚨 Environment Variables (Production)

```bash
# Database (use Atlas or self-hosted with TLS)
MONGODB_URI=mongodb+srv://...

# Security (use strong secrets)
JWT_SECRET=<32+ character random string>

# Environment
NODE_ENV=production

# Cookie Security
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# CORS & Domain
API_DOMAIN=https://yourdomain.com

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔄 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups set up
- [ ] SSL/TLS certificate installed
- [ ] Rate limiting configured
- [ ] CORS origins set
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] Backup restoration tested
- [ ] Security audit completed
- [ ] Load testing performed

## 📞 Troubleshooting

### JWT Error
- Verify `JWT_SECRET` is set
- Ensure tokens haven't expired
- Check cookie settings in browser

### Database Connection Failed
- Verify `MONGODB_URI` is correct
- Check network connectivity
- Ensure database user has proper permissions

### Permission Denied
- Check user's role
- Verify role permissions in `/src/lib/rbac.js`
- Check role hierarchy

### Analytics Not Loading
- Verify database connection
- Check if user has analytics permission
- Review server error logs

## 📄 License

StreamFlix Clone - Admin System © 2024

## 🤝 Contributing

To contribute to this admin system:

1. Follow the existing code structure
2. Maintain security best practices
3. Update documentation
4. Test thoroughly
5. Submit detailed PR descriptions

## 📞 Support

For issues and support:
1. Check documentation
2. Review security guide
3. Check troubleshooting section
4. Review error logs

---

**Built with ❤️ using Next.js, MongoDB, and Tailwind CSS**
