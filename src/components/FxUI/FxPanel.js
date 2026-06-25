import { cn } from "@/lib/utils";

function FxPanel({ className, title, eyebrow, description, children, footer }) {
  return (
    <section className={cn("border border-border bg-[var(--fx-surface)]", className)}>
      {(eyebrow || title || description) ? (
        <header className="space-y-2 border-b border-border px-5 py-4">
          {eyebrow ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          {title ? <h3 className="text-[16px] font-semibold text-foreground">{title}</h3> : null}
          {description ? <p className="text-[13px] leading-5 text-muted-foreground">{description}</p> : null}
        </header>
      ) : null}
      <div className="px-5 py-4">{children}</div>
      {footer ? <footer className="border-t border-border bg-[var(--fx-surface-subtle)] px-5 py-3">{footer}</footer> : null}
    </section>
  );
}

export { FxPanel };
