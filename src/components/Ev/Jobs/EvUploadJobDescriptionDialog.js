/* src/components/Ev/Jobs/EvUploadJobDescriptionDialog.js | Reusable JD upload dialog | Sree | 2026-06-28 */

"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

import { FxButton } from "@/components/FxUI/Forms";
import { FxDialog } from "@/components/FxUI/Overlays/FxDialog";
/* - - - - - - - - - - - - - - - - */

function EvUploadJobDescriptionDialog({
  open,
  onOpenChange,
  onUpload,
  title = "Upload Job Description",
  description = "Drop a JD file here or upload one to extract role content.",
  uploadLabel = "Upload JD",
  idleLabel = "Drag and drop PDF here to extract JD",
  sizeClassName = "sm:max-w-[512px]",
}) {
  const inputRef = useRef(null);

  function handlePickFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
    event.target.value = "";
  }

  return (
    <FxDialog open={open} onOpenChange={onOpenChange} title={title} description={description} className={sizeClassName}>
      <div className="rounded-[20px] border border-dashed border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-6 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--fx-primary)_10%,white_90%)] text-[var(--fx-primary)]">
          <Upload className="size-6" />
        </div>
        <div className="mt-4 text-[16px] font-medium leading-[24px] text-[var(--fx-text)]">{idleLabel}</div>
        <div className="mt-2 text-[14px] leading-[22px] text-[var(--fx-text-muted)]">-  OR  -</div>
        <div className="mt-4 flex justify-center">
          <FxButton type="button" variant="primary" onClick={() => inputRef.current?.click()}>
            {uploadLabel}
          </FxButton>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.html,.htm,text/plain,text/html"
          className="hidden"
          onChange={handlePickFile}
        />
      </div>
    </FxDialog>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvUploadJobDescriptionDialog };
/* - - - - - - - - - - - - - - - - */
