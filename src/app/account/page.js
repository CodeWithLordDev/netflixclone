"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString();
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [payments, setPayments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [methods, setMethods] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ name: "", type: "personal" });
  const [methodForm, setMethodForm] = useState({
    brand: "",
    last4: "",
    expMonth: "",
    expYear: "",
    isDefault: false,
  });

  useEffect(() => {
    setProfiles(Array.isArray(user?.profiles) ? user.profiles : []);
  }, [user]);

  useEffect(() => {
    let active = true;

    async function loadAccountData() {
      setPageLoading(true);

      try {
        const [meRes, payRes, profRes, methRes, notifRes] = await Promise.all([
          refreshUser(),
          fetch("/api/payments/history"),
          fetch("/api/profiles"),
          fetch("/api/payment-methods"),
          fetch("/api/notifications"),
        ]);

        if (!active) return;

        const me = meRes;

        if (payRes.ok) setPayments((await payRes.json())?.items || []);
        if (profRes.ok) setProfiles((await profRes.json())?.items || me?.profiles || []);
        if (methRes.ok) setMethods((await methRes.json())?.items || []);
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data?.items || []);
          setUnread(data?.unread || 0);
        }
      } finally {
        if (active) setPageLoading(false);
      }
    }

    loadAccountData();

    return () => {
      active = false;
    };
  }, [refreshUser]);

  async function addProfile(event) {
    event.preventDefault();
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      const data = await res.json();
      setProfiles(data?.items || []);
      setProfileForm({ name: "", type: "personal" });
      await refreshUser();
    }
  }

  async function updateProfile(id, patch) {
    const res = await fetch("/api/profiles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfiles(data?.items || []);
      await refreshUser();
    }
  }

  async function deleteProfile(id) {
    const res = await fetch("/api/profiles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfiles(data?.items || []);
      await refreshUser();
    }
  }

  async function addMethod(event) {
    event.preventDefault();
    const res = await fetch("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(methodForm),
    });
    if (res.ok) {
      const data = await res.json();
      setMethods(data?.items || []);
      setMethodForm({ brand: "", last4: "", expMonth: "", expYear: "", isDefault: false });
    }
  }

  async function removeMethod(id) {
    const res = await fetch("/api/payment-methods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      setMethods(data?.items || []);
    }
  }

  async function cancelSubscription() {
    const res = await fetch("/api/subscription/cancel", { method: "POST" });
    if (res.ok) {
      await refreshUser();
    }
  }

  async function markAllRead() {
    const res = await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setUnread(data?.unread || 0);
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );
    }
  }

  async function markRead(id) {
    const res = await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const data = await res.json();
      setUnread(data?.unread || 0);
      setNotifications((current) =>
        current.map((item) =>
          item._id === id ? { ...item, readAt: new Date().toISOString() } : item
        )
      );
    }
  }

  const displayName = useMemo(() => {
    return user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "StreamFlix User";
  }, [user]);

  const loading = authLoading || pageLoading;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0f] px-6 py-10 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a1a2e,#0b0b0f_60%)]" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid-glow" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Account</h1>
            <p className="text-sm text-white/60">
              {loading ? "Loading..." : `Manage ${displayName}'s subscription, profiles, and notifications.`}
            </p>
          </div>
          <button
            onClick={() => router.push("/browse")}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Back to Browse
          </button>
        </header>

        <section className="card-3d rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold">Billing / Subscription</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="panel rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/60">Current plan</p>
              <p className="text-lg font-semibold">
                {loading ? "Loading..." : user?.subscriptionPlan || user?.plan || "Free"}
              </p>
              <p className="text-xs text-white/50">
                Status: {loading ? "Loading..." : user?.subscriptionStatus || "active"}
              </p>
              <p className="mt-2 text-xs text-white/50">
                Expires on: {loading ? "Loading..." : formatDate(user?.subscriptionExpiresAt)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => router.push("/subscription")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
                >
                  Upgrade / Downgrade
                </button>
                <button
                  onClick={cancelSubscription}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            <div className="panel rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/60">Payment history</p>
              <div className="mt-3 space-y-2 text-sm">
                {loading ? (
                  <p className="text-white/50">Loading...</p>
                ) : payments.length === 0 ? (
                  <p className="text-white/50">No payments found.</p>
                ) : (
                  payments.map((payment) => (
                    <div
                      key={payment._id}
                      className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2"
                    >
                      <span>
                        {formatCurrency(payment?.amount)} • {payment?.status || "Pending"}
                      </span>
                      <span className="text-white/50">{formatDate(payment?.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="panel mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-white/60">Add payment method</p>
            <form onSubmit={addMethod} className="mt-3 grid gap-3 md:grid-cols-5">
              <input
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                placeholder="Brand"
                value={methodForm.brand}
                onChange={(event) => setMethodForm((current) => ({ ...current, brand: event.target.value }))}
                required
              />
              <input
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                placeholder="Last 4"
                value={methodForm.last4}
                onChange={(event) => setMethodForm((current) => ({ ...current, last4: event.target.value }))}
                required
              />
              <input
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                placeholder="Exp MM"
                value={methodForm.expMonth}
                onChange={(event) => setMethodForm((current) => ({ ...current, expMonth: event.target.value }))}
              />
              <input
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                placeholder="Exp YY"
                value={methodForm.expYear}
                onChange={(event) => setMethodForm((current) => ({ ...current, expYear: event.target.value }))}
              />
              <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                Add
              </button>
            </form>
            <div className="mt-3 space-y-2 text-sm">
              {loading ? (
                <p className="text-white/50">Loading...</p>
              ) : methods.length === 0 ? (
                <p className="text-white/50">No payment methods saved.</p>
              ) : (
                methods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2"
                  >
                    <span>
                      {method?.brand || "Card"} • **** {method?.last4 || "0000"}
                    </span>
                    <button
                      onClick={() => removeMethod(method.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="card-3d rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold">Profiles</h2>
          <form onSubmit={addProfile} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              placeholder="Profile name"
              value={profileForm.name}
              onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <select
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={profileForm.type}
              onChange={(event) => setProfileForm((current) => ({ ...current, type: event.target.value }))}
            >
              <option value="kids">Kids</option>
              <option value="personal">Personal</option>
              <option value="family">Family</option>
            </select>
            <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
              Add Profile
            </button>
          </form>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {loading ? (
              <p className="text-white/50">Loading...</p>
            ) : profiles.length === 0 ? (
              <p className="text-white/50">No profiles yet.</p>
            ) : (
              profiles.map((profile) => (
                <div key={profile.id || profile._id || profile.name} className="panel rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-lg font-semibold">{profile?.name || "Unnamed profile"}</p>
                  <p className="text-xs capitalize text-white/60">{profile?.type || "personal"}</p>
                  <div className="mt-3 flex gap-2">
                    {!profile?.isDefault && (
                      <button
                        onClick={() => updateProfile(profile.id || profile._id, { isDefault: true })}
                        className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => deleteProfile(profile.id || profile._id)}
                      className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-300 hover:bg-red-500/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card-3d rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button onClick={markAllRead} className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
              Mark all read ({unread})
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {loading ? (
              <p className="text-white/50">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="text-white/50">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="panel rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{notification?.title || "Notification"}</p>
                    <span className="text-xs text-white/50">{formatDate(notification?.createdAt)}</span>
                  </div>
                  <p className="text-white/70">{notification?.message || "No details available."}</p>
                  {!notification?.readAt && (
                    <button
                      onClick={() => markRead(notification._id)}
                      className="mt-2 text-xs text-red-300 hover:text-red-200"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .orb {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.35;
          animation: float 10s ease-in-out infinite;
        }
        .orb-a {
          background: radial-gradient(circle, rgba(229,9,20,0.6), transparent 60%);
          top: -140px;
          left: -120px;
        }
        .orb-b {
          background: radial-gradient(circle, rgba(79,70,229,0.5), transparent 60%);
          bottom: -160px;
          right: -80px;
          animation-delay: 1.5s;
        }
        .orb-c {
          background: radial-gradient(circle, rgba(16,185,129,0.4), transparent 60%);
          top: 40%;
          left: 60%;
          animation-delay: 3s;
        }
        .grid-glow {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(transparent 95%, rgba(255,255,255,0.04) 96%),
            linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.04) 96%);
          background-size: 50px 50px;
          opacity: 0.25;
          transform: perspective(800px) rotateX(65deg) translateY(120px);
        }
        .card-3d {
          perspective: 1200px;
        }
        .card-3d:hover {
          transform: translateY(-2px);
        }
        .panel {
          transition: transform 300ms ease, box-shadow 300ms ease, border-color 300ms ease;
        }
        .panel:hover {
          transform: rotateX(2deg) rotateY(-3deg) translateY(-2px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          border-color: rgba(255,255,255,0.2);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
      `}</style>
    </div>
  );
}
