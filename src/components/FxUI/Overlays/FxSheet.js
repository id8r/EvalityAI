/* src/components/FxUI/Overlays/FxSheet.js | Branded workspace container over the Radix sheet | Sree | 2026-06-28 */

"use client";

import { Children, createContext, isValidElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Columns3, Maximize2, Minimize2, MoreHorizontal, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { FX_SHEET } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  FxSheet — the long-term workspace container (spec: src/FxDocs/FxSheetWorkspace.md). Overlay-only v1.
  Compound API: <FxSheet><FxSheet.Header/><FxSheet.Toolbar/><FxSheet.Panes><FxSheet.Pane/>…</FxSheet.Panes>
  <FxSheet.Footer/></FxSheet>. FxSheet.Body is sugar for a single primary pane. Legacy prop-driven usage
  (title/description/headerActions/footer/footerStart + children) still works unchanged.

  Rules: header & footer never scroll; each pane owns exactly one scroll container; no nested scrolling.
  All tunables (widths, pane widths, paddings, motion) live in FX_SHEET (src/lib/FxTheme.js).
*/

// Shared system-action button (Close / Expand / Layout / More triggers).
const SYS_BTN =
  "flex size-8 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]";

const ROLE_LABEL = { primary: "Primary", secondary: "Secondary", tertiary: "Tertiary" };

const FxSheetContext = createContext(null);
const useFxSheet = () => useContext(FxSheetContext);

// A child is a compound part if its component carries the marker (set at the bottom of the file).
const isSheetPart = (child) => isValidElement(child) && Boolean(child.type?.__fxSheetPart);
/* - - - - - - - - - - - - - - - - */

function FxSheet({
  open,
  onOpenChange,
  presentation = "overlay", // "push" reserved — not implemented in v1; renders as overlay
  side = "right",
  size = "md",
  expandable = false,
  dismissible = true,
  className,
  children,
  // Legacy simple-mode props (kept for backward compatibility) ---------------
  title,
  description,
  leading,
  headerActions,
  showClose = true,
  footer,
  footerStart,
  headerClassName,
  bodyClassName,
  onOpenAutoFocus,
}) {
  void presentation; // reserved extension point
  const [expanded, setExpanded] = useState(false);
  const [panes, setPanes] = useState([]); // [{ id, role, collapsible, label }]
  const [visibility, setVisibility] = useState({}); // id -> bool

  const registerPane = useCallback((meta) => {
    setPanes((prev) => {
      const existing = prev.find((p) => p.id === meta.id);
      if (existing && existing.role === meta.role && existing.collapsible === meta.collapsible && existing.label === meta.label) return prev;
      return existing ? prev.map((p) => (p.id === meta.id ? meta : p)) : [...prev, meta];
    });
  }, []);
  const unregisterPane = useCallback((id) => setPanes((prev) => prev.filter((p) => p.id !== id)), []);
  const setVisible = useCallback((id, value) => setVisibility((prev) => ({ ...prev, [id]: value })), []);
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const ctx = useMemo(
    () => ({ side, expandable, expanded, toggleExpanded, panes, visibility, registerPane, unregisterPane, setVisible }),
    [side, expandable, expanded, toggleExpanded, panes, visibility, registerPane, unregisterPane, setVisible],
  );

  // Width: expand overrides to `full`. A numeric size is a reserved px escape hatch (unused by product screens).
  const effectiveSize = expandable && expanded ? "full" : size;
  const widthClass = typeof effectiveSize === "number" ? null : FX_SHEET.width[effectiveSize] ?? FX_SHEET.width.md;
  const widthStyle = typeof effectiveSize === "number" ? { width: effectiveSize, maxWidth: "calc(100vw - 2rem)" } : undefined;

  // Legacy mode: no compound part among children → build Header + Body + Footer from props.
  const compound = Children.toArray(children).some(isSheetPart);
  const content = compound ? (
    children
  ) : (
    <>
      {(title || description || leading || headerActions || showClose) && (
        <FxSheetHeader title={title} description={description} leading={leading} actions={headerActions} showClose={showClose} className={headerClassName} />
      )}
      <FxSheetBody className={bodyClassName}>{children}</FxSheetBody>
      {(footer || footerStart) && <FxSheetFooter footerStart={footerStart}>{footer}</FxSheetFooter>}
    </>
  );

  return (
    <FxSheetContext.Provider value={ctx}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={side}
          style={widthStyle}
          className={cn(widthClass, className)}
          onOpenAutoFocus={onOpenAutoFocus}
          onInteractOutside={(event) => {
            if (!dismissible) {
              event.preventDefault();
              return;
            }
            // Clicks inside a portaled popper (dropdown / select / popover / tooltip) or a toast are layered
            // ABOVE the sheet, not "outside" it — don't let them trigger a close.
            const node = event.detail?.originalEvent?.target ?? event.target;
            if (node instanceof Element && node.closest("[data-radix-popper-content-wrapper],[data-sonner-toast],[data-sonner-toaster]")) {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (!dismissible) event.preventDefault();
          }}
        >
          {content}
        </SheetContent>
      </Sheet>
    </FxSheetContext.Provider>
  );
}
/* - - - - - - - - - - - - - - - - */

// Header: title block (left) + standard system-action cluster (right): [app] │ [Layout] [Expand] [More] [Close].
function FxSheetHeader({ title, description, leading, actions, more, showClose = true, className }) {
  const ctx = useFxSheet();
  const toggleable = (ctx?.panes ?? []).filter((p) => p.role !== "primary" && p.collapsible);
  const showLayout = toggleable.length > 0;
  const hasSystem = showLayout || ctx?.expandable || more || showClose;

  return (
    <header data-slot="fx-sheet-header" className={cn("flex flex-none items-start justify-between gap-4 border-b border-border", FX_SHEET.header.padding, className)}>
      <div className="min-w-0 space-y-1">
        {leading ? <div className="flex items-center gap-2">{leading}</div> : null}
        {title ? <SheetTitle>{title}</SheetTitle> : <SheetTitle className="sr-only">Panel</SheetTitle>}
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </div>

      {actions || hasSystem ? (
        <div className="flex flex-none items-center gap-1">
          {actions}
          {actions && hasSystem ? <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" /> : null}

          {showLayout ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={SYS_BTN} aria-label="Layout" title="Layout">
                  <Columns3 className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Panes</DropdownMenuLabel>
                {toggleable.map((pane) => (
                  <DropdownMenuCheckboxItem
                    key={pane.id}
                    checked={ctx.visibility[pane.id] ?? true}
                    onCheckedChange={(value) => ctx.setVisible(pane.id, value)}
                    onSelect={(event) => event.preventDefault()}
                  >
                    {pane.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {ctx?.expandable ? (
            <button type="button" className={SYS_BTN} onClick={ctx.toggleExpanded} aria-label={ctx.expanded ? "Restore" : "Expand"} title={ctx.expanded ? "Restore" : "Expand"}>
              {ctx.expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          ) : null}

          {more ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={SYS_BTN} aria-label="More" title="More">
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {more}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {showClose ? (
            <SheetClose className={SYS_BTN} aria-label="Close">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

// Optional non-scrolling band under the header (search/filters). `sticky` is structural (it never scrolls).
function FxSheetToolbar({ className, children }) {
  return (
    <div data-slot="fx-sheet-toolbar" className={cn("flex flex-none items-center gap-2 border-b border-border", FX_SHEET.toolbar.padding, className)}>
      {children}
    </div>
  );
}

// The only growing region. Lays out 1–N panes horizontally; each pane scrolls independently.
function FxSheetPanes({ className, children }) {
  return (
    <div data-slot="fx-sheet-panes" className={cn("flex min-h-0 flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
}

// One pane = one scroll container. role drives default width/padding; primary fills the rest.
function FxSheetPane({ role = "primary", width, collapsible = false, label, id, className, children }) {
  const ctx = useFxSheet();
  const paneId = id ?? role;
  const registerPane = ctx?.registerPane;
  const unregisterPane = ctx?.unregisterPane;

  useEffect(() => {
    if (!registerPane) return undefined;
    registerPane({ id: paneId, role, collapsible, label: label ?? ROLE_LABEL[role] ?? role });
    return () => unregisterPane?.(paneId);
  }, [registerPane, unregisterPane, paneId, role, collapsible, label]);

  const visible = ctx ? ctx.visibility[paneId] ?? true : true;
  if (!visible) return null;

  const isPrimary = role === "primary";
  const w = width ?? FX_SHEET.paneWidth[role];
  const style = !isPrimary && w != null ? { flexBasis: typeof w === "number" ? `${w}px` : w, width: typeof w === "number" ? `${w}px` : w } : undefined;

  return (
    <section
      data-fx-pane={role}
      style={style}
      className={cn("flex min-h-0 flex-col [&:not(:first-child)]:border-l [&:not(:first-child)]:border-border", isPrimary ? "min-w-0 flex-1" : "flex-none")}
    >
      <div className={cn("min-h-0 flex-1 overflow-y-auto", FX_SHEET.pane.padding[role] ?? FX_SHEET.pane.padding.primary, className)}>{children}</div>
    </section>
  );
}

// Sugar: a single primary pane (simple sheets + legacy body).
function FxSheetBody({ className, children }) {
  return (
    <FxSheetPanes>
      <FxSheetPane role="primary" className={className}>
        {children}
      </FxSheetPane>
    </FxSheetPanes>
  );
}

// Sticky footer (never scrolls): `footerStart` = secondary actions (left), children = primary actions (right).
function FxSheetFooter({ footerStart, className, children }) {
  return <SheetFooter left={footerStart} right={children} className={className} />;
}
/* - - - - - - - - - - - - - - - - */

// Compound-part markers (used to detect compound vs legacy children).
FxSheetHeader.__fxSheetPart = "header";
FxSheetToolbar.__fxSheetPart = "toolbar";
FxSheetPanes.__fxSheetPart = "panes";
FxSheetPane.__fxSheetPart = "pane";
FxSheetBody.__fxSheetPart = "body";
FxSheetFooter.__fxSheetPart = "footer";

FxSheet.Header = FxSheetHeader;
FxSheet.Toolbar = FxSheetToolbar;
FxSheet.Panes = FxSheetPanes;
FxSheet.Pane = FxSheetPane;
FxSheet.Body = FxSheetBody;
FxSheet.Footer = FxSheetFooter;
/* - - - - - - - - - - - - - - - - */
export { FxSheet };
/* - - - - - - - - - - - - - - - - */
