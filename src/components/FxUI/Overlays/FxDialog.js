/* src/components/FxUI/Overlays/FxDialog.js | Branded dialog wrapper over the shadcn/Radix dialog | Sree | 2026-06-26 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  showClose = true,
  className,
  headerClassName,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={showClose} className={className}>
        {title || description ? (
          <DialogHeader className={cn("text-center", headerClassName)}>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        ) : null}
        {children}
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxDialog };
/* - - - - - - - - - - - - - - - - */
