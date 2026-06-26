/* src/components/FxUI/Navigation/FxTabs.js | Branded tabs wrapper | Sree | 2026-06-25 */

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/FxUtils";

function FxTabs({ className, tabs = [], defaultValue, children }) {
  return (
    <Tabs defaultValue={defaultValue ?? tabs[0]?.value} className={cn("gap-5", className)}>
      <TabsList className="border-border bg-[var(--fx-surface-hover)]">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="min-w-24">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}

FxTabs.Content = TabsContent;

export { FxTabs };
