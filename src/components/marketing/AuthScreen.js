/* src/components/marketing/AuthScreen.js | Dedicated /login + /signup screen hosting AuthDialog | Sree | 2026-06-27 */

"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthDialog } from "@/components/marketing/AuthDialog";
import { FxButton } from "@/components/FxUI/Forms";
import { ROUTES } from "@/lib/FxConstants";
/* - - - - - - - - - - - - - - - - */

// AuthDialog owns the success redirect (login → /jobs; signup → role step → /jobs). Dismissing the dialog
// reveals this fallback card so closing never strands the user on a blank route.
// Login lives on the landing auth popup (no /login route), so "Log in" points back to the landing.
const AUTH_SCREEN_COPY = {
  signup: { title: "Get started", cta: "Sign up", prompt: "Already have an account?", link: "Log in", href: ROUTES.home },
};

export function AuthScreen({ intent = "login" }) {
  const [open, setOpen] = useState(true);
  const copy = AUTH_SCREEN_COPY[intent] ?? AUTH_SCREEN_COPY.login;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--fx-bg)] px-6 text-center">
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Evality AI</p>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-[-0.01em] text-foreground">{copy.title}</h1>
        <div className="pt-1">
          <FxButton onClick={() => setOpen(true)}>{copy.cta}</FxButton>
        </div>
        <p className="text-sm text-muted-foreground">
          {copy.prompt}{" "}
          <Link href={copy.href} className="font-medium text-[var(--fx-primary)] hover:underline">
            {copy.link}
          </Link>
        </p>
      </div>
      <AuthDialog open={open} onOpenChange={setOpen} intent={intent} />
    </main>
  );
}
/* - - - - - - - - - - - - - - - - */
