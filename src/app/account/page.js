"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [payments, setPayments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [methods, setMethods] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [profileForm, setProfileForm] = useState({ name: "", type: "personal" });
  const [methodForm, setMethodForm] = useState({ brand: "", last4: "", expMonth: "", expYear: "", isDefault: false });

  useEffect(() => {
    (async () => {
      const [meRes, subRes, payRes, profRes, methRes, notifRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/subscription"),
        fetch("/api/payments/history"),
        fetch("/api/profiles"),
        fetch("/api/payment-methods"),
        fetch("/api/notifications"),
      ]);

      if (meRes.ok) setMe(await meRes.json());
      if (subRes.ok) await subRes.json();
      if (payRes.ok) setPayments((await payRes.json()).items || []);
      if (profRes.ok) setProfiles((await profRes.json()).items || []);
      if (methRes.ok) setMethods((await methRes.json()).items || []);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.items || []);
        setUnread(data.unread || 0);
      }
    })();
  }, []);

  async function addProfile(e) {
    e.preventDefault();
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      const data = await res.json();
      setProfiles(data.items || []);
      setProfileForm({ name: "", type: "personal" });
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
      setProfiles(data.items || []);
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
      setProfiles(data.items || []);
    }
  }

  async function addMethod(e) {
    e.preventDefault();
    const res = await fetch("/api/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(methodForm),
    });
    if (res.ok) {
      const data = await res.json();
      setMethods(data.items || []);
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
      setMethods(data.items || []);
    }
  }

  async function cancelSubscription() {
    const res = await fetch("/api/subscription/cancel", { method: "POST" });
    if (res.ok) {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) setMe(await meRes.json());
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
      setUnread(data.unread || 0);
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
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
      setUnread(data.unread || 0);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0f] text-white px-6 py-10">
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
            <p className="text-sm text-white/60">Manage your subscription, profiles, and notifications.</p>
          </div>
          <button
            onClick={() => router.push("/browse")}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
          >
            ? Back to Browse
          </button>
        </header>

        <section className="card-3d rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold">?? Billing / Subscription</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="panel rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/60">Current plan</p>
              <p className="text-lg font-semibold">
                {me?.subscriptionPlan || me?.plan || "Free"}
              </p>
              <p className="text-xs text-white/50">
                Status: {me?.subscriptionStatus || "active"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => router.push("/subscription")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700">
                  Upgrade / Downgrade
                </button>
                <button onClick={cancelSubscription} className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
                  Cancel Subscription
                </button>
              </div>
            </div>
            <div className="panel rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/60">Payment history</p>
              <div className="mt-3 space-y-2 text-sm">
                {payments.length === 0 ? (
                  <p className="text-white/50">No payments found.</p>
                ) : (
                  payments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                      <span>?{p.amount} ? {p.status}</span>
                      <span className="text-white/50">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="panel mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
            <p className="text-sm text-white/60">Add payment method</p>
            <form onSubmit={addMethod} className="mt-3 grid gap-3 md:grid-cols-5">
              <input className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm" placeholder="Brand" value={methodForm.brand} onChange={(e) => setMethodForm((f) => ({ ...f, brand: e.target.value }))} required />
              <input className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm" placeholder="Last 4" value={methodForm.last4} onChange={(e) => setMethodForm((f) => ({ ...f, last4: e.target.value }))} required />
              <input className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm" placeholder="Exp MM" value={methodForm.expMonth} onChange={(e) => setMethodForm((f) => ({ ...f, expMonth: e.target.value }))} />
              <input className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm" placeholder="Exp YY" value={methodForm.expYear} onChange={(e) => setMethodForm((f) => ({ ...f, expYear: e.target.value }))} />
              <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Add</button>
            </form>
            <div className="mt-3 space-y-2 text-sm">
              {methods.length === 0 ? (
                <p className="text-white/50">No payment methods saved.</p>
              ) : (
                methods.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
                    <span>{m.brand} ? **** {m.last4}</span>
                    <button onClick={() => removeMethod(m.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="card-3d rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <h2 className="text-xl font-semibold">???????? Profiles</h2>
          <form onSubmit={addProfile} className="mt-4 grid gap-3 md:grid-cols-3">
            <input className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm" placeholder="Profile name" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} required />
            <select className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm" value={profileForm.type} onChange={(e) => setProfileForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="kids">Kids</option>
              <option value="personal">Personal</option>
              <option value="family">Family</option>
            </select>
            <button className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Add Profile</button>
          </form>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {profiles.length === 0 ? (
              <p className="text-white/50">No profiles yet.</p>
            ) : (
              profiles.map((p) => (
                <div key={p.id} className="panel rounded-xl border border-white/10 bg-black/30 p-4">
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="text-xs text-white/60 capitalize">{p.type}</p>
                  <div className="mt-3 flex gap-2">
                    {!p.isDefault && (
                      <button onClick={() => updateProfile(p.id, { isDefault: true })} className="text-xs rounded bg-white/10 px-2 py-1 hover:bg-white/20">Set Default</button>
                    )}
                    <button onClick={() => deleteProfile(p.id)} className="text-xs rounded bg-red-500/20 px-2 py-1 text-red-300 hover:bg-red-500/30">Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card-3d rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">?? Notifications</h2>
            <button onClick={markAllRead} className="text-xs rounded bg-white/10 px-2 py-1 hover:bg-white/20">
              Mark all read ({unread})
            </button>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {notifications.length === 0 ? (
              <p className="text-white/50">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className="panel rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{n.title}</p>
                    <span className="text-xs text-white/50">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/70">{n.message}</p>
                  {!n.readAt && (
                    <button onClick={() => markRead(n._id)} className="mt-2 text-xs text-red-300 hover:text-red-200">
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
