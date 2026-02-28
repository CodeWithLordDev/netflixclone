"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import PlansGrid from "@/components/admin/subscriptions/plans-grid";
import PlanEditorModal from "@/components/admin/subscriptions/plan-editor-modal";
import AssignPlanModal from "@/components/admin/subscriptions/assign-plan-modal";
import PageSkeleton from "@/components/admin/common/page-skeleton";

export default function SubscriptionsPage() {
  const { push } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerRole, setViewerRole] = useState("moderator");
  const [editorOpen, setEditorOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const resolvePlanId = (plan) => {
    if (!plan) return "";
    if (typeof plan === "string") return plan.trim();
    if (typeof plan.id === "string" && plan.id.trim()) return plan.id.trim();
    if (typeof plan._id === "string" && plan._id.trim()) return plan._id.trim();
    return "";
  };

  const canManagePlans = useMemo(() => viewerRole === "superadmin", [viewerRole]);
  const canAssignPlans = useMemo(() => ["admin", "superadmin"].includes(viewerRole), [viewerRole]);

  const load = async () => {
    setLoading(true);
    try {
      const [meRes, plansRes] = await Promise.all([
        fetch("/api/admin/me", { cache: "no-store" }),
        fetch("/api/admin/plans?page=1&limit=50", { cache: "no-store" }),
      ]);
      const meData = await meRes.json();
      const plansData = await plansRes.json();

      if (meData?.user?.role) setViewerRole(meData.user.role);
      if (plansData?.error) throw new Error(plansData.error.message || "Failed to load plans");
      setPlans(
        (plansData.items || []).map((plan) => ({
          ...plan,
          id: resolvePlanId(plan),
        }))
      );
    } catch (error) {
      push(error.message || "Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePlan = async (payload) => {
    try {
      const editingId = resolvePlanId(editingPlan);
      const url = editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans";
      const method = editingPlan ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Plan update failed");

      push(editingPlan ? "Plan updated" : "Plan created", "success");
      setEditorOpen(false);
      setEditingPlan(null);
      await load();
    } catch (error) {
      push(error.message || "Failed to save plan", "error");
    }
  };

  const deletePlan = async (id) => {
    const planId = resolvePlanId(id);
    if (!planId) {
      push("Invalid plan id", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Delete failed");
      push("Plan deleted", "success");
      await load();
    } catch (error) {
      push(error.message || "Delete failed", "error");
    }
  };

  const togglePlan = async (plan) => {
    const planId = resolvePlanId(plan);
    if (!planId) {
      push("Invalid plan id", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Toggle failed");
      push(plan.isActive ? "Plan deactivated" : "Plan activated", "success");
      await load();
    } catch (error) {
      push(error.message || "Toggle failed", "error");
    }
  };

  const assignPlan = async ({ userId, planId }) => {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planId }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Assignment failed");
      push("Plan assigned", "success");
    } catch (error) {
      push(error.message || "Assignment failed", "error");
    }
  };

  if (loading) return <PageSkeleton cards={3} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--dash-text)]">Subscriptions</h1>
          <p className="text-sm text-[var(--dash-muted)]">Plan visibility and assignments</p>
        </div>
        <div className="flex gap-2">
          {canAssignPlans ? (
            <Button variant="outline" onClick={() => setAssignOpen(true)}>
              Assign Plan
            </Button>
          ) : null}
          {canManagePlans ? <Button onClick={() => setEditorOpen(true)}>New Plan</Button> : null}
        </div>
      </div>

      <PlansGrid
        plans={plans}
        canManagePlans={canManagePlans}
        onEdit={(plan) => {
          setEditingPlan(plan);
          setEditorOpen(true);
        }}
        onDelete={deletePlan}
        onToggle={togglePlan}
      />

      <PlanEditorModal
        key={`${resolvePlanId(editingPlan) || "new"}-${editorOpen ? "open" : "closed"}`}
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingPlan(null);
        }}
        initialData={editingPlan}
        onSubmit={savePlan}
      />

      <AssignPlanModal open={assignOpen} onClose={() => setAssignOpen(false)} plans={plans} onSubmit={assignPlan} />
    </div>
  );
}

