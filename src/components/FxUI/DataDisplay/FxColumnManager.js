/* src/components/FxUI/DataDisplay/FxColumnManager.js | Reusable column visibility + reorder manager | Sree | 2026-06-26 */

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Columns2, GripVertical, Lock, RotateCcw } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { FX_SHADOW } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Generic, product-agnostic. Drives a useFxTable() controller's `columnManager`:
  toggle visibility, drag-to-reorder (locked columns stay put), and reset to default.

  The popover is rendered in a body PORTAL with fixed positioning anchored to the trigger,
  so it works even when the trigger lives inside the table's overflow-clipped header cell.
  Native drag-and-drop is used (no menu primitive intercepting pointer events).

  variant: "button" (bordered, optional label) | "icon" (bare ghost icon — for header slots).
*/
export function FxColumnManager({ controller, label, variant = "button", align = "right", className }) {
  const manager = controller?.columnManager;
  const baseId = useId();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [draggedKey, setDraggedKey] = useState(null);
  const [overKey, setOverKey] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function place() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({ top: rect.bottom + 6, left: rect.left, right: window.innerWidth - rect.right });
    }
    function onPointerDown(event) {
      if (panelRef.current?.contains(event.target) || triggerRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!manager) return null;

  function endDrag() {
    setDraggedKey(null);
    setOverKey(null);
  }

  function handleDrop(targetKey) {
    if (draggedKey && draggedKey !== targetKey) manager.moveColumn(draggedKey, targetKey);
    endDrag();
  }

  const triggerClass =
    variant === "icon"
      ? "inline-flex size-8 items-center justify-center rounded-[6px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] data-[open=true]:bg-[var(--fx-surface-hover)] data-[open=true]:text-[var(--fx-text)]"
      : "inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-[13px] font-medium text-[var(--fx-text)] transition-colors hover:bg-[var(--fx-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fx-ring)] data-[open=true]:bg-[var(--fx-surface-hover)]";

  const panel =
    open && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Manage columns"
            style={{ position: "fixed", top: coords.top, ...(align === "right" ? { right: coords.right } : { left: coords.left }) }}
            className={cn(
              "z-[1000] w-[264px] rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-raised)] p-2",
              FX_SHADOW.lg,
            )}
          >
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--fx-text-muted)]">Columns</span>
              <button
                type="button"
                onClick={manager.reset}
                className="inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1 text-[12px] text-[var(--fx-text-muted)] transition-colors hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>
            </div>

            <div className="max-h-[320px] overflow-auto">
              {manager.items.map((item) => {
                const checkboxId = `${baseId}-${item.key}`;
                const isDragging = draggedKey === item.key;
                const isOver = overKey === item.key && draggedKey && draggedKey !== item.key;
                return (
                  <div
                    key={item.key}
                    draggable={!item.locked}
                    onDragStart={() => setDraggedKey(item.key)}
                    onDragEnd={endDrag}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setOverKey(item.key);
                    }}
                    onDrop={() => handleDrop(item.key)}
                    className={cn(
                      "flex items-center gap-2 rounded-[6px] px-1.5 py-1.5 transition-colors",
                      isOver ? "bg-[var(--fx-surface-selected)]" : "hover:bg-[var(--fx-surface-hover)]",
                      isDragging && "opacity-50",
                    )}
                  >
                    <span className={cn("flex size-5 items-center justify-center", item.locked ? "text-[var(--fx-text-disabled)]" : "cursor-grab text-[var(--fx-text-muted)] active:cursor-grabbing")}>
                      {item.locked ? <Lock className="size-3.5" /> : <GripVertical className="size-4" />}
                    </span>
                    <Checkbox
                      id={checkboxId}
                      checked={item.visible}
                      disabled={item.locked}
                      onCheckedChange={() => manager.toggleColumn(item.key)}
                      aria-label={`Toggle ${item.label}`}
                    />
                    <label htmlFor={checkboxId} className={cn("min-w-0 flex-1 truncate text-[13px]", item.locked ? "text-[var(--fx-text-muted)]" : "cursor-pointer text-[var(--fx-text)]")}>
                      {item.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <span className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-open={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(triggerClass, className)}
      >
        <Columns2 className="size-4" />
        {variant !== "icon" && label ? <span>{label}</span> : null}
      </button>
      {panel}
    </span>
  );
}
/* - - - - - - - - - - - - - - - - */
