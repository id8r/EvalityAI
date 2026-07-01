/* src/components/marketing/WelcomeScreen.js | Onboarding (/welcome): role + who you hire for | Sree | 2026-06-28 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";

import { FxButton, FxCombobox, FxRadioGroupField } from "@/components/FxUI/Forms";
import { Label } from "@/components/ui/label";
import { ONBOARDING_COPY } from "@/lib/FxCopy";
import { ROUTES } from "@/lib/FxConstants";
import { completeOnboarding, getSession } from "@/lib/EvSession";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function firstNameFromEmail(email) {
  const local = String(email || "").split("@")[0] || "";
  const token = local.split(/[._-]/).filter(Boolean)[0] || "";
  return token ? token.charAt(0).toUpperCase() + token.slice(1) : "there";
}
/* - - - - - - - - - - - - - - - - */

export function WelcomeScreen() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [workspaceType, setWorkspaceType] = useState("my_company");
  const [firstName, setFirstName] = useState("there");

  // Personalize the greeting from the signed-in email (client-only — avoids hydration mismatch).
  useEffect(() => {
    setFirstName(firstNameFromEmail(getSession().email));
  }, []);

  function handleContinue() {
    completeOnboarding({ role, workspaceType });
    router.push(ROUTES.jobs);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--fx-bg)] px-6 py-16">
      <div className="flex w-full max-w-[600px] flex-col gap-6">
        {/* HEADER */}
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-[12px] bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]">
            <Briefcase className="size-6" />
          </span>
          <div className="space-y-2">
            <h1 className={cn(FX_TYPOGRAPHY.pageTitle, "text-[var(--fx-text)]")}>
              {ONBOARDING_COPY.title.replace("{firstName}", firstName)}
            </h1>
            <p className={cn(FX_TYPOGRAPHY.body, "text-[var(--fx-text-muted)]")}>{ONBOARDING_COPY.subtitle}</p>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="space-y-6 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6">
          <FxCombobox
            label={ONBOARDING_COPY.roleLabel}
            placeholder="Select your role"
            options={ONBOARDING_COPY.roleOptions}
            value={role}
            onChange={setRole}
          />

          <div className="space-y-2">
            <Label>{ONBOARDING_COPY.purposeLabel}</Label>
            <FxRadioGroupField options={ONBOARDING_COPY.purposeOptions} value={workspaceType} onValueChange={setWorkspaceType} />
          </div>

          <p className={cn(FX_TYPOGRAPHY.meta, "text-[var(--fx-text-muted)]")}>{ONBOARDING_COPY.helperText}</p>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-4">
          <FxButton variant="outline" onClick={() => router.push(ROUTES.home)}>
            <ArrowLeft className="size-4" />
            {ONBOARDING_COPY.back}
          </FxButton>
          <FxButton disabled={!role} onClick={handleContinue}>
            {ONBOARDING_COPY.continue}
          </FxButton>
        </div>
      </div>
    </main>
  );
}
/* - - - - - - - - - - - - - - - - */
