/* src/components/FxUI/Forms/FxTextarea.js | Branded textarea field | Sree | 2026-06-25 */

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxTextarea({
  label,
  hint,
  message,
  id,
  className,
  textareaClassName,
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
      <Textarea
        id={fieldId}
        className={textareaClassName}
        aria-invalid={Boolean(message)}
        {...props}
      />
      {message ? (
        <p className="text-[13px] text-[var(--fx-danger)]">{message}</p>
      ) : hint ? (
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxTextarea };
/* - - - - - - - - - - - - - - - - */
