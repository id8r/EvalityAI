import { cn } from "@/lib/utils";

function FxTopbar({
  className,
  title,
  subtitle,
  leading,
  actions,
  sticky = true,
}) {
  return (
    <header
      data-slot="fx-topbar"
      className={cn(
        "z-20 flex h-14 items-center justify-between gap-4 border-b border-border bg-[color:color-mix(in_srgb,var(--fx-surface)_92%,white)] px-6 backdrop-blur-sm",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        {leading ? <div className="flex items-center gap-2">{leading}</div> : null}
        <div className="min-w-0">
          {title ? <h1 className="truncate text-[16px] font-semibold text-foreground">{title}</h1> : null}
          {subtitle ? (
            <p className="truncate text-[13px] text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export { FxTopbar };
