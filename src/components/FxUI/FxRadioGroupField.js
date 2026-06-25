import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

function FxRadioGroupField({ label, description, options = [], className, ...props }) {
  return (
    <div className={cn("space-y-3", className)}>
      {label ? (
        <div className="space-y-1">
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          {description ? <p className="text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      <RadioGroup className="gap-2" {...props}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 border border-border bg-[var(--fx-surface)] px-4 py-3"
          >
            <RadioGroupItem value={option.value} className="mt-0.5" />
            <span className="space-y-1">
              <span className="block text-sm font-medium text-foreground">{option.label}</span>
              {option.description ? (
                <span className="block text-[13px] leading-5 text-muted-foreground">{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

export { FxRadioGroupField };
