"use client";

import { Toaster } from "sonner";

function Sonner(props) {
  return (
    <Toaster
      theme="light"
      richColors
      toastOptions={{
        classNames: {
          toast: "border border-border bg-[var(--fx-surface-raised)] text-foreground shadow-[0_16px_40px_rgba(15,23,42,0.12)]",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-[var(--fx-surface-subtle)] text-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Sonner };
