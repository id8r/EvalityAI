/* src/components/FxUI/AppShell/FxAppContent.js | Workspace shell content scaffold | Sree | 2026-06-25 */

import { APP_CONTENT_PADDING } from "@/lib/FxConstants";
import { cn } from "@/lib/FxUtils";

/* - - - - - - - - - - - - - - - - */

function FxAppContent({
  className,
  children,
  widthClassName = "max-w-7xl",
  padded = true,
  paddingClassName,
  scrollable = true,
}) {
  return (
    <main
      data-slot="fx-app-content"
      className={cn(
        "min-h-0 flex-1 bg-transparent",
        scrollable ? "overflow-y-auto" : "overflow-hidden",
        className,
      )}
    >
      <div
        style={
          padded
            ? {
                "--fx-content-x": APP_CONTENT_PADDING.baseX,
                "--fx-content-y": APP_CONTENT_PADDING.baseY,
                "--fx-content-x-wide": APP_CONTENT_PADDING.wideX,
                "--fx-content-y-wide": APP_CONTENT_PADDING.wideY,
              }
            : undefined
        }
        className={cn(
          "mx-auto w-full",
          !scrollable && "flex h-full min-h-0 flex-col",
          padded &&
            "[padding:var(--fx-content-y)_var(--fx-content-x)] md:[padding:var(--fx-content-y-wide)_var(--fx-content-x-wide)]",
          widthClassName,
          padded && paddingClassName,
        )}
      >
        {children}
      </div>
    </main>
  );
}

export { FxAppContent };
