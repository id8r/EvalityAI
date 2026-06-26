/* src/components/FxUI/Navigation/FxTabs.js | Branded tabs wrapper | Sree | 2026-06-25 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/FxUtils";

const tabVariantClasses = {
  rounded: {
    list: "inline-flex w-fit flex-wrap items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface-hover)] p-1",
    trigger:
      "h-9 rounded-full px-4 text-sm font-medium text-muted-foreground data-[state=active]:border data-[state=active]:border-[var(--fx-border)] data-[state=active]:bg-[var(--fx-surface)] data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  },
  underlined: {
    list: "inline-flex w-fit flex-wrap items-center gap-6 border-b border-border pb-1",
    trigger:
      "relative h-9 px-1 text-sm font-medium text-muted-foreground after:content-[''] after:absolute after:inset-x-1 after:-bottom-[9px] after:h-[2px] after:rounded-full after:bg-transparent data-[state=active]:text-primary data-[state=active]:after:bg-[var(--fx-primary)]",
  },
  segmented: {
    list: "inline-flex w-fit flex-wrap items-center gap-1 rounded-[12px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface-hover)] p-1",
    trigger:
      "h-9 rounded-[8px] px-4 text-sm font-medium text-muted-foreground data-[state=active]:border data-[state=active]:border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] data-[state=active]:bg-[var(--fx-surface)] data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  },
  regular: {
    list: "inline-flex w-full flex-wrap items-center gap-1 rounded-[12px] border border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface-hover)] p-1",
    trigger:
      "h-9 flex-1 rounded-[8px] px-3 text-sm font-medium text-muted-foreground data-[state=active]:border data-[state=active]:border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] data-[state=active]:bg-[var(--fx-surface)] data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  },
};

function renderTabLabel(tab) {
  return (
    <>
      <span>{tab.label}</span>
      {tab.count != null ? (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-1.5 text-[11px] font-medium leading-none text-muted-foreground">
          {tab.count}
        </span>
      ) : null}
    </>
  );
}

function FxTabs({ className, tabs = [], defaultValue, value, onValueChange, variant = "rounded", children }) {
  const resolved = tabVariantClasses[variant] ?? tabVariantClasses.rounded;

  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("gap-5", className)}
    >
      <TabsList className={resolved.list}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled} className={cn("min-w-24", resolved.trigger)}>
            {renderTabLabel(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

FxTabs.Content = TabsContent;

export { FxTabs };
