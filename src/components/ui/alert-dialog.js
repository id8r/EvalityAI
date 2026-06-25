"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import {
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function AlertDialog({ ...props }) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogContent({ className, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 gap-5 border border-border bg-[var(--fx-surface-raised)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.14)]",
          className,
        )}
        {...props}
      />
    </DialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }) {
  return <div data-slot="alert-dialog-header" className={cn("space-y-2", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }) {
  return <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
}

function AlertDialogTitle(props) {
  return <DialogTitle data-slot="alert-dialog-title" {...props} />;
}

function AlertDialogDescription(props) {
  return <DialogDescription data-slot="alert-dialog-description" {...props} />;
}

function AlertDialogAction({ className, ...props }) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(className)} {...props} />;
}

function AlertDialogCancel({ className, ...props }) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
