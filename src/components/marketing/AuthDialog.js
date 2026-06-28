/* src/components/marketing/AuthDialog.js | Auth popup (social/email) — signup → /welcome, login → /jobs | Sree | 2026-06-28 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FxDialog } from "@/components/FxUI/Overlays";
import { FxButton, FxInput } from "@/components/FxUI/Forms";
import { AUTH_COPY } from "@/lib/FxCopy";
import { ROUTES } from "@/lib/FxConstants";
import { signIn } from "@/lib/EvSession";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.29h6.46c-.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.55-5.15 3.55-8.65z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3.01c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11C3.23 21.3 7.28 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.13-1.56.37-2.28V6.61H1.26A11.95 11.95 0 0 0 0 12c0 1.93.46 3.76 1.26 5.39l4.01-3.11z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.2 15.23 0 12 0 7.28 0 3.23 2.7 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}
/* - - - - - - - - - - - - - - - - */

// Auth-only popup. signIn records the entry path via `experience`: signup="get_started" (→ /welcome onboarding,
// then an empty/FTUE jobs view) vs login="login" (returning → seeded /jobs).
export function AuthDialog({ open, onOpenChange, intent = "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const darkCta =
    "w-full justify-center border-transparent bg-[var(--fx-text)] text-white hover:bg-[color:color-mix(in_srgb,var(--fx-text)_86%,black)]";

  function completeAuth(provider) {
    signIn({ provider, email, experience: intent === "signup" ? "get_started" : "login" });
    onOpenChange?.(false);
    setEmail("");
    router.push(intent === "signup" ? ROUTES.welcome : ROUTES.jobs);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (email.trim()) completeAuth("email");
  }

  return (
    <FxDialog
      open={open}
      onOpenChange={onOpenChange}
      title={AUTH_COPY.title}
      description={AUTH_COPY.description}
      className="max-w-[480px] gap-6 rounded-[16px] p-8"
      headerClassName="mx-auto max-w-[360px]"
    >
      <div className="space-y-4">
        <FxButton size="xl" variant="secondary" className="w-full justify-center" onClick={() => completeAuth("google")}>
          <GoogleIcon />
          {AUTH_COPY.continueWithGoogle}
        </FxButton>
        <FxButton
          size="xl"
          variant="secondary"
          className="w-full justify-center border-[#0A66C2] bg-[#0A66C2] text-white hover:border-[#0958A8] hover:bg-[#0958A8] hover:text-white"
          onClick={() => completeAuth("linkedin")}
        >
          <LinkedInIcon />
          {AUTH_COPY.continueWithLinkedIn}
        </FxButton>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <span className="h-px bg-[var(--fx-border-light)]" />
          <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{AUTH_COPY.or}</span>
          <span className="h-px bg-[var(--fx-border-light)]" />
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <FxInput
            type="email"
            name="email"
            required
            placeholder={AUTH_COPY.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            inputClassName={cn("text-[14px] h-[48px]")}
            autoComplete="email"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
          />
          <FxButton type="submit" size="xl" className={darkCta}>
            {AUTH_COPY.continue}
          </FxButton>
        </form>
      </div>
    </FxDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
