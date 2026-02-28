# 🔐 Admin System - Security & Deployment Guide

## Table of Contents
1. [Security Architecture](#security-architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Environment Variables](#environment-variables)
4. [Database Security](#database-security)
5. [API Security](#api-security)
6. [Deployment Checklist](#deployment-checklist)
7. [Monitoring & Logging](#monitoring--logging)
8. [Incident Response](#incident-response)

---

## Security Architecture

### Role-Based Access Control (RBAC)

The system implements a 4-tier role hierarchy:

```
SUPERADMIN (4) - Full system access
    ↓
ADMIN (3) - User & subscription management
    ↓
MODERATOR (2) - Content moderation & reports
    ↓
USER (1) - Basic access
```

### Permission Matrix

All permissions are defined in `/src/lib/rbac.js`:

- **Users**: View, Create, Update, Delete, Ban, AssignRole
- **Subscriptions**: View, Create, Update, Cancel
- **Plans**: Create, Read, Update, Delete (Super Admin only)
- **Analytics**: View basic (Moderator+), View detailed (Admin+), View revenue (Super Admin)
- **Reports**: View & Manage (Moderator+)
- **Logs**: View (Super Admin only)

---

## Authentication & Authorization

### JWT Tokens

```javascript
// Access Token (15 minutes)
{
  id: "user_id",
  email: "user@example.com",
  role: "admin",
  expiresIn: "15m"
}

// Refresh Token (7 days)
{
  id: "user_id",
  type: "refresh",
  nonce: "random_hex_string",
  expiresIn: "7d"
}
```

### Token Storage

- **Access Token**: HTTP-only cookie + secure flag
- **Refresh Token**: HTTP-only cookie + secure flag + SameSite=Lax
- Both stored in cookies for automatic CSRF protection

### Token Rotation

```javascript
// Tokens are rotated on each refresh
// Old refresh token is immediately revoked
// New refresh token is issued
```

### Session Management

```javascript
// Single session per user per device
const session = {
  deviceId: "unique_device_id",
  userAgent: "browser_info",
  createdAt: Date,
  lastSeenAt: Date,
  status: "active"
}
```

---

## Environment Variables

### Required Variables

```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/authdb

# JWT
JWT_SECRET=your_very_secure_secret_key_min_32_chars_preferred

# Node Environment
NODE_ENV=production

# API
API_PORT=3000
API_DOMAIN=https://yourdomain.com

# Cookies
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax

# Rate Limiting (optional but recommended)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/app.log
```

### Secure Secret Generation

```bash
# Generate a secure JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Security

### MongoDB Best Practices

1. **Connection Security**
   ```javascript
   // Always use connection pooling
   mongoose.connect(MONGODB_URI, {
     maxPoolSize: 10,
     minPoolSize: 5,
     retryWrites: true,
     w: "majority",
   });
   ```

2. **Indexes for Security**
   ```javascript
   // Index on email for unique constraint
   UserSchema.index({ email: 1 }, { unique: true });
   
   // Index on role for permission queries
   UserSchema.index({ role: 1 });
   
   // Index for audit logs
   AuditLogSchema.index({ createdAt: -1 });
   AuditLogSchema.index({ actorId: 1, createdAt: -1 });
   ```

3. **Data Encryption**
   - Passwords: bcrypt with salt rounds = 10
   - Sensitive data: Consider field-level encryption
   - Connection: Always use TLS/SSL

4. **Backup Strategy**
   ```bash
   # Daily backups
   mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)
   ```

---

## API Security

### Rate Limiting

```javascript
// Implement rate limiting per route
app.use("/api/admin/", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
}));
```

### Input Validation

All API endpoints validate input using Zod:

```javascript
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["user", "moderator", "admin", "superadmin"]),
});

const parsed = userSchema.safeParse(input);
if (!parsed.success) {
  return apiError("Invalid input", 400, parsed.error.flatten());
}
```

### CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.API_DOMAIN,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
};

app.use(cors(corsOptions));
```

### CSRF Protection

- Automatic via HTTP-only cookies with SameSite=Lax
- Implement Double Submit Cookie pattern for state-changing operations

### SQL/NoSQL Injection Prevention

```javascript
// DON'T do this
User.find({ email: req.query.email }); // Vulnerable

// DO this
const { email } = userSchema.parse(req.body);
User.findOne({ email }); // Safe
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set securely
- [ ] JWT_SECRET is minimum 32 characters
- [ ] Database backups configured
- [ ] SSL/TLS certificate installed
- [ ] Database connection uses TLS
- [ ] Rate limiting configured
- [ ] CORS origins configured
- [ ] Logging configured

### Post-Deployment

- [ ] Test authentication flow
- [ ] Verify role-based access
- [ ] Check audit logging
- [ ] Monitor error rates
- [ ] Verify backup execution
- [ ] Test rate limiting
- [ ] Confirm logging output

### Production Environment

```bash
# .env.production
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict

# Enable security headers
app.use(helmet());

# Enable HTTPS redirect
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## Monitoring & Logging

### Audit Logging

All admin actions are logged:

```javascript
await logAdminAction(
  userId,           // Who did it
  "BAN_USER",       // What action
  "User",           // Entity type
  targetUserId,     // What was affected
  { reason, ... }   // Details
);
```

### Access Logging

```javascript
// Log all API access
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.user?.role || 'anonymous'}`);
  next();
});
```

### Error Logging

```javascript
// Never expose internal errors to clients
catch (error) {
  console.error("Internal error:", error.stack);
  return apiError("An error occurred", 500);
}
```

### Metrics to Monitor

- Failed login attempts
- Failed permission checks
- Unusual API usage patterns
- Database connection errors
- Token refresh failures
- High response times

---

## Incident Response

### Security Incident Response Plan

#### 1. Suspected Token Compromise

```javascript
// Immediately revoke all user's tokens
await RefreshToken.updateMany(
  { userId },
  { $set: { revokedAt: new Date() } }
);

// Force re-authentication
// Send security alert to user email
```

#### 2. Unauthorized Access

```javascript
// 1. Identify affected resources
// 2. Issue immediate password reset
// 3. Force session logout
// 4. Log incident
// 5. Notify user
```

#### 3. Data Breach

```javascript
// 1. Stop the system
// 2. Investigate logs
// 3. Determine scope
// 4. Notify affected users
// 5. Reset compromised passwords
// 6. Restore from clean backup
```

---

## API Endpoint Security Summary

### User Management
```
GET    /api/admin/users              → Admin+
POST   /api/admin/users              → Super Admin
GET    /api/admin/users/[id]         → Admin+
PATCH  /api/admin/users/[id]         → Admin+
DELETE /api/admin/users/[id]         → Super Admin
PATCH  /api/admin/users/[id]/role    → Super Admin
PATCH  /api/admin/users/[id]/ban     → Admin+
```

### Subscription Management
```
GET    /api/admin/subscriptions      → Admin+
POST   /api/admin/subscriptions      → Admin+
```

### Plans Management
```
GET    /api/admin/plans              → Admin+
POST   /api/admin/plans              → Super Admin
GET    /api/admin/plans/[id]         → Admin+
PATCH  /api/admin/plans/[id]         → Super Admin
DELETE /api/admin/plans/[id]         → Super Admin
```

### Analytics
```
GET    /api/admin/analytics          → Moderator+
```

---

## Regular Security Tasks

- [ ] Weekly: Review audit logs
- [ ] Weekly: Monitor failed authentication attempts
- [ ] Monthly: Rotate sensitive keys
- [ ] Monthly: Security patching
- [ ] Quarterly: Penetration testing
- [ ] Quarterly: Access review
- [ ] Annually: Security audit

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/security-checklist/)
- [Next.js Security Best Practices](https://nextjs.org/docs/guides/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
