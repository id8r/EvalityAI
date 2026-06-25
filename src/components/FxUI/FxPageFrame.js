import { cn } from "@/lib/utils";

function FxPageFrame({
  className,
  header,
  children,
  aside,
  widthClassName = "max-w-7xl",
  padded = true,
}) {
  return (
    <main data-slot="fx-page-frame" className={cn("min-h-0 flex-1 overflow-y-auto", className)}>
      <div className={cn("mx-auto w-full", widthClassName, padded && "px-6 py-6 md:px-8 md:py-8")}>
        {header ? <div className="mb-6">{header}</div> : null}
        <div className={cn("grid gap-6", aside && "xl:grid-cols-[minmax(0,1fr)_320px]")}>
          <div className="min-w-0">{children}</div>
          {aside ? <aside className="min-w-0">{aside}</aside> : null}
        </div>
      </div>
    </main>
  );
}

export { FxPageFrame };
