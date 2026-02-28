"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/admin/common/section-card";

export default function PlansGrid({ plans = [], canManagePlans = false, onEdit, onDelete, onToggle }) {
  const resolvePlanId = (plan) => {
    if (!plan) return "";
    if (typeof plan.id === "string" && plan.id.trim()) return plan.id.trim();
    if (typeof plan._id === "string" && plan._id.trim()) return plan._id.trim();
    return "";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => (
        <SectionCard key={resolvePlanId(plan) || plan.name} className="rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--dash-muted)]">{plan.billingCycle}</p>
                <h3 className="text-xl font-semibold text-[var(--dash-text)]">{plan.name}</h3>
              </div>
              <Badge tone={plan.isActive ? "success" : "warning"}>
                {plan.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-2xl font-semibold text-[var(--dash-text)]">${Number(plan.price || 0).toLocaleString()}</p>
            <p className="text-sm text-[var(--dash-muted)]">{plan.subscriberCount || 0} active users</p>
            <ul className="space-y-1 text-sm text-[var(--dash-muted)]">
              {(plan.features || []).slice(0, 3).map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            {canManagePlans ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => onEdit(plan)}>Edit Plan</Button>
                <Button size="sm" variant="outline" onClick={() => onToggle(plan)}>
                  {plan.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(resolvePlanId(plan))}>Remove Plan</Button>
              </div>
            ) : null}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
