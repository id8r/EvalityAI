/* src/app/(workspace)/dashboard/page.js | Clean AppShell region skeleton review | Sree | 2026-06-25 */

/* - - - - - - - - - - - - - - - - */

function RegionBlock({ label, description, className = "" }) {
  return (
    <div className={`border border-border bg-[var(--fx-surface)] px-5 py-5 ${className}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

/* - - - - - - - - - - - - - - - - */

export default function WorkspaceDashboardPage() {
  return (
    <div className="min-h-full">
      {/* PAGE HEADER */}
      <div className="border-b border-border px-6 py-6 md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Workspace / Dashboard
        </p>
        <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-foreground">
          AppShell region skeleton
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          This route is intentionally reduced to shell architecture only. Review the frame, region
          ownership, spacing, and layout hierarchy, not product content.
        </p>
      </div>

      {/* PAGE BODY */}
      <div className="px-6 py-6 md:px-8 md:py-8">
        <div className="space-y-6">
        <RegionBlock
          label="FxNotificationArea"
          description="Full-width application banner. This is the first row of the shell and pushes every other region downward when present."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <RegionBlock
            label="FxAppHeader / Start Slot"
            description="Logo, brand, navigation trigger, or leading utilities."
          />
          <RegionBlock
            label="FxAppHeader / Middle Slot"
            description="Shared centered region for top-level navigation, search, or structural controls."
          />
          <RegionBlock
            label="FxAppHeader / End Slot"
            description="Actions, auth actions, or user menu entry point."
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <RegionBlock
              label="FxAppContent / Main Content Region"
              description="Primary workspace surface. FxAppContent owns scrolling, content framing, and page padding."
              className="min-h-[240px]"
            />

            <div className="grid gap-6 md:grid-cols-2">
              <RegionBlock
                label="FxAppFooter"
                description="Optional shell footer region, hidden by default outside the review pass."
              />
              <RegionBlock
                label="FxAppShell"
                description="Composition root owning viewport height, shell rows, shell columns, and region boundaries."
              />
            </div>
          </div>

          <RegionBlock
            label="FxRightPanel"
            description="Optional utility shell region for future inspector, activity, or contextual tools."
            className="min-h-[240px]"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <RegionBlock
            label="FxAppSidebar / Header"
            description="Top area of the left workspace navigation for identity or future collapse controls."
          />
          <RegionBlock
            label="FxAppSidebar / Body"
            description="Primary authenticated workspace navigation region."
          />
          <RegionBlock
            label="FxAppSidebar / Footer"
            description="Secondary sidebar region for support links, status, or small utility items."
          />
        </div>
        </div>
      </div>
    </div>
  );
}
