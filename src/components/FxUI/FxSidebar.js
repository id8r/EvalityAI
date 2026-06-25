import { cn } from "@/lib/utils";

function FxSidebar({
  className,
  brand,
  nav,
  footer,
  widthClassName = "lg:w-[272px]",
}) {
  return (
    <aside
      data-slot="fx-sidebar"
      className={cn(
        "hidden h-full flex-col border-r border-border bg-[var(--fx-surface)] lg:flex",
        widthClassName,
        className,
      )}
    >
      {brand ? (
        <div className="flex h-14 items-center border-b border-border px-5">{brand}</div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">{nav}</div>
      {footer ? (
        <div className="border-t border-border bg-[var(--fx-surface-subtle)] px-4 py-3">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export { FxSidebar };
