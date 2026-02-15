const DEVICE_KEY = "netflix_clone_device_id";

function makeDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `dev_${crypto.randomUUID()}`;
  }

  return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateDeviceId() {
  if (typeof window === "undefined") return null;

  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (deviceId) return deviceId;

  deviceId = makeDeviceId();
  localStorage.setItem(DEVICE_KEY, deviceId);
  return deviceId;
}
