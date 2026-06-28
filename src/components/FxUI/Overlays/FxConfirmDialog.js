/* src/components/FxUI/Overlays/FxConfirmDialog.js | Branded confirm/alert dialog over the Radix alert-dialog | Sree | 2026-06-28 */

"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FxButton } from "@/components/FxUI/Forms/FxButton";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  The branded confirm dialog — a focused yes/no decision (discard, delete, reset…). Wraps the Radix alert-dialog
  so callers never touch raw shadcn. Header is left-aligned; actions use FxButton. `tone="danger"` makes the
  confirm button destructive. Escape / outside dismiss route through `onOpenChange`.
*/
function FxConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default", // "default" | "danger"
  onConfirm,
  confirmLoading = false,
  confirmDisabled = false,
  children,
  className,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("max-w-[440px]", className)}>
        {title || description ? (
          <AlertDialogHeader>
            {title ? <AlertDialogTitle className="text-[18px]">{title}</AlertDialogTitle> : null}
            {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
          </AlertDialogHeader>
        ) : null}

        {children}

        <AlertDialogFooter>
          <FxButton variant="outline" size="md" onClick={() => onOpenChange?.(false)}>
            {cancelLabel}
          </FxButton>
          <FxButton
            variant={tone === "danger" ? "destructive" : "primary"}
            size="md"
            loading={confirmLoading}
            disabled={confirmDisabled}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </FxButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxConfirmDialog };
/* - - - - - - - - - - - - - - - - */
