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
import { FxButton, FxCheckboxField, FxInput, FxRadioGroupField, FxSwitchField, FxTextarea } from "@/components/FxUI/Forms";
import { FxPanel } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxColorTokenCard } from "./FxColorTokenCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FX_BORDER,
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

const typeScale = [
  ["Page Title", "text-[28px] font-semibold leading-[1.15] tracking-tight", "Revenue intelligence for operational teams", "28px / 600"],
  ["Section Title", "text-[20px] font-semibold leading-[1.2]", "Workspace overview", "20px / 600"],
  ["Card Title", "text-[16px] font-semibold leading-[1.3]", "Pipeline status", "16px / 600"],
  ["Body", "text-[14px] font-normal leading-[1.6]", "Evality turns operational work into structured, reviewable decisions.", "14px / 400"],
  ["Clickable", "text-[14px] font-medium leading-[1.4] text-primary", "Open workbook", "14px / 500"],
  ["Meta", "text-[13px] font-normal leading-[1.5] text-muted-foreground", "Updated 25 Jun 2026", "13px / 400"],
  ["Label", "text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground", "Dataset status", "12px / 500"],
];

const spacingScale = ["8", "16", "24", "32", "48", "64", "96"];
const iconSet = [Search, Filter, Plus, Inbox, Folder, FileText, Bell, Settings, User, CircleHelp, Sparkles];

/* - - - - - - - - - - - - - - - - */

function SectionHeader({ eyebrow, title, note }) {
  return (
    <div className="border-b border-border pb-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h2>
        {note ? <p className="max-w-2xl text-sm text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}

function ColorGroup({ group }) {
  return (
    <section className="space-y-4">
      <h3 className="text-base font-semibold text-foreground">{group.title}</h3>
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
    <div
      className={`space-y-5 rounded-[16px] border border-border bg-[var(--fx-surface)] p-4 md:p-5 ${
        dark ? "dark" : ""
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
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
        title="Color, type, spacing, radius, and shadow system"
        note="This is the living visual source of truth for core design language."
      />

      <FxPanel eyebrow="Colors">
        <div className="grid gap-5 xl:grid-cols-2">
          <ThemePalette theme="Light" />
          <ThemePalette theme="Dark" dark />
        </div>
      </FxPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel eyebrow="Typography" title="Type Scale" description="Hierarchy should come primarily from type, spacing, and structure.">
          <div className="space-y-4">
            {typeScale.map(([label, className, sample, meta]) => (
              <div key={label} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="font-mono text-xs text-muted-foreground">{meta}</p>
                </div>
                <p className={className}>{sample}</p>
              </div>
            ))}
          </div>
        </FxPanel>

        <FxPanel eyebrow="Layout" title="Spacing, Radius, And Shadow" description="Moderate radii, soft shadows, borders doing most of the structural work.">
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
                ["6px", "rounded-[6px]"],
                ["8px", "rounded-[8px]"],
                ["12px", "rounded-[12px]"],
              ].map(([label, radiusClass]) => (
                <div key={label} className="space-y-2">
                  <p className="font-mono text-xs text-muted-foreground">{label}</p>
                  <div className={`h-16 border border-border bg-[var(--fx-surface-subtle)] ${radiusClass}`} />
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
    </div>
  );
}

function ControlsSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Controls"
        title="Buttons, inputs, selection controls, tabs, and badges"
        note="This section should keep growing as the permanent review surface for everyday controls."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel eyebrow="Buttons" title="Action Hierarchy" description="Low-noise, professional action styles.">
          <div className="flex flex-wrap gap-3">
            <FxButton>Primary Action</FxButton>
            <FxButton variant="secondary">Secondary</FxButton>
            <FxButton variant="ghost">Ghost</FxButton>
            <FxButton variant="destructive">Delete</FxButton>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="default">ui/default</Button>
            <Button variant="outline">ui/outline</Button>
            <Button variant="ghost">ui/ghost</Button>
          </div>
        </FxPanel>

        <FxPanel eyebrow="Badges" title="Status Markers" description="Use color for meaning, not decoration.">
          <div className="flex flex-wrap gap-3">
            <FxBadge>Default</FxBadge>
            <FxBadge tone="secondary">Secondary</FxBadge>
            <FxBadge tone="outline">Outline</FxBadge>
            <FxBadge tone="success">Ready</FxBadge>
            <FxBadge tone="warning">Warning</FxBadge>
            <FxBadge tone="destructive">Blocked</FxBadge>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge>ui/badge</Badge>
            <Badge variant="secondary">ui/secondary</Badge>
            <Badge variant="outline">ui/outline</Badge>
          </div>
        </FxPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel eyebrow="Inputs" title="Text Fields" description="Fields should feel light, bordered, and efficient to scan.">
          <div className="space-y-4">
            <FxInput label="Workspace Name" defaultValue="Revenue Ops" hint="Used in headers and exports." />
            <FxInput label="Owner Email" placeholder="owner@evality.ai" message="Please enter a valid work email." />
            <FxTextarea label="Internal Note" defaultValue="Keep workbook naming aligned with the source system." hint="Long-form helper text and audit notes." />
            <div className="space-y-2">
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Select</p>
              <div className="flex h-10 items-center justify-between border border-border bg-[var(--fx-surface)] px-3 text-sm text-foreground">
                <span>Pending primitive</span>
                <span className="text-muted-foreground">v</span>
              </div>
            </div>
          </div>
        </FxPanel>

        <FxPanel eyebrow="Selection" title="Choice Controls" description="Choice controls should stay structured and neutral.">
          <div className="space-y-4">
            <FxCheckboxField defaultChecked label="Auto-archive drafts" description="Move untouched drafts out of the active workspace after 30 days." />
            <FxSwitchField defaultChecked label="Analyst Notifications" description="Send updates when review state changes." />
            <FxRadioGroupField
              defaultValue="team"
              label="Approval Mode"
              description="Generic selection pattern for future products."
              options={[
                { value: "solo", label: "Single Owner", description: "One reviewer controls the decision path." },
                { value: "team", label: "Team Review", description: "A small group can update the state collaboratively." },
              ]}
            />
          </div>
        </FxPanel>
      </div>

      <FxPanel eyebrow="Tabs" title="Section Navigation" description="Tabs should feel structural, not decorative.">
        <FxTabs
          defaultValue="overview"
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "filters", label: "Filters" },
            { value: "history", label: "History" },
          ]}
        >
          <FxTabs.Content value="overview">
            <p className="text-sm leading-6 text-muted-foreground">Use tabs for calm structural navigation between related views.</p>
          </FxTabs.Content>
          <FxTabs.Content value="filters">
            <p className="text-sm leading-6 text-muted-foreground">Tabs should not become bright or over-styled.</p>
          </FxTabs.Content>
          <FxTabs.Content value="history">
            <p className="text-sm leading-6 text-muted-foreground">Prefer typography and spacing over decorative effects.</p>
          </FxTabs.Content>
        </FxTabs>
      </FxPanel>
    </div>
  );
}

function SurfacesSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Surfaces"
        title="Sheets, dialogs, tables, toasts, empty states, and icons"
        note="Some specimens are visual previews until their richer interactions are implemented."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel eyebrow="Dialog" title="Dialog Preview" description="Overlay surfaces should stay crisp and restrained.">
          <div className="flex min-h-[220px] items-center justify-center border border-border bg-[color:color-mix(in_srgb,var(--fx-dark-panel)_10%,white)] px-6 py-8">
            <div className="w-full max-w-[520px] border border-border bg-[var(--fx-surface-raised)] px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <p className="text-[20px] font-semibold text-foreground">Confirm data refresh</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Replace the current snapshot with the latest source export for this workspace.</p>
              <div className="mt-5 flex justify-end gap-3">
                <FxButton variant="ghost">Cancel</FxButton>
                <FxButton>Refresh</FxButton>
              </div>
            </div>
          </div>
        </FxPanel>

        <FxPanel eyebrow="Sheet" title="Sheet Preview" description="Large working surfaces can expand from the side without becoming visually heavy.">
          <div className="grid min-h-[220px] grid-cols-[minmax(0,1fr)_420px] overflow-hidden border border-border">
            <div className="bg-[var(--fx-bg-soft)]" />
            <div className="border-l border-border bg-[var(--fx-surface-raised)] px-6 py-5 shadow-[-6px_0_18px_rgba(15,23,42,0.04)]">
              <p className="text-[20px] font-semibold text-foreground">Configuration Sheet</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Sheets should feel like working panes, not modals with oversized decoration.</p>
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
        <FxPanel eyebrow="Table" title="Data Surface" description="Large tables should remain clean and readable.">
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
          <FxPanel eyebrow="Empty State" title="Empty State" description="Keep empty states calm and useful, not playful.">
            <div className="flex flex-col items-start gap-4 border border-dashed border-border bg-[var(--fx-surface-subtle)] px-5 py-6">
              <Inbox className="size-6 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">No datasets yet</p>
                <p className="text-sm leading-6 text-muted-foreground">Import a source file or connect a system to start building structured workspaces.</p>
              </div>
              <FxButton size="sm">Add source</FxButton>
            </div>
          </FxPanel>

          <FxPanel eyebrow="Toast" title="Toast Preview" description="Feedback should be compact, informative, and low-noise.">
            <div className="border border-border bg-[var(--fx-surface-raised)] px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              <p className="text-sm font-medium text-foreground">Export queued</p>
              <p className="mt-1 text-sm text-muted-foreground">Your workbook export is being prepared.</p>
            </div>
          </FxPanel>
        </div>
      </div>

      <FxPanel eyebrow="Icons" title="Icon Set Preview" description="Icons should stay functional, light, and consistent in weight.">
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
        note="This is where Evality-specific composition should live without product-specific logic."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel eyebrow="Fx Components" title="Panels And Forms" description="Reusable, branded blocks built on top of low-level primitives.">
          <div className="space-y-4">
            <FxPanel
              eyebrow="Nested Panel"
              title="FxPanel"
              description="Panels should remain crisp, neutral, and reusable."
              footer={<p className="text-[13px] text-muted-foreground">Footer region for metadata or actions.</p>}
            >
              <p className="text-sm leading-6 text-muted-foreground">This is the baseline Evality surface wrapper for internal tools and workspace views.</p>
            </FxPanel>

            <FxInput label="FxInput" defaultValue="Revenue Ops" hint="Reusable field wrapper with label and hint." />
            <FxTextarea label="FxTextarea" defaultValue="Long-form internal notes go here." />
          </div>
        </FxPanel>

        <FxPanel eyebrow="App Shell" title="Shell Components" description="The shell itself is part of the growing FxUI system.">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>`FxAppShell`, `FxAppHeader`, `FxAppSidebar`, `FxAppContent`, `FxAppFooter`, and `FxNotificationArea` are reviewed live at `/dashboard`.</p>
            <p>`/ds` remains the public visual system playground and should keep growing as the permanent component library.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <FxBadge tone="secondary">FxAppShell</FxBadge>
            <FxBadge tone="secondary">FxAppHeader</FxBadge>
            <FxBadge tone="secondary">FxAppSidebar</FxBadge>
            <FxBadge tone="secondary">FxAppContent</FxBadge>
            <FxBadge tone="secondary">FxAppFooter</FxBadge>
            <FxBadge tone="secondary">FxNotificationArea</FxBadge>
          </div>
        </FxPanel>
      </div>
    </div>
  );
}

function RecipesSection() {
  const typographyRoles = [
    ["pageTitle", "Page title"],
    ["sectionTitle", "Section title"],
    ["cardTitle", "Card title"],
    ["body", "Body text for scanning and reading"],
    ["clickable", "Clickable / link value"],
    ["meta", "Meta helper text"],
    ["label", "Label"],
    ["eyebrow", "Eyebrow label"],
  ];

  const surfaceRoles = ["surface", "subtle", "raised", "muted", "hover", "selected"];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Recipes"
        title="FxTheme reusable class recipes"
        note="Live specimens rendered directly from the FX_* recipe groups in src/lib/FxTheme.js. Components consume these instead of re-inlining values."
      />

      <FxPanel eyebrow="FX_TYPOGRAPHY" title="Type Roles" description="Size, weight, and line-height only. Color stays with the consumer.">
        <div className="space-y-4">
          {typographyRoles.map(([key, sample]) => (
            <div key={key} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="font-mono text-xs text-muted-foreground">FX_TYPOGRAPHY.{key}</p>
              </div>
              <p className={`${FX_TYPOGRAPHY[key]} text-foreground`}>{sample}</p>
            </div>
          ))}
        </div>
      </FxPanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel eyebrow="FX_RADIUS" title="Radii" description="Moderate corners; pill for fully rounded.">
          <div className="grid gap-4 sm:grid-cols-4">
            {Object.entries(FX_RADIUS).map(([key, recipe]) => (
              <div key={key} className="space-y-2">
                <div className={`h-16 border border-border bg-[var(--fx-surface-subtle)] ${recipe}`} />
                <p className="font-mono text-xs text-muted-foreground">{key}</p>
              </div>
            ))}
          </div>
        </FxPanel>

        <FxPanel eyebrow="FX_SHADOW" title="Elevation" description="Soft and minimal. Each level carries a dark-mode override.">
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
        <FxPanel eyebrow="FX_SURFACE" title="Surfaces" description="Token-driven, so these resolve correctly in both themes.">
          <div className="grid gap-3 sm:grid-cols-2">
            {surfaceRoles.map((key) => (
              <div key={key} className={`flex h-16 items-center px-4 ${FX_BORDER.base} border ${FX_SURFACE[key]} ${FX_RADIUS.md}`}>
                <p className="font-mono text-xs text-[var(--fx-text-muted)]">{key}</p>
              </div>
            ))}
          </div>
        </FxPanel>

        <FxPanel eyebrow="FX_SPACE" title="Spacing Scale" description="The 8px vocabulary, composed into arbitrary classes by consumers.">
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

/* - - - - - - - - - - - - - - - - */

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--fx-bg-soft)_0,var(--fx-bg)_240px,var(--fx-bg)_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <section className="space-y-8 border-b border-border pb-10">
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Evality AI / Living Design System
            </p>
            <h1 className="max-w-5xl text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground">
              Live visual playground for foundations, primitives, surfaces, and reusable Fx components.
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
              `/ds` is the permanent visual system review surface. Design decisions live in markdown.
              Architecture decisions live in markdown. This page stays for specimens and visual review.
            </p>
          </div>

        </section>

        <section className="mt-10">
          <FxTabs
            defaultValue="foundation"
            tabs={[
              { value: "foundation", label: "Foundation" },
              { value: "recipes", label: "Recipes" },
              { value: "controls", label: "Controls" },
              { value: "surfaces", label: "Surfaces" },
              { value: "fxui", label: "FxUI" },
            ]}
          >
            <FxTabs.Content value="foundation">
              <FoundationSection />
            </FxTabs.Content>
            <FxTabs.Content value="recipes">
              <RecipesSection />
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
