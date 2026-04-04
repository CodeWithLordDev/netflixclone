import { normalizeViewerPlan } from "@/lib/ad-policy";

export function resolveViewerPlan({ subscription, user } = {}) {
  const normalizedUserPlan = normalizeViewerPlan(user?.plan);
  const subscriptionPlan = subscription?.planId || {};
  const planName = subscriptionPlan?.name || user?.subscriptionPlan || user?.plan;
  const normalizedByName = normalizeViewerPlan(planName);

  // The user document is the source of truth for explicit downgrades/cancellations.
  // If the account is already marked as free, we should keep ads enabled even if
  // an older subscription record still exists in the history table.
  if (normalizedUserPlan === "free") {
    return "free";
  }

  if (subscriptionPlan?.hasAds === false) {
    return "premium";
  }

  if (subscriptionPlan?.hasAds === true && normalizedByName === "premium") {
    return "basic";
  }

  if (normalizedByName !== "free" || String(planName || "").trim()) {
    return normalizedByName;
  }

  return normalizedUserPlan;
}
