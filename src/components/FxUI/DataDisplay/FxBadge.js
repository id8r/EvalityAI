/* src/components/FxUI/DataDisplay/FxBadge.js | Branded status badge | Sree | 2026-06-25 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

function FxBadge({ className, tone = "default", children, ...props }) {
  return (
    <Badge variant={tone} className={cn("px-2.5 py-1 text-[11px] tracking-[0.12em]", className)} {...props}>
      {children}
    </Badge>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxBadge };
/* - - - - - - - - - - - - - - - - */
