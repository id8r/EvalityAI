/* src/app/(workspace)/dashboard/page.js | Clean AppShell region skeleton review | Sree | 2026-06-25 */

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
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */