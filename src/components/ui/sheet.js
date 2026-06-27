"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const sheetVariants = cva(
  "fixed z-50 flex flex-col overflow-hidden bg-[var(--fx-surface-raised)] text-foreground transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=open]:duration-200",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-full max-w-[720px] border-l border-border shadow-[-8px_0_24px_rgba(15,23,42,0.08)] dark:shadow-[-8px_0_24px_rgba(0,0,0,0.45)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
        left:
          "inset-y-0 left-0 h-full w-full max-w-[720px] border-r border-border shadow-[8px_0_24px_rgba(15,23,42,0.08)] dark:shadow-[8px_0_24px_rgba(0,0,0,0.45)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

// Esc cancels field editing instead of closing the sheet when focus is in an editable element
// (native field, contenteditable, or anything tagged data-fx-escape-keep-open="true").
function isEditableEscapeTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest?.("[data-fx-escape-keep-open='true']")) return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest?.("input, textarea, select, [contenteditable='true']"));
}

function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-40 bg-[color:color-mix(in_srgb,var(--fx-dark-panel)_22%,transparent)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({ className, children, side = "right", onEscapeKeyDown, ...props }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        onEscapeKeyDown={(event) => {
          if (isEditableEscapeTarget(event.target) || isEditableEscapeTarget(document.activeElement)) {
            event.preventDefault();
          }
          onEscapeKeyDown?.(event);
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

// Fixed header: leading + title + description on the left; actions + close on the right.
function SheetHeader({ className, title, description, leading, actions, showClose = true, ...props }) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-none items-start justify-between gap-4 border-b border-border px-6 py-5", className)}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {leading ? <div className="flex items-center gap-2">{leading}</div> : null}
        {title ? <SheetTitle>{title}</SheetTitle> : null}
        {description ? <SheetDescription>{description}</SheetDescription> : null}
      </div>
      {actions || showClose ? (
        <div className="flex flex-none items-center gap-1">
          {actions}
          {showClose ? (
            <SheetClose className="flex size-8 items-center justify-center rounded-[6px] text-muted-foreground transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)]">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </SheetClose>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SheetBody({ className, ...props }) {
  return <div data-slot="sheet-body" className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)} {...props} />;
}

// Fixed footer: `left` group (secondary actions) and `right` group (primary actions).
function SheetFooter({ className, left, right, ...props }) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-none items-center justify-between gap-3 border-t border-border bg-[var(--fx-surface-subtle)] px-6 py-4", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

function SheetTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-[20px] font-semibold leading-[1.2] tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
