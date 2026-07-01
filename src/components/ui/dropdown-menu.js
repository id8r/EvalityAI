"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { FX_SHADOW } from "@/lib/FxTheme";
import { cn } from "@/lib/utils";

function stopPropagation(event) {
  event.stopPropagation();
}

function DropdownMenu({ modal = false, ...props }) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" modal={modal} {...props} />;
}

function DropdownMenuTrigger({ onPointerDown, onClick, ...props }) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      onPointerDown={(event) => {
        stopPropagation(event);
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        stopPropagation(event);
        onClick?.(event);
      }}
      {...props}
    />
  );
}

function DropdownMenuGroup(props) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuPortal(props) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuSub(props) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuRadioGroup(props) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuSubTrigger({ className, inset, children, onPointerDown, onClick, ...props }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      onPointerDown={(event) => {
        stopPropagation(event);
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        stopPropagation(event);
        onClick?.(event);
      }}
      className={cn(
        "flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] px-[8px] py-[8px] text-[14px] leading-[22px] font-normal outline-none transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] focus:bg-[var(--fx-surface-hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "z-[120] min-w-[160px] overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface-raised)] p-[2px] text-foreground",
        FX_SHADOW.md,
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuContent({ className, sideOffset = 8, onPointerDown, onClick, ...props }) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        onPointerDown={(event) => {
          stopPropagation(event);
          onPointerDown?.(event);
        }}
        onClick={(event) => {
          stopPropagation(event);
          onClick?.(event);
        }}
        className={cn(
          "z-[120] min-w-[160px] overflow-hidden rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface-raised)] p-[2px] text-foreground",
          FX_SHADOW.md,
          className,
        )}
        {...props}
      />
    </DropdownMenuPortal>
  );
}

function DropdownMenuItem({ className, inset, onPointerDown, onClick, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      onPointerDown={(event) => {
        stopPropagation(event);
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        stopPropagation(event);
        onClick?.(event);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] px-[8px] py-[8px] text-[14px] leading-[22px] font-normal outline-none transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] focus:bg-[var(--fx-surface-hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, onPointerDown, onClick, ...props }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      onPointerDown={(event) => {
        stopPropagation(event);
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        stopPropagation(event);
        onClick?.(event);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] py-[8px] pr-[12px] pl-[32px] text-[14px] leading-[22px] font-normal outline-none transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] focus:bg-[var(--fx-surface-hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioItem({ className, children, onPointerDown, onClick, ...props }) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      onPointerDown={(event) => {
        stopPropagation(event);
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        stopPropagation(event);
        onClick?.(event);
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-[12px] rounded-[6px] py-[8px] pr-[12px] pl-[32px] text-[14px] leading-[22px] font-normal outline-none transition-colors duration-100 hover:bg-[var(--fx-surface-hover)] focus:bg-[var(--fx-surface-hover)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="absolute left-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="size-2.5 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("px-[8px] py-[8px] text-[12px] font-medium leading-[18px] text-muted-foreground", inset && "pl-[32px]", className)}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("-mx-[2px] my-[4px] h-px bg-border", className)} {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
