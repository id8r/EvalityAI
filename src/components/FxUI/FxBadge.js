import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function FxBadge({ className, tone = "default", children, ...props }) {
  return (
    <Badge variant={tone} className={cn("px-2.5 py-1 text-[11px] tracking-[0.12em]", className)} {...props}>
      {children}
    </Badge>
  );
}

export { FxBadge };
