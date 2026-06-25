import * as React from "react";

import { cn } from "@/lib/utils";
import { inputBaseClassName } from "@/components/ui/input";

const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(inputBaseClassName, "min-h-28 resize-y py-3 leading-6", className)}
      {...props}
    />
  );
});

export { Textarea };
