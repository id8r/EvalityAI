/* src/components/FxUI/Navigation/FxTabs.js | Branded tabs wrapper | Sree | 2026-06-25 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const tabVariantClasses = {
  rounded: {
    list: "inline-flex w-fit flex-wrap items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--fx-border)_75%,transparent)] bg-[var(--fx-surface-hover)] px-[2px] h-[44px]",
    trigger:
      "h-[40px] whitespace-nowrap rounded-full border border-transparent px-4 text-sm font-medium leading-none text-muted-foreground data-[state=active]:border-[color:color-mix(in_srgb,var(--fx-border)_75%,transparent)] data-[state=active]:bg-[var(--fx-surface)] data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  },

  underlined: {
    list: "inline-flex w-fit flex-wrap items-stretch gap-6 h-[34px]",
    wrapper: "w-full border-b border-border",
    trigger:
      "relative h-[34px] whitespace-nowrap border border-transparent px-1 text-sm font-medium leading-none text-muted-foreground after:content-[''] after:absolute after:inset-x-0 after:-bottom-[2px] after:h-[3px] after:rounded-[1px] after:bg-transparent data-[state=active]:text-primary data-[state=active]:after:bg-[var(--fx-primary)]",
  },

  segmented: {
    list: "inline-flex w-fit flex-wrap items-center gap-1 rounded-[6px] border border-[color:color-mix(in_srgb,var(--fx-border-strong)_25%,transparent)] bg-[var(--fx-surface-hover)] px-[4px] h-[34px]",
    trigger:
      "h-[26px] whitespace-nowrap rounded-[5px] border border-transparent px-[12px] text-[13px] font-medium leading-none text-muted-foreground data-[state=active]:border-[color:color-mix(in_srgb,var(--fx-border)_75%,transparent)] data-[state=active]:bg-[var(--fx-surface)] data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  },

  regular: {
    list: "inline-flex w-fit flex-wrap items-center gap-1 rounded-[8px] border border-[color:color-mix(in_srgb,var(--fx-border-strong)_25%,transparent)] bg-[var(--fx-surface-hover)] px-[5px] h-[44px]",
    trigger:
      "h-[34px] whitespace-nowrap rounded-[6px] border border-transparent px-[16px] text-sm font-medium leading-none text-muted-foreground data-[state=active]:border-[color:color-mix(in_srgb,var(--fx-border)_75%,transparent)] data-[state=active]:bg-[var(--fx-surface)] data-[state=active]:text-primary data-[state=active]:shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  },
};
/* - - - - - - - - - - - - - - - - */

function renderTabLabel(tab, showIcons) {
  const Icon = tab.icon;

  return (
    <span className="inline-flex items-center gap-2 leading-none">
      {showIcons && Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
      <span className="leading-none">{tab.label}</span>
      {tab.count != null ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[var(--fx-border-light)] bg-[var(--fx-surface)] px-1.5 text-[11px] font-medium leading-none text-muted-foreground">
          {tab.count}
        </span>
      ) : null}
    </span>
  );
}
/* - - - - - - - - - - - - - - - - */

function FxTabs({
  className,
  tabs = [],
  defaultValue,
  value,
  onValueChange,
  variant = "rounded",
  showIcons = false,
  underlineFullWidth = false,
  children,
}) {
  const resolved = tabVariantClasses[variant] ?? tabVariantClasses.rounded;
  const listClassName = resolved.list;

  return (
    <Tabs
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("gap-5", className)}
    >
      {variant === "underlined" && underlineFullWidth ? (
        <div className={tabVariantClasses.underlined.wrapper}>
          <TabsList className={listClassName}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled} className={cn(resolved.trigger)}>
                {renderTabLabel(tab, showIcons)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      ) : (
        <TabsList className={listClassName}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled} className={cn(resolved.trigger)}>
              {renderTabLabel(tab, showIcons)}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      {children}
    </Tabs>
  );
}

FxTabs.Content = TabsContent;
/* - - - - - - - - - - - - - - - - */
export { FxTabs };
/* - - - - - - - - - - - - - - - - */