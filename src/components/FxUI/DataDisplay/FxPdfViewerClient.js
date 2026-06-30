/* src/components/FxUI/DataDisplay/FxPdfViewerClient.js | react-pdf implementation behind FxPdfViewer (client-only) | Sree | 2026-06-29 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Download, FileWarning, Loader2, Minus, Plus, ScanLine } from "lucide-react";

import { FxIconButton } from "@/components/FxUI/Forms";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Worker is copied to /public (matches the installed pdfjs-dist version) — bundler-agnostic + offline.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;
const round = (value) => Math.round(value * 100) / 100;

function CenterBox({ children }) {
  return <div className="flex min-h-[240px] flex-1 items-center justify-center p-6 text-center">{children}</div>;
}

function LoadingState() {
  return (
    <CenterBox>
      <span className="flex items-center gap-2 text-[13px] text-[var(--fx-text-muted)]">
        <Loader2 className="size-4 animate-spin" />
        Loading preview…
      </span>
    </CenterBox>
  );
}

function ErrorState() {
  return (
    <CenterBox>
      <div className="space-y-2">
        <FileWarning className="mx-auto size-6 text-[var(--fx-text-muted)]" />
        <p className="text-[14px] font-medium text-[var(--fx-text)]">Unable to preview this resume.</p>
      </div>
    </CenterBox>
  );
}

// autoHeight: the viewer flows to the page's natural height (fit-width by default) and lets the PARENT
// scroll — no inner scroll window. Use when the resume should grow inside a scrolling pane.
function FxPdfViewerClient({ file, showToolbar = true, autoHeight = false, className }) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(autoHeight);
  const [containerWidth, setContainerWidth] = useState(0);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  // Measure the scroll container so Fit Width can size the page (RO callback → not a synchronous effect setState).
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width) setContainerWidth(Math.floor(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function goPrev() {
    setPageNumber((current) => Math.max(1, current - 1));
  }
  function goNext() {
    setPageNumber((current) => Math.min(numPages || 1, current + 1));
  }
  function zoomIn() {
    setFitWidth(false);
    setScale((current) => Math.min(MAX_SCALE, round(current + SCALE_STEP)));
  }
  function zoomOut() {
    setFitWidth(false);
    setScale((current) => Math.max(MIN_SCALE, round(current - SCALE_STEP)));
  }

  function handleDownload() {
    if (!file) return;
    const anchor = document.createElement("a");
    if (typeof file === "string") anchor.href = file;
    else if (file instanceof Blob) anchor.href = URL.createObjectURL(file);
    else if (file?.url) anchor.href = file.url;
    else return;
    anchor.download = (typeof file === "object" && file?.name) || "resume.pdf";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    if (anchor.href.startsWith("blob:")) URL.revokeObjectURL(anchor.href);
  }

  const pageSizing = fitWidth && containerWidth ? { width: Math.max(240, containerWidth - 32) } : { scale };

  return (
    <div
      className={cn(
        "flex flex-col rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)]",
        autoHeight ? "h-auto" : "h-full min-h-0 overflow-hidden",
        className,
      )}
    >
      {showToolbar && !error ? (
        <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2">
          <div className="flex items-center gap-1">
            <FxIconButton size="sm" variant="ghost" aria-label="Previous page" disabled={pageNumber <= 1} onClick={goPrev}>
              <ChevronLeft className="size-4" />
            </FxIconButton>
            <span className="px-1 text-[13px] tabular-nums text-[var(--fx-text-muted)]">Page {pageNumber} / {numPages || 1}</span>
            <FxIconButton size="sm" variant="ghost" aria-label="Next page" disabled={pageNumber >= numPages} onClick={goNext}>
              <ChevronRight className="size-4" />
            </FxIconButton>
          </div>

          <div className="flex items-center gap-1">
            <FxIconButton size="sm" variant="ghost" aria-label="Zoom out" disabled={!fitWidth && scale <= MIN_SCALE} onClick={zoomOut}>
              <Minus className="size-4" />
            </FxIconButton>
            <span className="w-[44px] text-center text-[13px] tabular-nums text-[var(--fx-text-muted)]">{Math.round(scale * 100)}%</span>
            <FxIconButton size="sm" variant="ghost" aria-label="Zoom in" disabled={!fitWidth && scale >= MAX_SCALE} onClick={zoomIn}>
              <Plus className="size-4" />
            </FxIconButton>
            <FxIconButton size="sm" variant={fitWidth ? "primary" : "ghost"} aria-label="Fit width" title="Fit width" onClick={() => setFitWidth(true)}>
              <ScanLine className="size-4" />
            </FxIconButton>
            <FxIconButton size="sm" variant="ghost" aria-label="Download" title="Download" onClick={handleDownload}>
              <Download className="size-4" />
            </FxIconButton>
          </div>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className={cn("bg-[var(--fx-pdf-canvas)] p-4", autoHeight ? "overflow-visible" : "min-h-0 flex-1 overflow-auto")}
      >
        <Document
          file={file}
          onLoadSuccess={({ numPages: count }) => {
            setNumPages(count);
            setPageNumber(1);
            setError(false);
          }}
          onLoadError={() => setError(true)}
          loading={<LoadingState />}
          error={<ErrorState />}
          className="flex flex-col items-center"
        >
          {error ? null : (
            <Page
              pageNumber={pageNumber}
              {...pageSizing}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<LoadingState />}
              className="shadow-[0_1px_4px_rgba(15,23,42,0.12)]"
            />
          )}
        </Document>
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxPdfViewerClient };
/* - - - - - - - - - - - - - - - - */
