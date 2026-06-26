/* src/components/FxUI/AppShell/FxRightPanel.js | Workspace shell right utility pane scaffold | Sree | 2026-06-25 */

import { APP_HEADER_HEIGHT } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function FxRightPanel({
  className,
  header,
  body,
  footer,
  hidden = false,
}) {
  if (hidden) {
    return null;
  }

  return (
    <aside
      data-slot="fx-right-panel"
      className={cn(
        "h-full w-full min-h-0 overflow-y-auto border-l border-[var(--fx-border-light)] bg-[var(--fx-surface)]",
        className,
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        {header ? (
          <div style={{ height: APP_HEADER_HEIGHT }} className="flex items-center border-b border-[var(--fx-border-light)] px-5">
            {header}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{body}</div>
        {footer ? (
          <div className="border-t border-[var(--fx-border-light)] bg-[var(--fx-surface-subtle)] px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export { FxRightPanel };
