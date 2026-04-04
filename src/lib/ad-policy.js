const DEFAULT_POLICY = {
  enabled: false,
  minAds: 0,
  maxAds: 0,
  minStart: 30,
  maxStart: 35,
  minGap: 60,
  maxGap: 90,
  outroBuffer: 45,
  skipAfter: 5,
};

export const AD_POLICY_BY_PLAN = {
  free: {
    enabled: true,
    minAds: 3,
    maxAds: 5,
    minStart: 25,
    maxStart: 32,
    minGap: 45,
    maxGap: 70,
    outroBuffer: 45,
    skipAfter: 5,
  },
  basic: {
    enabled: true,
    minAds: 1,
    maxAds: 2,
    minStart: 30,
    maxStart: 40,
    minGap: 60,
    maxGap: 100,
    outroBuffer: 50,
    skipAfter: 5,
  },
  premium: {
    enabled: false,
    minAds: 0,
    maxAds: 0,
    minStart: 0,
    maxStart: 0,
    minGap: 0,
    maxGap: 0,
    outroBuffer: 0,
    skipAfter: 0,
  },
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  if (max <= min) return min;
  return min + Math.random() * (max - min);
}

export function normalizeViewerPlan(plan) {
  const value = String(plan || "").trim().toLowerCase();

  if (!value) return "free";
  if (value.includes("premium")) return "premium";
  if (value.includes("basic")) return "basic";
  if (value.includes("standard")) return "basic";
  if (value.includes("free")) return "free";

  return "free";
}

export function getAdPolicy(plan) {
  const normalizedPlan = normalizeViewerPlan(plan);
  return {
    plan: normalizedPlan,
    ...DEFAULT_POLICY,
    ...(AD_POLICY_BY_PLAN[normalizedPlan] || DEFAULT_POLICY),
  };
}

export function estimateAdCount(duration, plan) {
  const policy = getAdPolicy(plan);

  if (!policy.enabled || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  const maxSafeSlots = Math.max(
    0,
    Math.floor((duration - policy.minStart - policy.outroBuffer) / policy.minGap) + 1
  );

  if (maxSafeSlots === 0) {
    return 0;
  }

  const pacingUnit = policy.plan === "free" ? 420 : 900;
  const dynamicCount = clamp(
    Math.round(duration / pacingUnit),
    policy.minAds,
    policy.maxAds
  );

  return Math.min(dynamicCount, maxSafeSlots);
}

export function buildAdSchedule(duration, plan) {
  const policy = getAdPolicy(plan);
  const adCount = estimateAdCount(duration, plan);

  if (!policy.enabled || adCount === 0) {
    return [];
  }

  const times = [];

  for (let index = 0; index < adCount; index += 1) {
    const remainingAds = adCount - index - 1;
    const minTime =
      index === 0 ? policy.minStart : times[index - 1] + policy.minGap;
    const maxByGap =
      index === 0 ? policy.maxStart : times[index - 1] + policy.maxGap;
    const maxByTail =
      duration - policy.outroBuffer - remainingAds * policy.minGap;
    const maxTime = Math.floor(Math.min(maxByGap, maxByTail));

    if (maxTime < minTime) {
      break;
    }

    times.push(Math.round(randomBetween(minTime, maxTime)));
  }

  return times;
}
