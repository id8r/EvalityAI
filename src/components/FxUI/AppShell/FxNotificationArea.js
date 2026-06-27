/* src/components/FxUI/AppShell/FxNotificationArea.js | Workspace shell notification scaffold | Sree | 2026-06-25 */

import { APP_NOTIFICATION_HEIGHT } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function FxNotificationArea({
  className,
  children,
  tone = "info",
}) {
  if (!children) {
    return null;
  }

  return (
    <div
      data-slot="fx-notification-area"
      data-tone={tone}
      style={{ height: APP_NOTIFICATION_HEIGHT }}
      className={cn(
        "flex items-center border-b border-[var(--fx-border-light)] px-6 text-[13px] leading-5 text-foreground",
        tone === "info" && "bg-[var(--fx-info-surface)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { FxNotificationArea };
