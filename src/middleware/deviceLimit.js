const PLAN_LIMITS = {
  free: 1,
  premium: 4,
};

const DEVICE_ID_REGEX = /^[a-zA-Z0-9_-]{8,128}$/;

export function getPlanDeviceLimit(plan = "free") {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function validateDeviceId(deviceId) {
  return typeof deviceId === "string" && DEVICE_ID_REGEX.test(deviceId);
}

export function normalizeDeviceContext({ deviceId, userAgent }) {
  return {
    deviceId: deviceId?.trim(),
    userAgent: (userAgent || "").slice(0, 255),
  };
}

export function enforceDeviceLimit(user, deviceId) {
  const activeSessions = Array.isArray(user.activeSessions)
    ? user.activeSessions
    : [];

  const deviceLimit = getPlanDeviceLimit(user.plan);
  const alreadyExists = activeSessions.some(
    (session) => session.deviceId === deviceId
  );

  if (!alreadyExists && activeSessions.length >= deviceLimit) {
    return {
      allowed: false,
      error: `Device limit reached for ${user.plan} plan. Allowed devices: ${deviceLimit}.`,
      deviceLimit,
      activeDevices: activeSessions.length,
    };
  }

  return {
    allowed: true,
    deviceLimit,
    activeDevices: activeSessions.length,
  };
}

export function downgradeExpiredPremium(user) {
  if (
    user.plan === "premium" &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) < new Date()
  ) {
    user.plan = "free";
    user.subscriptionExpiresAt = null;
  }
}

export function upsertDeviceSession(user, { deviceId, userAgent }) {
  const now = new Date();
  const sessions = Array.isArray(user.activeSessions) ? user.activeSessions : [];
  const existingIndex = sessions.findIndex(
    (session) => session.deviceId === deviceId
  );

  if (existingIndex >= 0) {
    sessions[existingIndex].lastSeenAt = now;
    sessions[existingIndex].userAgent = userAgent;
    user.activeSessions = sessions;
    return;
  }

  sessions.push({
    deviceId,
    userAgent,
    createdAt: now,
    lastSeenAt: now,
  });

  user.activeSessions = sessions;
}

export function removeDeviceSession(user, deviceId) {
  const sessions = Array.isArray(user.activeSessions) ? user.activeSessions : [];
  user.activeSessions = sessions.filter((session) => session.deviceId !== deviceId);
}
