// src/components/marketing/OnboardingPage.js | Post-signup onboarding (role + purpose) | Sree | 2026-06-26

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FxButton, FxRadioGroupField } from "@/components/FxUI/Forms";
import { ONBOARDING_COPY } from "@/lib/FxCopy";
import { ROUTES } from "@/lib/FxConstants";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

export function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [purpose, setPurpose] = useState("internal");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--fx-bg)] px-6 py-16">
      <div className="flex w-full max-w-[560px] flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className={cn(FX_TYPOGRAPHY.pageTitle, "text-[var(--fx-text)]")}>
            {ONBOARDING_COPY.title.replace("{firstName}", "there")}
          </h1>
          <p className={cn(FX_TYPOGRAPHY.body, "text-[var(--fx-text-muted)]")}>{ONBOARDING_COPY.subtitle}</p>
        </div>

        <div className="space-y-6 rounded-[12px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] p-6">
          <FxRadioGroupField
            label={ONBOARDING_COPY.roleLabel}
            options={ONBOARDING_COPY.roleOptions}
            value={role}
            onValueChange={setRole}
          />
          <FxRadioGroupField
            label={ONBOARDING_COPY.purposeLabel}
            options={ONBOARDING_COPY.purposeOptions}
            value={purpose}
            onValueChange={setPurpose}
          />
          <p className={cn(FX_TYPOGRAPHY.meta, "text-[var(--fx-text-muted)]")}>{ONBOARDING_COPY.helperText}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <FxButton variant="ghost" onClick={() => router.push(ROUTES.home)}>
            <ArrowLeft className="size-4" />
            {ONBOARDING_COPY.back}
          </FxButton>
          <FxButton disabled={!role} onClick={() => router.push(ROUTES.dashboard)}>
            {ONBOARDING_COPY.continue}
          </FxButton>
        </div>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
