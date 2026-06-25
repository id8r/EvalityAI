import { cn } from "@/lib/utils";

function FxAppShell({
  className,
  sidebar,
  topbar,
  children,
  mobileBanner,
}) {
  return (
    <div
      data-slot="fx-app-shell"
      className={cn(
        "relative h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,var(--fx-bg-soft)_0,var(--fx-bg)_160px,var(--fx-bg)_100%)]",
        className,
      )}
    >
      <div className="grid h-full min-h-0 lg:grid-cols-[272px_minmax(0,1fr)]">
        {sidebar}
        <div className="relative flex min-w-0 min-h-0 flex-col overflow-hidden">
          {mobileBanner ? (
            <div className="border-b border-border bg-[var(--fx-surface-subtle)] px-4 py-3 text-[13px] text-muted-foreground lg:hidden">
              {mobileBanner}
            </div>
          ) : null}
          {topbar}
          {children}
        </div>
      </div>
    </div>
  );
}

export { FxAppShell };
