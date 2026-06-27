/* src/components/FxUI/Forms/FxInput.js | Branded text input field | Sree | 2026-06-25 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxInput({
  label,
  hint,
  message,
  id,
  className,
  inputClassName,
  required = false,
  ...props
}) {
  const fieldId = id ?? props.name;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? <span className="ml-1 text-[var(--fx-danger)]">*</span> : null}
        </Label>
      ) : null}
      <Input id={fieldId} className={inputClassName} aria-invalid={Boolean(message)} {...props} />
      {message ? (
        <p className="text-[13px] text-[var(--fx-danger)]">{message}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxInput };
/* - - - - - - - - - - - - - - - - */
