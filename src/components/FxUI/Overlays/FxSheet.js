/* src/components/FxUI/Overlays/FxSheet.js | Branded side-sheet over the shadcn/Radix sheet | Sree | 2026-06-27 */

"use client";

import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
import { FX_SHEET } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  size → FX_SHEET.width (sm 512 / md 768 / lg 1024 / xl 1184 / full). side: "right" | "left".
  Fixed header (leading · title · description | headerActions · close) and fixed footer
  (footerStart on the left, footer on the right); the body scrolls. Esc cancels field editing
  rather than closing when focus is in an input (see ui/sheet).
*/
function FxSheet({
  open,
  onOpenChange,
  side = "right",
  size = "md",
  title,
  description,
  leading,
  headerActions,
  showClose = true,
  footer,
  footerStart,
  children,
  className,
  headerClassName,
  bodyClassName,
}) {
  const hasHeader = Boolean(title || description || leading || headerActions || showClose);
  const hasFooter = Boolean(footer || footerStart);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn(FX_SHEET.width[size] ?? FX_SHEET.width.md, className)}>
        {hasHeader ? (
          <SheetHeader
            title={title}
            description={description}
            leading={leading}
            actions={headerActions}
            showClose={showClose}
            className={headerClassName}
          />
        ) : null}
        <SheetBody className={bodyClassName}>{children}</SheetBody>
        {hasFooter ? <SheetFooter left={footerStart} right={footer} /> : null}
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSheet };
/* - - - - - - - - - - - - - - - - */
