/* src/app/(workspace)/settings/page.js | Settings — left-nav + section content (wired to EvSettings/EvUser) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { getSettings, getUserByEmail, getUsers } from "@/lib/EvData";
import { getSession } from "@/lib/EvSession";
import { useEvData } from "@/lib/useEvData";
import { SETTINGS_SECTIONS } from "./sections";
import { SettingsNav } from "./SettingsNav";
import { SetupBanner } from "./SetupBanner";
import { ProfileSection } from "./ProfileSection";
import { OrganizationSection } from "./OrganizationSection";
import { RecruitingStatusSection } from "./RecruitingStatusSection";
import { ScreeningModeSection } from "./ScreeningModeSection";
import { EmailSection } from "./EmailSection";
import { CalendarSection } from "./CalendarSection";
import { BillingSection } from "./BillingSection";
import { PlaceholderSection } from "./PlaceholderSection";
/* - - - - - - - - - - - - - - - - */

// Real sections; the rest fall through to a placeholder.
const SECTION_COMPONENTS = {
  profile: ProfileSection,
  organization: OrganizationSection,
  "recruiting-status": RecruitingStatusSection,
  screening: ScreeningModeSection,
  email: EmailSection,
  calendar: CalendarSection,
  billing: BillingSection,
};

const PLACEHOLDER_ITEMS = {
  "career-page": ["Career page URL", "Branding", "Public application experience"],
};

const NO_COMPLETION = new Set();

// Light completion heuristic for the setup banner — recomputed on every data change.
function computeCompleted() {
  const settings = getSettings();
  const user = getUserByEmail(getSession().email) ?? getUsers()[0];
  const done = new Set();
  if (user?.name && user?.email) done.add("profile");
  if (settings.company?.companyName && settings.company?.companyLinkedIn) done.add("organization");
  if (settings.workspace?.workspaceType) done.add("recruiting-status");
  if (settings.screeningDefaults?.prescreenMode) done.add("screening");
  const email = settings.email?.providerConnections ?? {};
  if (email.gmail || email.outlook) done.add("email");
  const calendar = settings.calendar?.providerConnections ?? {};
  if (calendar.googleCalendar || calendar.outlookCalendar) done.add("calendar");
  if (settings.company?.careerPageUrl) done.add("career-page");
  if (settings.credits?.plan) done.add("billing");
  return done;
}
/* - - - - - - - - - - - - - - - - */

export default function SettingsPage() {
  const ready = useEvData();
  const [activeId, setActiveId] = useState("profile");
  const active = SETTINGS_SECTIONS.find((section) => section.id === activeId) ?? SETTINGS_SECTIONS[0];
  const Section = SECTION_COMPONENTS[activeId];
  const completed = ready ? computeCompleted() : NO_COMPLETION;

  return (
    <div className="px-6 py-8 md:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* SECTION NAV */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <SettingsNav sections={SETTINGS_SECTIONS} activeId={activeId} onSelect={setActiveId} />
        </aside>

        {/* CONTENT */}
        <main className="min-w-0 space-y-6">
          <SetupBanner sections={SETTINGS_SECTIONS} completed={completed} onNavigate={setActiveId} />

          {!ready ? (
            <div className="rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-6 py-10 text-center text-[13px] text-[var(--fx-text-muted)]">
              Loading…
            </div>
          ) : Section ? (
            <Section key={activeId} />
          ) : (
            <PlaceholderSection title={active.label} description={active.description} items={PLACEHOLDER_ITEMS[activeId] ?? []} />
          )}
        </main>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
