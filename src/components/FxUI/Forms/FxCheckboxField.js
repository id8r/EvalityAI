/* src/components/FxUI/Forms/FxCheckboxField.js | Branded checkbox field | Sree | 2026-06-25 */

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxCheckboxField({ label, description, className, ...props }) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 border border-border bg-[var(--fx-surface)] px-4 py-3 text-left",
        className,
      )}
    >
      <Checkbox className="mt-0.5" {...props} />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="block text-[13px] leading-5 text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxCheckboxField };
/* - - - - - - - - - - - - - - - - */
