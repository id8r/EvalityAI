import { FxAppShell } from "@/components/FxUI/FxAppShell";
import { FxBadge } from "@/components/FxUI/FxBadge";
import { FxButton } from "@/components/FxUI/FxButton";
import { FxInput } from "@/components/FxUI/FxInput";
import { FxPageFrame } from "@/components/FxUI/FxPageFrame";
import { FxPanel } from "@/components/FxUI/FxPanel";
import { FxSidebar } from "@/components/FxUI/FxSidebar";
import { FxTabs } from "@/components/FxUI/FxTabs";
import { FxTextarea } from "@/components/FxUI/FxTextarea";
import { FxTopbar } from "@/components/FxUI/FxTopbar";

const colorGroups = [
  {
    title: "Brand",
    note: "Primary action and accent signals.",
    items: [
      ["--fx-primary", "Primary"],
      ["--fx-primary-hover", "Primary Hover"],
      ["--fx-accent", "Accent"],
      ["--fx-primary-foreground", "Primary Foreground"],
    ],
  },
  {
    title: "Surfaces",
    note: "Canvas, panel, hover, and selected states.",
    items: [
      ["--fx-bg", "App Background"],
      ["--fx-bg-soft", "Soft Background"],
      ["--fx-surface", "Surface"],
      ["--fx-surface-subtle", "Surface Subtle"],
      ["--fx-surface-raised", "Surface Raised"],
      ["--fx-surface-muted", "Surface Muted"],
      ["--fx-surface-hover", "Surface Hover"],
      ["--fx-surface-selected", "Surface Selected"],
    ],
  },
  {
    title: "Borders And Text",
    note: "Structural dividers and reading hierarchy.",
    items: [
      ["--fx-border-light", "Border Light"],
      ["--fx-border", "Border"],
      ["--fx-border-strong", "Border Strong"],
      ["--fx-text", "Text"],
      ["--fx-text-muted", "Text Muted"],
      ["--fx-text-subtle", "Text Subtle"],
      ["--fx-text-disabled", "Text Disabled"],
    ],
  },
  {
    title: "Semantic",
    note: "Status and guidance colors.",
    items: [
      ["--fx-success", "Success"],
      ["--fx-warning", "Warning"],
      ["--fx-danger", "Danger"],
      ["--fx-info-surface", "Info Surface"],
      ["--fx-ring", "Ring"],
    ],
  },
  {
    title: "Table",
    note: "Explicit tokens for dense data surfaces.",
    items: [
      ["--fx-table-header", "Table Header"],
      ["--fx-table-row-alt", "Table Row Alt"],
    ],
  },
];

const typeScale = [
  {
    role: "Page Title",
    size: "28px",
    weight: "600",
    className: "text-[28px] font-semibold leading-[1.15] tracking-tight",
    sample: "Revenue intelligence for operational teams",
    usage: "Page headings",
  },
  {
    role: "Section Title",
    size: "20px",
    weight: "600",
    className: "text-[20px] font-semibold leading-[1.2]",
    sample: "System Overview",
    usage: "Sections",
  },
  {
    role: "Card Title",
    size: "16px",
    weight: "600",
    className: "text-[16px] font-semibold leading-[1.3]",
    sample: "Pipeline Status",
    usage: "Cards, sheets, dialogs",
  },
  {
    role: "Body",
    size: "14px",
    weight: "400",
    className: "text-[14px] font-normal leading-[1.6]",
    sample: "Evality turns raw workflows into structured, reviewable decisions.",
    usage: "Default text",
  },
  {
    role: "Clickable",
    size: "14px",
    weight: "500",
    className: "text-[14px] font-medium leading-[1.4] text-primary",
    sample: "Open forecast workbook",
    usage: "Links, clickable values",
  },
  {
    role: "Meta",
    size: "13px",
    weight: "400",
    className: "text-[13px] font-normal leading-[1.5] text-muted-foreground",
    sample: "Updated 25 Jun 2026",
    usage: "Helper text",
  },
  {
    role: "Label",
    size: "12px",
    weight: "500",
    className: "text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
    sample: "Dataset Status",
    usage: "Labels, table headers",
  },
];

const primitiveGroups = [
  {
    title: "Core Input",
    items: ["button", "input", "textarea", "label", "checkbox", "radio-group", "switch"],
  },
  {
    title: "Overlay And Navigation",
    items: ["dialog", "sheet", "alert-dialog", "dropdown-menu", "popover", "tooltip", "tabs"],
  },
  {
    title: "Structure And Feedback",
    items: ["table", "badge", "separator", "scroll-area", "sonner"],
  },
];

const shellRules = [
  ["Viewport height ownership", "Owned by `FxAppShell` via `h-[100dvh]` and `overflow-hidden`."],
  ["Sidebar width", "Desktop assumption is `272px`; hidden below `lg` for now."],
  ["Topbar height", "Topbar is a consistent `56px` structural header."],
  ["Content scroll ownership", "`FxPageFrame` owns the primary vertical scroll region."],
  ["Page padding", "Default page padding is `24px` to `32px` depending on breakpoint."],
  ["Background layering", "Shell uses subtle bg gradient, surfaces and borders do the structural work."],
  ["Sticky regions", "Topbar is sticky by default; sidebar is fixed within the shell column."],
  ["Responsive assumptions", "Desktop-first workspace shell for review. Mobile behavior stays intentionally minimal for now."],
];

function TokenRow({ token, label }) {
  const previewStyle =
    token === "--fx-table-row-alt"
      ? {
          background:
            "repeating-linear-gradient(135deg, var(--fx-surface) 0 12px, var(--fx-bg-soft) 12px 24px)",
        }
      : { background: `var(${token})` };

  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)_160px] items-center gap-4 border-t border-border py-3 first:border-t-0">
      <div className="h-10 border border-border" style={previewStyle} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">{token}</p>
      </div>
      <code className="justify-self-end font-mono text-xs text-muted-foreground">
        var({token})
      </code>
    </div>
  );
}

function SectionHeader({ eyebrow, title, note }) {
  return (
    <div className="border-b border-border pb-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h2>
        {note ? <p className="max-w-xl text-sm text-muted-foreground">{note}</p> : null}
      </div>
    </div>
  );
}

function TablePreview() {
  const rows = [
    ["Workspace Audit", "Ready", "12 Jun"],
    ["Claims Intake", "Review", "18 Jun"],
    ["Revenue Forecast", "Blocked", "21 Jun"],
    ["Churn Watchlist", "Ready", "24 Jun"],
  ];

  return (
    <div className="border border-border bg-[var(--fx-surface)]">
      <table className="w-full border-collapse text-sm">
        <thead style={{ background: "var(--fx-table-header)" }}>
          <tr className="text-left">
            <th className="border-b border-border px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Dataset
            </th>
            <th className="border-b border-border px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Status
            </th>
            <th className="border-b border-border px-4 py-3 text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row[0]}
              className="border-b border-border last:border-b-0"
              style={{
                background:
                  index % 2 === 1 ? "var(--fx-table-row-alt)" : "var(--fx-surface)",
              }}
            >
              <td className="px-4 py-3 text-foreground">{row[0]}</td>
              <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
              <td className="px-4 py-3 text-muted-foreground">{row[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FoundationSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Foundation"
        title="Tokens, Type, And Core Layout Rules"
        note="Foundations stay explicit here so future components inherit the same visual discipline."
      />

      <div className="space-y-8">
        {colorGroups.map((group) => (
          <section key={group.title} className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
            <div>
              <h3 className="text-base font-semibold text-foreground">{group.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{group.note}</p>
            </div>
            <div className="border border-border bg-[var(--fx-surface)] px-4">
              {group.items.map(([token, label]) => (
                <TokenRow key={token} token={token} label={label} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <FxPanel
          eyebrow="Table"
          title="Data Surface Preview"
          description="Live check for header treatment, row rhythm, and readability in dense layouts."
        >
          <TablePreview />
        </FxPanel>

        <FxPanel
          eyebrow="Typography"
          title="Type Scale"
          description="Current hierarchy pulled from the design-system notes."
        >
          <div className="space-y-4">
            {typeScale.map((item) => (
              <div key={item.role} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{item.role}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.size} / {item.weight}
                  </p>
                </div>
                <p className={item.className}>{item.sample}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.usage}</p>
              </div>
            ))}
          </div>
        </FxPanel>
      </div>
    </div>
  );
}

function PrimitivesSection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Primitives"
        title="Low-Level UI Base"
        note="These stay in `src/components/ui` as the Radix or shadcn-level layer. They are not product components."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {primitiveGroups.map((group) => (
          <FxPanel
            key={group.title}
            eyebrow="ui"
            title={group.title}
            description="Approved low-level primitives for the reset project."
          >
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <FxBadge key={item} tone="secondary">
                  {item}
                </FxBadge>
              ))}
            </div>
          </FxPanel>
        ))}
      </div>
    </div>
  );
}

function FxUISection() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="FxUI"
        title="Branded Reusable Layer"
        note="`FxUI` composes the primitive layer into calm, product-agnostic workspace components."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FxPanel
          eyebrow="Actions"
          title="Buttons And Status"
          description="Surface language should feel crisp, restrained, and reusable across future products."
        >
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <FxButton>Primary Action</FxButton>
              <FxButton variant="secondary">Secondary</FxButton>
              <FxButton variant="ghost">Ghost</FxButton>
              <FxButton variant="destructive">Delete</FxButton>
            </div>
            <div className="flex flex-wrap gap-3">
              <FxBadge>Default</FxBadge>
              <FxBadge tone="secondary">Secondary</FxBadge>
              <FxBadge tone="outline">Outline</FxBadge>
              <FxBadge tone="success">Ready</FxBadge>
              <FxBadge tone="warning">Warning</FxBadge>
              <FxBadge tone="destructive">Blocked</FxBadge>
            </div>
          </div>
        </FxPanel>

        <FxPanel
          eyebrow="Fields"
          title="Form Surface"
          description="Inputs should stay light, bordered, and efficient to scan."
        >
          <div className="space-y-4">
            <FxInput
              label="Workspace Name"
              name="workspaceName"
              defaultValue="Revenue Ops"
              hint="Used in headers and exports."
            />
            <FxInput
              label="Owner Email"
              name="ownerEmail"
              placeholder="owner@evality.ai"
              message="Please enter a valid work email."
            />
            <FxTextarea
              label="Internal Note"
              name="internalNote"
              defaultValue="Keep workbook naming aligned with the source system."
              hint="Long-form helper text and audit notes."
            />
          </div>
        </FxPanel>
      </div>
    </div>
  );
}

function AppShellPreview() {
  const sidebar = (
    <FxSidebar
      brand={
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Evality AI
          </p>
          <p className="truncate text-sm font-semibold text-foreground">Workspace Shell</p>
        </div>
      }
      nav={
        <div className="space-y-1">
          {["Overview", "Workbooks", "Approvals", "Activity", "Settings"].map((item, index) => (
            <div
              key={item}
              className={
                index === 0
                  ? "border border-border bg-[var(--fx-surface-hover)] px-3 py-2 text-sm font-medium text-foreground"
                  : "px-3 py-2 text-sm text-muted-foreground"
              }
            >
              {item}
            </div>
          ))}
        </div>
      }
      footer={
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Responsive Assumption
          </p>
          <p className="text-[13px] leading-5 text-muted-foreground">
            Sidebar is desktop-first and hidden below `lg` until the mobile shell is designed.
          </p>
        </div>
      }
    />
  );

  const topbar = (
    <FxTopbar
      title="Quarterly Review Workspace"
      subtitle="Generic shell preview, no product-specific logic."
      actions={
        <>
          <FxButton variant="ghost" size="sm">
            Filter
          </FxButton>
          <FxButton variant="secondary" size="sm">
            Export
          </FxButton>
        </>
      }
    />
  );

  const pageHeader = (
    <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Page Frame
        </p>
        <h2 className="text-[28px] font-semibold tracking-tight text-foreground">
          Content region owns the scroll
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          The sidebar and topbar stay structurally stable while the page frame handles
          vertical scroll and page padding.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <FxBadge tone="secondary">56px Topbar</FxBadge>
        <FxBadge tone="secondary">272px Sidebar</FxBadge>
        <FxBadge tone="secondary">24-32px Padding</FxBadge>
      </div>
    </div>
  );

  const pageAside = (
    <div className="space-y-4">
      <FxPanel
        eyebrow="Aside"
        title="Secondary Column"
        description="Optional supporting region for summaries, filters, or metadata."
      >
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Keep this column quiet. It should support the main surface, not compete with it.</p>
          <p>Use borders and spacing before adding heavier visual emphasis.</p>
        </div>
      </FxPanel>
    </div>
  );

  const pageContent = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Open Reviews", "18", "Ready"],
          ["Pending Decisions", "7", "Warning"],
          ["Blocked Items", "2", "Blocked"],
        ].map(([label, value, status]) => (
          <FxPanel key={label} eyebrow="Metric" title={value} description={label}>
            <FxBadge tone={status === "Ready" ? "success" : status === "Warning" ? "warning" : "destructive"}>
              {status}
            </FxBadge>
          </FxPanel>
        ))}
      </div>

      <FxPanel
        eyebrow="Primary Surface"
        title="Main Workspace Table"
        description="Dense work should live in the central surface with calm hierarchy and explicit borders."
      >
        <TablePreview />
      </FxPanel>
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="AppShell"
        title="Workspace Layout Foundation"
        note="This defines the structural rules for future application screens before any product logic is introduced."
      />

      <FxPanel
        eyebrow="Preview"
        title="Visible Shell Review"
        description="Viewport ownership, fixed regions, and content-scroll boundaries are shown here."
      >
        <div className="overflow-hidden border border-border">
          <FxAppShell
            className="h-[760px]"
            sidebar={sidebar}
            topbar={topbar}
            mobileBanner="Mobile shell is intentionally deferred. Desktop workspace rules are the current focus."
          >
            <FxPageFrame header={pageHeader} aside={pageAside}>
              {pageContent}
            </FxPageFrame>
          </FxAppShell>
        </div>
      </FxPanel>

      <FxPanel
        eyebrow="Rules"
        title="Shell Contract"
        description="The shell should remain generic and reusable across future products."
      >
        <div className="grid gap-3">
          {shellRules.map(([label, note]) => (
            <div key={label} className="grid gap-1 border-t border-border pt-3 first:border-t-0 first:pt-0 md:grid-cols-[220px_minmax(0,1fr)]">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-sm leading-6 text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </FxPanel>
    </div>
  );
}

export const metadata = {
  title: "Evality Design System",
  description: "Visual token and design-system reference for Evality AI.",
};

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,var(--fx-bg-soft)_0,var(--fx-bg)_240px,var(--fx-bg)_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <section className="space-y-8 border-b border-border pb-10">
          <div className="space-y-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Evality AI / Design System
            </p>
            <div className="space-y-3">
              <h1 className="max-w-4xl text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] text-foreground">
                Living reference for foundations, reusable UI, and workspace shell structure.
              </h1>
              <p className="max-w-3xl text-[15px] leading-7 text-muted-foreground">
                This page should stay readable as the system grows. Foundations, primitives,
                branded components, and shell rules are separated so review stays fast.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
            <div className="bg-[var(--fx-surface)] p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Primary
              </p>
              <div className="h-12 bg-primary" />
              <p className="mt-3 font-mono text-xs text-muted-foreground">--fx-primary</p>
            </div>
            <div className="bg-[var(--fx-surface)] p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Surface
              </p>
              <div className="h-12 border border-border bg-[var(--fx-surface-subtle)]" />
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                --fx-surface-subtle
              </p>
            </div>
            <div className="bg-[var(--fx-surface)] p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Layout
              </p>
              <div className="flex h-12 items-center border border-border bg-[var(--fx-bg-soft)] px-3 text-xs text-muted-foreground">
                100dvh shell / 272px sidebar / 56px topbar
              </div>
              <p className="mt-3 font-mono text-xs text-muted-foreground">AppShell contract</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <FxTabs
            defaultValue="foundation"
            tabs={[
              { value: "foundation", label: "Foundation" },
              { value: "primitives", label: "Primitives" },
              { value: "fxui", label: "FxUI" },
              { value: "appshell", label: "AppShell Preview" },
            ]}
          >
            <FxTabs.Content value="foundation">
              <FoundationSection />
            </FxTabs.Content>
            <FxTabs.Content value="primitives">
              <PrimitivesSection />
            </FxTabs.Content>
            <FxTabs.Content value="fxui">
              <FxUISection />
            </FxTabs.Content>
            <FxTabs.Content value="appshell">
              <AppShellPreview />
            </FxTabs.Content>
          </FxTabs>
        </section>
      </div>
    </main>
  );
}
