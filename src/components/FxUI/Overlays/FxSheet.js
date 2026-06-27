/* src/components/FxUI/Overlays/FxSheet.js | Branded side-sheet over the shadcn/Radix sheet | Sree | 2026-06-27 */

"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FX_SHEET } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// size → FX_SHEET.width (sm 512 / md 768 / lg 1024 / xl 1184 / full). side: "right" | "left".
// Header/footer are fixed; the body scrolls. Pass `footer` for the action row.
function FxSheet({
  open,
  onOpenChange,
  side = "right",
  size = "md",
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
  bodyClassName,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn(FX_SHEET.width[size] ?? FX_SHEET.width.md, className)}>
        {title || description ? (
          <SheetHeader className={headerClassName}>
            {title ? <SheetTitle>{title}</SheetTitle> : null}
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
        ) : null}
        <SheetBody className={bodyClassName}>{children}</SheetBody>
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSheet };
/* - - - - - - - - - - - - - - - - */
