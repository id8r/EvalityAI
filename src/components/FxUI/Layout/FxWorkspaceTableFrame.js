/* src/components/FxUI/Layout/FxWorkspaceTableFrame.js | Shared rounded table shell for workspace list views | Sree | 2026-06-29 */

import { cn } from "@/lib/FxUtils";

function FxWorkspaceTableFrame({ className, toolbar, children }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)]", className)}>
      {toolbar}
      <div className="min-h-0 flex-1 overflow-hidden pb-[32px]">{children}</div>
    </div>
  );
}

export { FxWorkspaceTableFrame };
