/* src/app/ds/page.js | Living visual design system playground | Sree | 2026-06-25 */

import {
  Bell,
  ChevronDown,
  CircleHelp,
  ArrowLeft,
  FileText,
  Filter,
  Folder,
  Inbox,
  LogOut,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import Link from "next/link";

import { FxBadge, FxPdfViewer } from "@/components/FxUI/DataDisplay";
import { EvCandidateProgress } from "@/components/Ev/Candidates";
import { FxAiButton, FxButton, FxCheckboxField, FxCreatableSelect, FxEditableField, FxIconButton, FxInput, FxRadioGroupField, FxSwitchField, FxTextarea } from "@/components/FxUI/Forms";
import { FxPanel } from "@/components/FxUI/Layout";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxColorTokenCard } from "./FxColorTokenCard";
import { FxFormControlsShowcase } from "./FxFormControlsShowcase";
import { FxSheetShowcase } from "./FxSheetShowcase";
import { FxTableShowcase } from "./FxTableShowcase";
import { ROUTES } from "@/lib/FxConstants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STORAGE_KEYS } from "@/lib/FxConstants";
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
      "--fx-pdf-canvas",
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
    key: "title",
    label: "Title",
    sample: "Senior Backend Engineer",
    meta: "18px / 500",
  },
  {
    key: "cardTitle",
    label: "Card Title",
    sample: "Pipeline status",
    meta: "16px / 600",
  },
  {
    key: "backLink",
    label: "Back Link",
    sample: "All Jobs",
    meta: "16px / 500",
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

const buttonSizeSpecs = [
  {
    size: "xs",
    label: "XS",
    sample: "Tiny action",
    previewWidth: "w-[96px]",
    height: "28px",
    text: "12px",
    radius: "4px",
    padding: "8px",
  },
  {
    size: "sm",
    label: "SM",
    sample: "Small option",
    previewWidth: "w-[96px]",
    height: "34px",
    text: "13px",
    radius: "6px",
    padding: "8px",
  },
  {
    size: "md",
    label: "MD",
    sample: "Medium Action",
    previewWidth: "w-[120px]",
    height: "40px",
    text: "14px",
    radius: "8px",
    padding: "16px",
  },
  {
    size: "lg",
    label: "LG",
    sample: "Primary Action",
    previewWidth: "w-[120px]",
    height: "44px",
    text: "14px",
    radius: "8px",
    padding: "20px",
  },
  {
    size: "xl",
    label: "XL",
    sample: "Login Popup",
    previewWidth: "w-[120px]",
    height: "48px",
    text: "14px",
    radius: "10px",
    padding: "24px",
  },
];

const spacingScale = ["8", "16", "24", "32", "48", "64", "96"];
const iconSet = [Search, Filter, Plus, Inbox, Folder, FileText, Bell, Settings, User, CircleHelp, Sparkles];
const surfaceRoles = ["surface", "subtle", "raised", "muted", "hover", "selected"];
const badgeTones = ["neutral", "subtle", "primary", "success", "warning", "danger", "info"];
const roleOptions = [
  { value: "agency-recruiter", label: "Agency Recruiter", description: "Hiring across multiple clients." },
  { value: "in-house-recruiter", label: "In-house Recruiter", description: "Hiring for a single company." },
  { value: "hiring-manager", label: "Hiring Manager", description: "Owns a team's open roles." },
  { value: "founder", label: "Founder / CEO", description: "Hiring for an early-stage team." },
  { value: "talent-lead", label: "Talent Lead", description: "Leads a recruiting function." },
];
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
        title="Buttons, inputs, selection, tabs, menus, and badges"
        note="Everyday interaction patterns, in composition order."
      />

      <FxPanel {...specPanelTone} eyebrow="Buttons" title="Action Hierarchy">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Sizes</p>
              <div className="grid gap-3">
                {buttonSizeSpecs.map((spec) => (
                  <div
                    key={spec.size}
                    className="grid grid-cols-[56px_minmax(220px,1fr)_repeat(4,minmax(0,120px))] items-center gap-4 rounded-[12px] border border-border bg-[var(--fx-surface)] px-4 py-3"
                  >
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{spec.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Button</p>
                    </div>
                    <FxButton size={spec.size} className={`${spec.previewWidth} justify-center`}>
                      {spec.sample}
                    </FxButton>
                    <div className="text-[12px] leading-5 text-muted-foreground">
                      <p className="uppercase tracking-[0.12em]">Text</p>
                      <p className="mt-1 font-medium text-foreground">{spec.text}</p>
                    </div>
                    <div className="text-[12px] leading-5 text-muted-foreground">
                      <p className="uppercase tracking-[0.12em]">Height</p>
                      <p className="mt-1 font-medium text-foreground">{spec.height}</p>
                    </div>
                    <div className="text-[12px] leading-5 text-muted-foreground">
                      <p className="uppercase tracking-[0.12em]">Radius</p>
                      <p className="mt-1 font-medium text-foreground">{spec.radius}</p>
                    </div>
                    <div className="text-[12px] leading-5 text-muted-foreground">
                      <p className="uppercase tracking-[0.12em]">Padding</p>
                      <p className="mt-1 font-medium text-foreground">{spec.padding}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Variants</p>
              <div className="flex flex-wrap items-center gap-3">
                <FxButton>Primary</FxButton>
                <FxButton variant="secondary">Secondary</FxButton>
                <FxButton variant="outline">Outline</FxButton>
                <FxButton variant="ghost">Ghost</FxButton>
                <FxButton variant="destructive">Delete</FxButton>
                <FxButton variant="destructiveOutline">Delete Outline</FxButton>
                <FxButton variant="destructiveSoft">Delete Soft</FxButton>
                <FxAiButton>AI Action</FxAiButton>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel {...specPanelTone} eyebrow="Inputs" title="Text Fields">
          <div className="space-y-4">
            <FxInput label="Workspace Name" defaultValue="Revenue Ops" />
            <FxInput label="Owner Email" placeholder="owner@evality.ai" message="Please enter a valid work email." />

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Sizes (sm 34 · md 40 · lg 44)</p>
              <FxInput size="sm" placeholder="Small — 34px (default)" />
              <FxInput size="md" placeholder="Medium — 40px" />
              <FxInput size="lg" placeholder="Large — 44px" />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Underline variant</p>
              <FxInput variant="underline" placeholder="Bottom-bordered field" />
              <FxInput variant="underline" size="md" defaultValue="Inline editable value" />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Inline editable · pencil → edit (all selected) · Esc/✕ cancel · Enter/✓ save
              </p>
              <FxEditableField label="Name" value="Sree" />
              <FxEditableField label="Title" value="Founder" pencil="left" />
            </div>

            <p className="text-[11px] text-muted-foreground">
              Fields are clearable by default — type into any field above to reveal the clear ✕.
            </p>

            <FxTextarea label="Internal Note" defaultValue="Keep workbook naming aligned with the source system." />
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
              showIcons
              tabs={[
                { value: "overview", label: "Overview", count: 12, icon: Sparkles },
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
              underlineFullWidth
              tabs={[
                  { value: "overview", label: "Overview", icon: FileText },
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

      <FxPanel {...specPanelTone} eyebrow="Menus" title="Dropdown And Creatable Select">
        <div className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Dropdown menu</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <FxButton variant="outline" size="sm">
                  Open menu
                  <ChevronDown className="size-4" />
                </FxButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <CircleHelp className="size-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[var(--fx-danger)]">
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="text-[12px] leading-5 text-muted-foreground">
              Soft elevation + defined border, calm hover, sentence-case label — sits above dialogs.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Creatable select · persists to localStorage</p>
            <FxCreatableSelect
              options={roleOptions}
              placeholder="Select your role"
              createLabel="Create new role"
              storageKey={STORAGE_KEYS.role}
            />
            <p className="text-[12px] leading-5 text-muted-foreground">
              Search, pick, or type a new role and Create. Saved under <code className="font-mono text-[11px]">FxID8r.Role</code> — survives reload.
            </p>
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

      <FxFormControlsShowcase panelTone={specPanelTone} />
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
            <div className="w-full max-w-[520px] rounded-[20px] border border-border bg-[var(--fx-surface-raised)] px-6 py-5 shadow-[0_12px_36px_rgba(15,23,42,0.10)]">
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
          <FxSheetShowcase />
        </FxPanel>
      </div>

      <FxPanel {...specPanelTone} eyebrow="PDF" title="Resume Preview">
        <div className="h-[520px]">
          <FxPdfViewer file="/sample-resume.pdf" showToolbar />
        </div>
      </FxPanel>

      <FxPanel {...specPanelTone} eyebrow="EvCandidateProgress" title="Candidate Progress">
        <div className="space-y-8">
          {/* Horizontal (default) — sits in a Candidate Details column, minimal vertical footprint. */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-[var(--fx-text-muted)]">Horizontal · currently Interviewing</p>
            <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
              <EvCandidateProgress
                current="interviewing"
                dates={{ unscreened: "2026-06-10", pre_screened: "2026-06-12", shortlisted: "2026-06-16", interviewing: "2026-06-21" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[12px] font-medium text-[var(--fx-text-muted)]">Horizontal · joined (all cleared)</p>
            <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
              <EvCandidateProgress
                current="joined"
                dates={{ unscreened: "2026-05-28", pre_screened: "2026-05-30", shortlisted: "2026-06-03", interviewing: "2026-06-09", offered: "2026-06-14", joined: "2026-06-20" }}
              />
            </div>
          </div>

          {/* Vertical — for narrow columns; single-line rows keep it tight. */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-[var(--fx-text-muted)]">Vertical · narrow column</p>
            <div className="max-w-[280px] rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
              <EvCandidateProgress
                orientation="vertical"
                current="shortlisted"
                dates={{ unscreened: "2026-06-10", pre_screened: "2026-06-12", shortlisted: "2026-06-16" }}
              />
            </div>
          </div>
        </div>
      </FxPanel>

      <FxPanel {...specPanelTone} eyebrow="FxTable" title="Data Table">
        <FxTableShowcase />
      </FxPanel>

      <FxPanel {...specPanelTone} eyebrow="Icons" title="Icon Set Preview">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {iconSet.map((Icon, index) => (
            <div key={index} className="flex items-center justify-center rounded-[12px] border border-border bg-[var(--fx-surface)] px-4 py-6">
              <Icon className="size-5 text-foreground" />
            </div>
          ))}
        </div>
      </FxPanel>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */

export default function DesignSystemPage() {
  return (
    <main className={`min-h-screen ${FX_SURFACE.page}`}>
      <div className={`${FX_LAYOUT.siteContainer} py-10 md:py-14`}>
        <section className={`space-y-5 ${FX_BORDER.divider} pb-8`}>
          <div className="flex items-start justify-between gap-6">
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
            <Link
              href={ROUTES.workbench}
              className={`inline-flex shrink-0 items-center gap-2 self-start ${FX_TYPOGRAPHY.backLink} text-[var(--fx-text-muted)] transition-colors hover:text-[var(--fx-text)]`}
            >
              <ArrowLeft className="size-4" /> Back to Evality Mock App
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <FxTabs
            defaultValue="foundation"
            tabs={[
              { value: "foundation", label: "Foundation" },
              { value: "controls", label: "Controls" },
              { value: "surfaces", label: "Surfaces" },
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
          </FxTabs>
        </section>
      </div>
    </main>
  );
}
/* - - - - - - - - - - - - - - - - */
