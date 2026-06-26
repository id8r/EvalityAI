// src/components/marketing/LandingPage.js | Public landing page | Sree | 2026-06-26

"use client";

import { useState } from "react";
import Link from "next/link";

import { FxAppHeader, FxThemeToggle } from "@/components/FxUI/AppShell";
import { FxButton } from "@/components/FxUI/Forms";
import { FxTabs } from "@/components/FxUI/Navigation";
import { AuthDialog } from "@/components/marketing/AuthDialog";
import { LANDING_COPY } from "@/lib/FxCopy";
import { APP_PUBLIC_HEADER_HEIGHT, ROUTES } from "@/lib/FxConstants";
import { FX_LAYOUT, FX_SURFACE, FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function SectionShell({ id, alt = false, bgClassName, className = "", children }) {
  const backgroundClass = bgClassName ?? (alt ? "bg-[var(--fx-bg-soft)]/70" : "bg-[var(--fx-bg)]");

  return (
    <section id={id} className={cn("py-[64px] md:py-[96px]", backgroundClass)}>
      <div className={cn(FX_LAYOUT.landingChrome, className)}>{children}</div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, body, align = "center" }) {
  const alignClass = align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={cn("flex flex-col gap-3", alignClass)}>
      <span className={cn(FX_TYPOGRAPHY.eyebrow, "text-[var(--fx-primary)]")}>{eyebrow}</span>
      <h2 className={cn(FX_TYPOGRAPHY.sectionTitle, "text-[var(--fx-text)]")}>{title}</h2>
      {body ? <p className={cn(FX_TYPOGRAPHY.body, "max-w-[720px] text-[var(--fx-text-muted)]")}>{body}</p> : null}
    </div>
  );
}

function Card({ title, body, className = "" }) {
  return (
    <div className={cn("rounded-[12px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] p-5", className)}>
      <div className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{title}</div>
      <p className={cn(FX_TYPOGRAPHY.body, "mt-2 text-[var(--fx-text-muted)]")}>{body}</p>
    </div>
  );
}

function PreviewFrame({ label, status, children }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--fx-border-light)] bg-[var(--fx-surface-raised)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--fx-danger)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--fx-warning)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--fx-success)]/70" />
          </div>
          <span className={cn(FX_TYPOGRAPHY.eyebrow, "text-[var(--fx-text-muted)]")}>{label}</span>
        </div>
        <span className={cn(FX_TYPOGRAPHY.label, "rounded-full bg-[var(--fx-bg-soft)] px-2.5 py-1 text-[var(--fx-text-muted)]")}>{status}</span>
      </div>
      {children}
    </div>
  );
}

function JobsPreviewBody() {
  const jobs = LANDING_COPY.product.jobs.rows;
  const sidebar = LANDING_COPY.product.jobs.sidebarItems;

  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className={cn(FX_TYPOGRAPHY.eyebrow, "text-[var(--fx-text-muted)]")}>{LANDING_COPY.product.jobs.title}</div>
            <div className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>Senior Frontend Engineer</div>
          </div>
          <span className={cn(FX_TYPOGRAPHY.label, "rounded-full bg-[var(--fx-primary)]/10 px-2.5 py-1 text-[var(--fx-primary)]")}>Published</span>
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[var(--fx-border-light)]">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-[var(--fx-border-light)] bg-[var(--fx-surface-raised)] px-4 py-3">
            <span className={cn(FX_TYPOGRAPHY.label, "text-[var(--fx-text-muted)]")}>Job</span>
            <span className={cn(FX_TYPOGRAPHY.label, "text-[var(--fx-text-muted)]")}>Candidates</span>
            <span className={cn(FX_TYPOGRAPHY.label, "text-right text-[var(--fx-text-muted)]")}>Status</span>
          </div>
          <div className="divide-y divide-[var(--fx-border-light)]">
            {jobs.map((job) => (
              <div key={job.title} className="grid grid-cols-[1.2fr_0.8fr_0.8fr] px-4 py-3">
                <div className="min-w-0">
                  <div className={cn(FX_TYPOGRAPHY.clickable, "truncate text-[var(--fx-text)]")}>{job.title}</div>
                  <div className={cn(FX_TYPOGRAPHY.label, "truncate text-[var(--fx-text-muted)]")}>{job.count}</div>
                </div>
                <div className="min-w-0">
                  <div className={cn(FX_TYPOGRAPHY.body, "truncate text-[var(--fx-text)]")}>{job.detail}</div>
                  <div className={cn(FX_TYPOGRAPHY.label, "truncate text-[var(--fx-text-muted)]")}>{job.share}</div>
                </div>
                <div className="flex items-center justify-end">
                  <span className={cn(FX_TYPOGRAPHY.label, "rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-bg-soft)] px-2.5 py-1 text-[var(--fx-text)]")}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="flex flex-col justify-between gap-4 rounded-[12px] border border-[var(--fx-border-light)] bg-[var(--fx-bg-soft)] p-4">
        <div>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--fx-border-light)] pb-3">
            <span className={cn(FX_TYPOGRAPHY.eyebrow, "text-[var(--fx-text-muted)]")}>{LANDING_COPY.product.jobs.sidebarTitle}</span>
            <span className={cn(FX_TYPOGRAPHY.label, "text-[var(--fx-primary)]")}>{LANDING_COPY.product.jobs.sidebarBadge}</span>
          </div>
          <div className="mt-3 space-y-2.5">
            {sidebar.map((item) => (
              <div key={item.label} className="rounded-[10px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      FX_TYPOGRAPHY.label,
                      "uppercase tracking-[0.12em]",
                      item.accent === "amber" ? "text-[var(--fx-warning)]" : "text-[var(--fx-primary)]",
                    )}
                  >
                    {item.label}
                  </span>
                  <span className={cn(FX_TYPOGRAPHY.label, "text-[var(--fx-text-muted)]")}>{item.meta}</span>
                </div>
                <p className={cn(FX_TYPOGRAPHY.body, "mt-2 text-[var(--fx-text)]")}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className={cn(FX_TYPOGRAPHY.label, "rounded-[10px] border border-[var(--fx-border-light)] bg-[var(--fx-surface-raised)] px-3 py-2 text-[var(--fx-text-muted)]")}>
          {LANDING_COPY.product.jobs.footer}
        </p>
      </aside>
    </div>
  );
}

function HeroPreview() {
  return (
    <PreviewFrame label="Evality Workspace Preview" status="Live workspace">
      <JobsPreviewBody />
    </PreviewFrame>
  );
}

function CandidatesPreview() {
  return (
    <div className="space-y-3 p-5">
      <div className={cn(FX_TYPOGRAPHY.eyebrow, "text-[var(--fx-text-muted)]")}>{LANDING_COPY.product.candidates.title}</div>
      <div className="space-y-3">
        {LANDING_COPY.product.candidates.rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4 rounded-[12px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] p-4">
            <div className="min-w-0">
              <div className={cn(FX_TYPOGRAPHY.clickable, "truncate text-[var(--fx-text)]")}>{row.name}</div>
              <div className={cn(FX_TYPOGRAPHY.label, "truncate text-[var(--fx-text-muted)]")}>{row.meta}</div>
            </div>
            <span className={cn(FX_TYPOGRAPHY.label, "whitespace-nowrap text-[var(--fx-primary)]")}>{row.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div className="grid gap-3 p-5 sm:grid-cols-3">
      {LANDING_COPY.product.workspace.cards.map((card) => (
        <div key={card.name} className="rounded-[12px] border border-[var(--fx-border-light)] bg-[var(--fx-surface)] p-4">
          <div className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{card.name}</div>
          <p className={cn(FX_TYPOGRAPHY.body, "mt-1.5 text-[var(--fx-text-muted)]")}>{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function ActionCenterPreview() {
  return (
    <div className="space-y-3 p-5">
      {LANDING_COPY.product.actionCenter.items.map((item) => (
        <div
          key={item.body}
          className={cn(
            "flex items-center justify-between gap-4 rounded-[12px] border border-[var(--fx-border-light)] p-4",
            item.tone === "amber" ? "bg-[var(--fx-warning)]/[0.08]" : "bg-[var(--fx-primary)]/[0.08]",
          )}
        >
          <p className={cn(FX_TYPOGRAPHY.body, "min-w-0 flex-1 text-[var(--fx-text)]")}>{item.body}</p>
          <span className={cn(FX_TYPOGRAPHY.label, "whitespace-nowrap text-[var(--fx-primary)]")}>{item.action}</span>
        </div>
      ))}
    </div>
  );
}

function ProductPreview() {
  const [activeTab, setActiveTab] = useState("jobs");

  return (
    <div className="mx-auto mt-8 max-w-[1100px]">
      <FxTabs
        className="items-center"
        value={activeTab}
        onValueChange={setActiveTab}
        variant="rounded"
        tabs={[
          { value: "jobs", label: LANDING_COPY.product.tabs.jobs },
          { value: "candidates", label: LANDING_COPY.product.tabs.candidates },
          { value: "workspace", label: LANDING_COPY.product.tabs.workspace },
          { value: "actionCenter", label: LANDING_COPY.product.tabs.actionCenter },
        ]}
      >
        <PreviewFrame
          label="Evality Product Sandbox"
          status={`${LANDING_COPY.product.breadcrumbPrefix} ${LANDING_COPY.product.tabs[activeTab] ?? activeTab}`}
        >
          <FxTabs.Content value="jobs">
            <JobsPreviewBody />
          </FxTabs.Content>
          <FxTabs.Content value="candidates">
            <CandidatesPreview />
          </FxTabs.Content>
          <FxTabs.Content value="workspace">
            <WorkspacePreview />
          </FxTabs.Content>
          <FxTabs.Content value="actionCenter">
            <ActionCenterPreview />
          </FxTabs.Content>
        </PreviewFrame>
      </FxTabs>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

export function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState("signup");

  function openAuth(nextIntent) {
    setIntent(nextIntent);
    setAuthOpen(true);
  }

  const copy = LANDING_COPY;

  return (
    <div className={FX_SURFACE.page}>
      <FxAppHeader
        height={APP_PUBLIC_HEADER_HEIGHT}
        sticky={false}
        className={FX_LAYOUT.headerShell}
        contentClassName={FX_LAYOUT.landingChrome}
        start={
          <Link href={ROUTES.home} aria-label="Evality home" className="inline-flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/evality-logo.svg" alt="Evality" className="h-[44px] w-auto" />
          </Link>
        }
        middle={
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
            {copy.navLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={cn(
                  FX_TYPOGRAPHY.clickable,
                  "rounded-full px-[10px] py-[6px] text-[var(--fx-text-muted)] transition-colors duration-100 hover:bg-[var(--fx-bg-soft)] hover:text-[var(--fx-text)]",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
        }
        end={
          <div className="flex items-center gap-3">
            <FxThemeToggle />
            <FxButton size="sm" className="whitespace-nowrap rounded-[8px] px-[14px]" onClick={() => openAuth("signup")}>
              {copy.hero.cta}
            </FxButton>
            <FxButton
              size="sm"
              variant="secondary"
              className="whitespace-nowrap rounded-[8px] px-[14px]"
              onClick={() => openAuth("login")}
            >
              {copy.hero.login}
            </FxButton>
          </div>
        }
      />

      <main className={FX_LAYOUT.landingMain}>
        <SectionShell bgClassName="bg-[var(--fx-surface)]" className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="max-w-[620px] space-y-6">
            <span className="inline-flex items-center rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-3 py-1.5">
              <span className={cn(FX_TYPOGRAPHY.eyebrow, "text-[var(--fx-primary)]")}>{copy.hero.eyebrow}</span>
            </span>
            <h1 className={cn(FX_TYPOGRAPHY.hero, "whitespace-pre-line text-[var(--fx-text)]")}>{copy.hero.headline}</h1>
            <p className={cn(FX_TYPOGRAPHY.body, "max-w-[56ch] text-[15px] text-[var(--fx-text-muted)]")}>{copy.hero.tagline}</p>
            <div className="flex flex-wrap items-center gap-3">
              <FxButton size="lg" variant="hero" className="rounded-full px-[28px]" onClick={() => openAuth("signup")}>
                {copy.hero.cta}
              </FxButton>
            </div>
            <p className={cn(FX_TYPOGRAPHY.meta, "text-[var(--fx-text-muted)]")}>{copy.hero.trust}</p>
          </div>

          <HeroPreview />
        </SectionShell>

        <SectionShell id="problem" alt>
          <SectionTitle eyebrow={copy.problem.eyebrow} title={copy.problem.title} body={copy.problem.body} />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {copy.problem.chips.map((chip) => (
              <span
                key={chip}
                className={cn(
                  FX_TYPOGRAPHY.clickable,
                  "rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-4 py-2 text-[var(--fx-text-muted)]",
                )}
              >
                {chip}
              </span>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="workflow">
          <SectionTitle eyebrow={copy.workflow.eyebrow} title={copy.workflow.title} body={copy.workflow.body} />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
            {copy.workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "rounded-[12px] border p-4 text-center",
                  step.featured
                    ? "border-[var(--fx-primary)] bg-[color:color-mix(in_srgb,var(--fx-primary)_8%,transparent)]"
                    : "border-[var(--fx-border-light)] bg-[var(--fx-surface)]",
                )}
              >
                <div className={cn(FX_TYPOGRAPHY.label, step.featured ? "text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)]")}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className={cn(FX_TYPOGRAPHY.cardTitle, "mt-2 text-[var(--fx-text)]")}>{step.label}</div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell id="product" alt>
          <SectionTitle eyebrow={copy.product.eyebrow} title={copy.product.title} />
          <ProductPreview />
        </SectionShell>

        <SectionShell>
          <SectionTitle eyebrow={copy.ai.eyebrow} title={copy.ai.title} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {copy.ai.cards.map((card) => (
              <Card key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </SectionShell>

        <SectionShell id="audience" alt>
          <SectionTitle eyebrow={copy.audience.eyebrow} title={copy.audience.title} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {copy.audience.cards.map((card) => (
              <Card key={card.title} title={card.title} body={card.body} />
            ))}
          </div>
        </SectionShell>

        <SectionShell>
          <SectionTitle eyebrow={copy.outcomes.eyebrow} title={copy.outcomes.title} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {copy.outcomes.items.map((item) => (
              <Card key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </SectionShell>

        <SectionShell id="pricing" alt>
          <SectionTitle eyebrow={copy.pricing.eyebrow} title={copy.pricing.title} />
          <div className="mx-auto mt-8 grid max-w-[760px] gap-4 md:grid-cols-2">
            {copy.pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "rounded-[16px] border p-6",
                  plan.featured
                    ? "border-[var(--fx-primary)] bg-[color:color-mix(in_srgb,var(--fx-primary)_5%,transparent)]"
                    : "border-[var(--fx-border-light)] bg-[var(--fx-surface)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={cn(FX_TYPOGRAPHY.cardTitle, "text-[var(--fx-text)]")}>{plan.name}</div>
                    <p className={cn(FX_TYPOGRAPHY.meta, "mt-1 text-[var(--fx-text-muted)]")}>{plan.description}</p>
                  </div>
                  <span
                    className={cn(
                      FX_TYPOGRAPHY.label,
                      "rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-2.5 py-1 text-[var(--fx-text-muted)]",
                    )}
                  >
                    {plan.badge}
                  </span>
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-[32px] font-semibold leading-none text-[var(--fx-text)]">{plan.price}</span>
                  <span className={cn(FX_TYPOGRAPHY.meta, "pb-1 text-[var(--fx-text-muted)]")}>{plan.footnote}</span>
                </div>
                <FxButton className="mt-6 w-full justify-center" size="xl" variant={plan.featured ? "primary" : "secondary"} onClick={() => openAuth("signup")}>
                  {plan.cta}
                </FxButton>
              </div>
            ))}
          </div>
        </SectionShell>

        <footer className="border-t border-[var(--fx-border-light)] py-8">
          <div className={cn(FX_LAYOUT.landingChrome, "flex flex-col gap-4 md:flex-row md:items-center md:justify-between")}>
            <p className={cn(FX_TYPOGRAPHY.meta, "text-[var(--fx-text-muted)]")}>{copy.footer.copyright}</p>
            <div className="flex flex-wrap items-center gap-4">
              {copy.footer.links.map((link) => (
                <a
                  key={link}
                  href={link === "LinkedIn" ? "https://www.linkedin.com" : "#"}
                  target={link === "LinkedIn" ? "_blank" : undefined}
                  rel={link === "LinkedIn" ? "noreferrer" : undefined}
                  className={cn(FX_TYPOGRAPHY.clickable, "text-[var(--fx-text-muted)] transition-colors duration-100 hover:text-[var(--fx-text)]")}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent={intent} />
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
