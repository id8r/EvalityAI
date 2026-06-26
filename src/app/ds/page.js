/* src/app/ds/page.js | Living visual design system playground | Sree | 2026-06-25 */

import {
  Bell,
  CircleHelp,
  FileText,
  Filter,
  Folder,
  Inbox,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { FxBadge } from "@/components/FxUI/DataDisplay";
import { FxAiButton, FxButton, FxCheckboxField, FxIconButton, FxInput, FxRadioGroupField, FxSwitchField, FxTextarea } from "@/components/FxUI/Forms";
import { FxPanel } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxColorTokenCard } from "./FxColorTokenCard";
import { FxTableShowcase } from "./FxTableShowcase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FX_BORDER,
  FX_LAYOUT,
  FX_RADIUS,
  FX_SHADOW,
  FX_SPACE,
  FX_SURFACE,
  FX_TYPOGRAPHY,
} from "@/lib/FxTheme";

/* - - - - - - - - - - - - - - - - */

/* Token names only. Values are read live from the active theme in FxColorTokenCard,
   so globals.css remains the single source of truth for every color value. */
const colorGroups = [
  {
    title: "Brand",
    tokens: ["--fx-primary", "--fx-primary-hover", "--fx-accent", "--fx-primary-foreground"],
  },
  {
    title: "Surfaces",
    tokens: [
      "--fx-bg",
      "--fx-bg-soft",
      "--fx-surface",
      "--fx-surface-subtle",
      "--fx-surface-muted",
      "--fx-surface-hover",
      "--fx-surface-selected",
    ],
  },
  {
    title: "Text And Borders",
    tokens: [
      "--fx-border-light",
      "--fx-border",
      "--fx-border-strong",
      "--fx-text",
      "--fx-text-muted",
      "--fx-text-subtle",
    ],
  },
  {
    title: "Semantic",
    tokens: ["--fx-success", "--fx-warning", "--fx-danger", "--fx-info-surface"],
  },
];

const typeRoles = [
  {
    key: "pageTitle",
    label: "Page Title",
    sample: "Revenue intelligence for operational teams",
    meta: "28px / 600",
  },
  {
    key: "sectionTitle",
    label: "Section Title",
    sample: "Workspace overview",
    meta: "20px / 600",
  },
  {
    key: "cardTitle",
    label: "Card Title",
    sample: "Pipeline status",
    meta: "16px / 600",
  },
  {
    key: "body",
    label: "Body",
    sample: "Evality turns operational work into structured, reviewable decisions.",
    meta: "14px / 400",
  },
  {
    key: "clickable",
    label: "Clickable",
    sample: "Open workbook",
    meta: "14px / 500",
  },
  {
    key: "meta",
    label: "Meta",
    sample: "Updated 25 Jun 2026",
    meta: "13px / 400",
  },
  {
    key: "label",
    label: "Label",
    sample: "Dataset status",
    meta: "12px / 500",
  },
  {
    key: "eyebrow",
    label: "Eyebrow",
    sample: "Reference system",
    meta: "12px / 500",
  },
];

const spacingScale = ["8", "16", "24", "32", "48", "64", "96"];
const iconSet = [Search, Filter, Plus, Inbox, Folder, FileText, Bell, Settings, User, CircleHelp, Sparkles];
const surfaceRoles = ["surface", "subtle", "raised", "muted", "hover", "selected"];
const badgeTones = ["neutral", "subtle", "primary", "success", "warning", "danger", "info"];
const specPanelTone = {
  eyebrowClassName: "font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground",
  titleClassName: "font-mono text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground",
  descriptionClassName: "font-mono text-[12px] leading-5 text-muted-foreground",
};

/* - - - - - - - - - - - - - - - - */

function SectionHeader({ eyebrow, title, note }) {
  return (
    <div className={`${FX_BORDER.divider} pb-4`}>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="font-mono text-[13px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
        {note ? <p className="max-w-2xl text-sm text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}

function ColorGroup({ group }) {
  return (
    <section className="space-y-4">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{group.title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {group.tokens.map((token) => (
          <FxColorTokenCard key={token} token={token} />
        ))}
      </div>
    </section>
  );
}

function ThemePalette({ theme, dark = false }) {
  return (
    <div className={`space-y-5 rounded-[24px] border border-border bg-[var(--fx-surface)] p-4 md:p-5 ${dark ? "dark" : ""}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {theme} Theme
      </p>

      <div className="space-y-6">
        {colorGroups.map((group) => (
          <ColorGroup key={group.title} group={group} />
        ))}
      </div>
    </div>
  );
}

function FoundationSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Foundation"
        title="Type, color, spacing, radius, and shadow"
        note="Live tokens and core scales."
      />

      <FxPanel {...specPanelTone} eyebrow="Colors">
        <div className="grid gap-5 xl:grid-cols-2">
          <ThemePalette theme="Light" />
          <ThemePalette theme="Dark" dark />
        </div>
      </FxPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="Typography" title="Type Roles">
          <div className="space-y-3">
            {typeRoles.map((role) => (
              <div key={role.key} className="grid gap-4 border-t border-border py-4 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                <div className="space-y-1">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{role.label}</p>
                  <p className={FX_TYPOGRAPHY[role.key]}>{role.sample}</p>
                </div>
                <div className="text-right font-mono text-[11px] text-muted-foreground">
                  <div>FX_TYPOGRAPHY.{role.key}</div>
                  <div>{role.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="Layout" title="Spacing, Radius, And Shadow">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Spacing</p>
              <div className="space-y-3">
                {spacingScale.map((value) => (
                  <div key={value} className="flex items-center gap-4">
                    <p className="w-10 font-mono text-xs text-muted-foreground">{value}</p>
                    <div style={{ width: `${value}px` }} className="h-3 bg-primary" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["xs", "4px", "rounded-[4px]"],
                ["sm", "6px", "rounded-[6px]"],
                ["md", "8px", "rounded-[8px]"],
                ["lg", "12px", "rounded-[12px]"],
                ["pill", "full", "rounded-full"],
              ].map(([label, value, radiusClass]) => (
                <div key={label} className="space-y-2">
                  <div className={`flex h-12 items-center justify-center border border-border bg-[var(--fx-surface-subtle)] ${radiusClass}`}>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
                  </div>
                  <p className="text-right font-mono text-[11px] text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="border border-border bg-[var(--fx-surface)] px-4 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <p className="text-sm font-medium text-foreground">Soft shadow</p>
                <p className="mt-1 text-sm text-muted-foreground">Light elevation for panels and overlays.</p>
              </div>
              <div className="border border-border bg-[var(--fx-surface)] px-4 py-5">
                <p className="text-sm font-medium text-foreground">Border-first</p>
                <p className="mt-1 text-sm text-muted-foreground">Default surface structure should come from borders and spacing.</p>
              </div>
            </div>
          </div>
        </FxPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="FX_RADIUS" title="Radii">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {(() => {
              const radiusLabels = {
                xs: "4px",
                sm: "6px",
                md: "8px",
                lg: "12px",
                pill: "full",
              };

              return Object.entries(FX_RADIUS).map(([key, recipe]) => (
                <div key={key} className="space-y-2">
                  <div className={`flex h-14 items-center justify-center border border-border bg-[var(--fx-surface-subtle)] ${recipe}`}>
                    <span className="rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      {key}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <p className="font-mono text-[11px] text-muted-foreground">{radiusLabels[key]}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="FX_SHADOW" title="Elevation">
          <div className="grid gap-4 sm:grid-cols-3">
            {Object.entries(FX_SHADOW)
              .filter(([key]) => key !== "none")
              .map(([key, recipe]) => (
                <div key={key} className="space-y-2">
                  <div className={`h-16 rounded-[8px] border border-border bg-[var(--fx-surface)] ${recipe}`} />
                  <p className="font-mono text-xs text-muted-foreground">{key}</p>
                </div>
              ))}
          </div>
        </FxPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="FX_SURFACE" title="Surfaces">
          <div className="grid gap-3 sm:grid-cols-2">
            {surfaceRoles.map((key) => (
              <div key={key} className={`flex h-16 items-center px-4 ${FX_BORDER.base} border ${FX_SURFACE[key]} ${FX_RADIUS.md}`}>
                <p className="font-mono text-xs text-[var(--fx-text-muted)]">{key}</p>
              </div>
            ))}
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="FX_SPACE" title="Spacing Scale">
          <div className="space-y-3">
            {Object.entries(FX_SPACE).map(([key, value]) => (
              <div key={key} className="flex items-center gap-4">
                <p className="w-10 font-mono text-xs text-muted-foreground">{key}</p>
                <div style={{ width: value }} className="h-3 rounded-[2px] bg-primary" />
                <p className="font-mono text-xs text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </FxPanel>
      </div>
    </div>
  );
}

function ControlsSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Controls"
        title="Buttons, fields, selection, tabs, and badges"
        note="Everyday interaction patterns."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="Buttons" title="Action Hierarchy">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--fx-primary)_10%,var(--fx-surface))_0%,var(--fx-surface)_58%,color-mix(in_srgb,var(--fx-accent)_6%,var(--fx-surface))_100%)] p-6 md:p-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Hero CTA</p>
                  <h3 className="text-[22px] font-semibold tracking-tight text-foreground">Rounded marketing-style call to action</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    This is the softer treatment from the older landing flow. It stays distinct from the normal action buttons.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <FxButton variant="hero" size="xl">
                    Start free workspace
                  </FxButton>
                  <FxButton variant="secondary" size="xl">
                    Book demo
                  </FxButton>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <FxButton>Primary</FxButton>
                <FxButton variant="secondary">Secondary</FxButton>
                <FxButton variant="outline">Outline</FxButton>
                <FxButton variant="ghost">Ghost</FxButton>
                <FxButton variant="auth">Auth</FxButton>
                <FxButton variant="destructive">Delete</FxButton>
                <FxButton variant="destructiveOutline">Delete Outline</FxButton>
                <FxAiButton>AI Action</FxAiButton>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <FxButton size="xs">Tiny action</FxButton>
                <FxButton size="sm">Small option</FxButton>
                <FxButton size="md">Medium action</FxButton>
                <FxButton size="lg">Large primary action</FxButton>
                <FxButton size="xl">Forty eight pixels</FxButton>
                <FxButton disabled>Disabled</FxButton>
                <FxButton loading>Loading</FxButton>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Icon Buttons</p>
              <div className="flex flex-wrap items-center gap-3">
                <FxIconButton aria-label="Add" variant="outline" size="xs">
                  <Plus className="size-4" />
                </FxIconButton>
                <FxIconButton aria-label="Search" variant="ghost" size="sm">
                  <Search className="size-4" />
                </FxIconButton>
                <FxIconButton aria-label="Settings" variant="secondary" size="md">
                  <Settings className="size-4" />
                </FxIconButton>
                <FxIconButton aria-label="Disabled" variant="outline" size="lg" disabled>
                  <Plus className="size-4" />
                </FxIconButton>
              </div>
            </div>
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="Badges" title="Tones, Variants, And Sizes">
          <div className="space-y-5">
            {["soft", "outline", "solid"].map((variant) => (
              <div key={variant} className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{variant}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {badgeTones.map((tone) => (
                    <FxBadge key={tone} tone={tone} variant={variant}>
                      {tone}
                    </FxBadge>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Sizes</p>
              <div className="flex flex-wrap items-center gap-2">
                <FxBadge size="xs" tone="primary">xs</FxBadge>
                <FxBadge size="sm" tone="primary">sm</FxBadge>
                <FxBadge size="md" tone="primary">md</FxBadge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">With Status Dot</p>
              <div className="flex flex-wrap items-center gap-2">
                <FxBadge tone="success" dot>Active</FxBadge>
                <FxBadge tone="warning" dot>Pending</FxBadge>
                <FxBadge tone="danger" dot>Blocked</FxBadge>
                <FxBadge tone="subtle" dot>Draft</FxBadge>
              </div>
            </div>
          </div>
        </FxPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="Inputs" title="Text Fields">
          <div className="space-y-4">
            <FxInput label="Workspace Name" defaultValue="Revenue Ops" />
            <FxInput label="Owner Email" placeholder="owner@evality.ai" message="Please enter a valid work email." />
            <FxTextarea label="Internal Note" defaultValue="Keep workbook naming aligned with the source system." />
            <div className="space-y-2">
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Select</p>
              <div className="flex h-10 items-center justify-between border border-border bg-[var(--fx-surface)] px-3 text-sm text-foreground">
                <span>Pending primitive</span>
                <span className="text-muted-foreground">v</span>
              </div>
            </div>
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="Selection" title="Choice Controls">
          <div className="space-y-4">
            <FxCheckboxField defaultChecked label="Auto-archive drafts" description="Move untouched drafts out of the active workspace after 30 days." />
            <FxSwitchField defaultChecked label="Analyst notifications" description="Send updates when review state changes." />
            <FxRadioGroupField
              defaultValue="team"
              label="Approval Mode"
              options={[
                { value: "solo", label: "Single Owner", description: "One reviewer controls the decision path." },
                { value: "team", label: "Team Review", description: "A small group can update the state." },
              ]}
            />
          </div>
        </FxPanel>
      </div>

      <FxPanel {...specPanelTone} eyebrow="Tabs" title="Variant Matrix">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Rounded / pill</p>
            <FxTabs
              variant="rounded"
              defaultValue="overview"
              tabs={[
                { value: "overview", label: "Overview", count: 12 },
                { value: "activity", label: "Activity", count: 5 },
                { value: "history", label: "History", count: 2 },
              ]}
            >
              <FxTabs.Content value="overview">
                <p className="text-sm leading-6 text-muted-foreground">Rounded tabs feel like a calm workspace switcher.</p>
              </FxTabs.Content>
              <FxTabs.Content value="activity">
                <p className="text-sm leading-6 text-muted-foreground">Counts stay visible without becoming noisy.</p>
              </FxTabs.Content>
              <FxTabs.Content value="history">
                <p className="text-sm leading-6 text-muted-foreground">Use the pill shape when the tabs are the primary control.</p>
              </FxTabs.Content>
            </FxTabs>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Underlined</p>
              <FxTabs
                variant="underlined"
                defaultValue="overview"
                tabs={[
                  { value: "overview", label: "Overview" },
                  { value: "filters", label: "Filters", count: 4 },
                  { value: "history", label: "History" },
                ]}
              >
                <FxTabs.Content value="overview">
                  <p className="text-sm leading-6 text-muted-foreground">Best for light-weight section switching.</p>
                </FxTabs.Content>
                <FxTabs.Content value="filters">
                  <p className="text-sm leading-6 text-muted-foreground">Counts can still sit inline without extra chrome.</p>
                </FxTabs.Content>
                <FxTabs.Content value="history">
                  <p className="text-sm leading-6 text-muted-foreground">Keep the line thin and the labels short.</p>
                </FxTabs.Content>
              </FxTabs>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Segmented</p>
              <FxTabs
                variant="segmented"
                defaultValue="overview"
                tabs={[
                  { value: "overview", label: "Overview" },
                  { value: "filters", label: "Filters" },
                  { value: "history", label: "History", count: 8 },
                ]}
              >
                <FxTabs.Content value="overview">
                  <p className="text-sm leading-6 text-muted-foreground">Segmented tabs work well in compact toolbars.</p>
                </FxTabs.Content>
                <FxTabs.Content value="filters">
                  <p className="text-sm leading-6 text-muted-foreground">The active tab gets a stronger surface without a hard edge.</p>
                </FxTabs.Content>
                <FxTabs.Content value="history">
                  <p className="text-sm leading-6 text-muted-foreground">Use this when you want a tab strip with more density.</p>
                </FxTabs.Content>
              </FxTabs>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Regular</p>
            <FxTabs
              variant="regular"
              defaultValue="overview"
              tabs={[
                { value: "overview", label: "Overview" },
                { value: "filters", label: "Filters", count: 4 },
                { value: "history", label: "History" },
              ]}
            >
              <FxTabs.Content value="overview">
                <p className="text-sm leading-6 text-muted-foreground">This is the most utilitarian form, good for lists and settings.</p>
              </FxTabs.Content>
              <FxTabs.Content value="filters">
                <p className="text-sm leading-6 text-muted-foreground">It fills the width and reads like a strip of controls.</p>
              </FxTabs.Content>
              <FxTabs.Content value="history">
                <p className="text-sm leading-6 text-muted-foreground">Prefer it when tabs sit above dense content.</p>
              </FxTabs.Content>
            </FxTabs>
          </div>
        </div>
      </FxPanel>
    </div>
  );
}

function SurfacesSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Surfaces"
        title="Dialogs, sheets, tables, empty states, toasts, and icons"
        note="Surface and feedback patterns."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="Dialog" title="Dialog Preview">
          <div className="flex min-h-[220px] items-center justify-center border border-border bg-[color:color-mix(in_srgb,var(--fx-dark-panel)_10%,white)] px-6 py-8">
            <div className="w-full max-w-[520px] border border-border bg-[var(--fx-surface-raised)] px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <p className="text-[20px] font-semibold text-foreground">Confirm data refresh</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Replace the current snapshot with the latest source export.</p>
              <div className="mt-5 flex justify-end gap-3">
                <FxButton variant="ghost">Cancel</FxButton>
                <FxButton>Refresh</FxButton>
              </div>
            </div>
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="Sheet" title="Sheet Preview">
          <div className="grid min-h-[220px] grid-cols-[minmax(0,1fr)_420px] overflow-hidden border border-border">
            <div className="bg-[var(--fx-bg-soft)]" />
            <div className="border-l border-border bg-[var(--fx-surface-raised)] px-6 py-5 shadow-[-6px_0_18px_rgba(15,23,42,0.04)]">
              <p className="text-[20px] font-semibold text-foreground">Configuration Sheet</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Working pane with low visual weight.</p>
              <div className="mt-6 space-y-3">
                <div className="h-10 border border-border bg-[var(--fx-surface-subtle)]" />
                <div className="h-10 border border-border bg-[var(--fx-surface-subtle)]" />
                <div className="h-28 border border-border bg-[var(--fx-surface-subtle)]" />
              </div>
            </div>
          </div>
        </FxPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <FxPanel {...specPanelTone} eyebrow="Table" title="Data Surface">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dataset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ["Workspace Audit", "Ready", "12 Jun"],
                ["Claims Intake", "Review", "18 Jun"],
                ["Revenue Forecast", "Blocked", "21 Jun"],
                ["Churn Watchlist", "Ready", "24 Jun"],
              ].map(([name, status, updated]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>{updated}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </FxPanel>

        <div className="space-y-6">
          <FxPanel {...specPanelTone} eyebrow="Empty State" title="Empty State">
            <div className="flex flex-col items-start gap-4 border border-dashed border-border bg-[var(--fx-surface-subtle)] px-5 py-6">
              <Inbox className="size-6 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">No datasets yet</p>
                <p className="text-sm leading-6 text-muted-foreground">Import a source file or connect a system to start.</p>
              </div>
              <FxButton size="sm">Add source</FxButton>
            </div>
          </FxPanel>

          <FxPanel {...specPanelTone} eyebrow="Toast" title="Toast Preview">
            <div className="border border-border bg-[var(--fx-surface-raised)] px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              <p className="text-sm font-medium text-foreground">Export queued</p>
              <p className="mt-1 text-sm text-muted-foreground">Your workbook export is being prepared.</p>
            </div>
          </FxPanel>
        </div>
      </div>

      <FxPanel {...specPanelTone} eyebrow="FxTable" title="Data Table">
        <FxTableShowcase />
      </FxPanel>

      <FxPanel {...specPanelTone} eyebrow="Icons" title="Icon Set Preview">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {iconSet.map((Icon, index) => (
            <div key={index} className="flex items-center gap-3 border border-border bg-[var(--fx-surface)] px-4 py-3">
              <Icon className="size-4 text-foreground" />
              <span className="text-sm text-muted-foreground">Icon</span>
            </div>
          ))}
        </div>
      </FxPanel>
    </div>
  );
}

function FxUISection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="FxUI"
        title="Branded reusable component layer"
        note="Evality-specific composition built on shared primitives."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="Fx Components" title="Panels And Forms">
          <div className="space-y-4">
            <div className="space-y-3 border border-border bg-[var(--fx-surface)] px-5 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">FxPanel</p>
              <p className="text-sm leading-6 text-muted-foreground">Baseline surface wrapper for internal views.</p>
            </div>
            <FxInput label="FxInput" defaultValue="Revenue Ops" />
            <FxTextarea label="FxTextarea" defaultValue="Long-form internal notes go here." />
          </div>
        </FxPanel>

        <FxPanel {...specPanelTone} eyebrow="App Shell" title="Shell Components">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>`FxAppShell`, `FxAppHeader`, `FxAppSidebar`, `FxAppContent`, `FxAppFooter`, and `FxNotificationArea` are reviewed at `/dashboard`.</p>
            <p>`/ds` stays focused on visual review.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <FxBadge tone="subtle">FxAppShell</FxBadge>
            <FxBadge tone="subtle">FxAppHeader</FxBadge>
            <FxBadge tone="subtle">FxAppSidebar</FxBadge>
            <FxBadge tone="subtle">FxAppContent</FxBadge>
            <FxBadge tone="subtle">FxAppFooter</FxBadge>
            <FxBadge tone="subtle">FxNotificationArea</FxBadge>
          </div>
        </FxPanel>
      </div>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */

export default function DesignSystemPage() {
  return (
    <main className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={`${FX_LAYOUT.siteContainer} py-10 md:py-14`}>
        <section className={`space-y-5 ${FX_BORDER.divider} pb-8`}>
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Evality AI / Living Design System
            </p>
            <h1 className={`max-w-4xl text-foreground ${FX_TYPOGRAPHY.pageTitle} text-[40px] leading-[1] md:text-[44px]`}>
              Visual review surface for foundations, primitives, surfaces, and FxUI.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Token values come from `globals.css`. Shared class recipes come from `FxTheme.js`.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <FxTabs
            defaultValue="foundation"
            tabs={[
              { value: "foundation", label: "Foundation" },
              { value: "controls", label: "Controls" },
              { value: "surfaces", label: "Surfaces" },
              { value: "fxui", label: "FxUI" },
            ]}
          >
            <FxTabs.Content value="foundation">
              <FoundationSection />
            </FxTabs.Content>
            <FxTabs.Content value="controls">
              <ControlsSection />
            </FxTabs.Content>
            <FxTabs.Content value="surfaces">
              <SurfacesSection />
            </FxTabs.Content>
            <FxTabs.Content value="fxui">
              <FxUISection />
            </FxTabs.Content>
          </FxTabs>
        </section>
      </div>
    </main>
  );
}
