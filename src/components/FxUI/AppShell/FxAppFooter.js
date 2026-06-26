/* src/components/FxUI/AppShell/FxAppFooter.js | Workspace shell footer scaffold | Sree | 2026-06-25 */

import { APP_FOOTER_HEIGHT } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function FxAppFooter({
  className,
  children,
  hidden = true,
}) {
  if (hidden) {
    return null;
  }

  return (
    <footer
      data-slot="fx-app-footer"
      style={{ height: APP_FOOTER_HEIGHT }}
      className={cn(
        "flex items-center border-t border-[var(--fx-border-light)] bg-[var(--fx-surface-subtle)] px-6 text-[13px] text-muted-foreground",
        className,
      )}
    >
      {children}
    </footer>
  );
}

export { FxAppFooter };
