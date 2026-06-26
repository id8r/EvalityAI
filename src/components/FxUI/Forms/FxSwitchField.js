/* src/components/FxUI/Forms/FxSwitchField.js | Branded switch field | Sree | 2026-06-25 */

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxSwitchField({ label, description, className, ...props }) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-4 border border-border bg-[var(--fx-surface)] px-4 py-3",
        className,
      )}
    >
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="block text-[13px] leading-5 text-muted-foreground">{description}</span> : null}
      </span>
      <Switch {...props} />
    </label>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxSwitchField };
/* - - - - - - - - - - - - - - - - */
