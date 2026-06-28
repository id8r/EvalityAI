import { cn } from "@/lib/utils";

function Label({ className, ...props }) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-[14px] font-medium leading-[20px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
