/* src/app/(workspace)/settings/BillingSection.js | Settings · Billing (brainstorm — plans, usage, payment) | Sree | 2026-06-28 */

"use client";

import { Check, CreditCard, Sparkles } from "lucide-react";

import { FxButton } from "@/components/FxUI/Forms";
import { getSettings } from "@/lib/EvData";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
import { SettingsCard } from "./SettingsCard";
/* - - - - - - - - - - - - - - - - */

// NOTE: brainstorm scaffolding to react to — not a finalized billing model. Tiers/copy borrow the
// free → pro → team shape used by Claude / ChatGPT pricing, adapted to recruiting credits.
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    cadence: "/month",
    tagline: "For trying Evality on a couple of roles.",
    features: ["1 recruiter seat", "120 AI credits / month", "Manual + email screening", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹2,400",
    cadence: "/month",
    tagline: "For recruiters hiring every week.",
    features: ["1 recruiter seat", "2,000 AI credits / month", "Phone + WhatsApp screening", "Calendar scheduling", "Priority support"],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "Custom",
    cadence: "",
    tagline: "For teams and agencies running client desks.",
    features: ["Unlimited seats", "Pooled team credits", "Client workspaces", "SSO & audit log", "Dedicated success manager"],
  },
];

const USAGE_LABELS = {
  resumeParsing: "Resume parsing",
  emailScreening: "Email screening",
  candidateRecommendations: "Candidate recommendations",
};

const PLAN_CREDITS = { free: 120, pro: 2000, scale: null };

function PlanCard({ plan, current }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-[14px] border p-5",
        plan.popular ? "border-[var(--fx-primary)] bg-[var(--fx-surface)] shadow-[0_1px_2px_rgba(15,23,42,0.04)]" : "border-[var(--fx-border)] bg-[var(--fx-surface)]",
      )}
    >
      {plan.popular ? (
        <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-[var(--fx-primary)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--fx-primary-foreground)]">
          <Sparkles className="size-3" /> Most popular
        </span>
      ) : null}

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{plan.name}</h3>
          {current ? (
            <span className="inline-flex rounded-full bg-[var(--fx-surface-selected)] px-2 py-0.5 text-[11px] font-medium text-[var(--fx-primary)]">Current</span>
          ) : null}
        </div>
        <p className="text-[13px] leading-5 text-[var(--fx-text-muted)]">{plan.tagline}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-[26px] font-semibold leading-none text-[var(--fx-text)]">{plan.price}</span>
        {plan.cadence ? <span className="text-[13px] text-[var(--fx-text-muted)]">{plan.cadence}</span> : null}
      </div>

      <ul className="space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13px] leading-5 text-[var(--fx-text)]">
            <Check className="mt-0.5 size-4 shrink-0 text-[var(--fx-primary)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <FxButton variant={plan.popular ? "primary" : "secondary"} size="md" className="mt-auto w-full justify-center" disabled={current}>
        {current ? "Current plan" : plan.id === "scale" ? "Contact sales" : "Upgrade"}
      </FxButton>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

export function BillingSection() {
  const credits = getSettings().credits ?? {};
  const currentPlanId = credits.plan ?? "free";
  const currentPlan = PLANS.find((plan) => plan.id === currentPlanId) ?? PLANS[0];
  const usage = credits.usage ?? {};
  const allowance = PLAN_CREDITS[currentPlanId] ?? null;
  const usedThisCycle = Object.values(usage).reduce((sum, count) => sum + (Number(count) || 0), 0);

  return (
    <div className="space-y-6">
      <SettingsCard title="Plan & Billing" description="Manage your subscription, credits, and payment details.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-5 py-4">
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{currentPlan.name} plan</span>
              <span className="inline-flex rounded-full bg-[var(--fx-surface-selected)] px-2 py-0.5 text-[11px] font-medium text-[var(--fx-primary)]">Active</span>
            </div>
            <p className="text-[13px] text-[var(--fx-text-muted)]">
              {allowance ? `${allowance.toLocaleString("en-IN")} AI credits / month` : "Custom credit pool"} · renews monthly
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FxButton variant="ghost" size="md">
              View invoices
            </FxButton>
            <FxButton variant="secondary" size="md">
              Manage plan
            </FxButton>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Plans" description="Upgrade as your hiring volume grows. Prices shown in INR.">
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} current={plan.id === currentPlanId} />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Usage this cycle" description="AI credits consumed across screening and recommendations.">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] text-[var(--fx-text)]">
              <span className="text-[20px] font-semibold">{usedThisCycle.toLocaleString("en-IN")}</span>
              {allowance ? <span className="text-[var(--fx-text-muted)]"> / {allowance.toLocaleString("en-IN")} credits used</span> : <span className="text-[var(--fx-text-muted)]"> credits used</span>}
            </span>
            <span className="text-[13px] text-[var(--fx-text-muted)]">Balance: {(credits.balance ?? 0).toLocaleString("en-IN")}</span>
          </div>

          {allowance ? (
            <div className="h-2 w-full overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--fx-border)_70%,transparent)]">
              <div className="h-full rounded-full bg-[var(--fx-primary)]" style={{ width: `${Math.min(100, Math.round((usedThisCycle / allowance) * 100))}%` }} />
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {Object.entries(USAGE_LABELS).map(([key, label]) => (
              <div key={key} className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-3">
                <div className="text-[20px] font-semibold text-[var(--fx-text)]">{(usage[key] ?? 0).toLocaleString("en-IN")}</div>
                <div className="text-[13px] leading-5 text-[var(--fx-text-muted)]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Payment Method" description="Used for subscription renewals and credit top-ups.">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[10px] bg-[var(--fx-surface-subtle)] text-[var(--fx-text-muted)]">
              <CreditCard className="size-5" />
            </span>
            <div>
              <div className="text-[14px] font-medium text-[var(--fx-text)]">No payment method on file</div>
              <div className="text-[13px] text-[var(--fx-text-muted)]">Add a card to upgrade or buy credit top-ups.</div>
            </div>
          </div>
          <FxButton variant="secondary" size="md">
            Add payment method
          </FxButton>
        </div>
      </SettingsCard>

      <SettingsCard title="Billing History" description="Invoices and receipts will appear here.">
        <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-5 py-8 text-center">
          <p className="text-[14px] text-[var(--fx-text)]">No invoices yet</p>
          <p className="mt-1 text-[13px] text-[var(--fx-text-muted)]">Once you upgrade, your billing history shows up here.</p>
        </div>
      </SettingsCard>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
