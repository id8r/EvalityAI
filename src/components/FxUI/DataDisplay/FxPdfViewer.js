/* src/components/FxUI/DataDisplay/FxPdfViewer.js | Lightweight resume PDF viewer (react-pdf, SSR-safe) | Sree | 2026-06-29 */

"use client";

import { Component } from "react";
import dynamic from "next/dynamic";
import { FileWarning, Loader2 } from "lucide-react";
/* - - - - - - - - - - - - - - - - */

/*
  Reusable FxUI PDF viewer for resume preview. The react-pdf/pdfjs engine touches browser-only APIs, so the
  implementation is loaded with `ssr: false` — this wrapper stays SSR-safe. Drop-in:

    <FxPdfViewer file={resumeUrl} showToolbar />

  `file` accepts a URL string, File, or Blob. Toolbar (FxUI-styled): Prev/Next · page count · zoom ± · Fit Width · Download.
*/

// A render-time crash inside react-pdf (e.g. a worker/canvas race on a re-render) would otherwise unmount the whole
// surrounding subtree (closing the sheet). This boundary contains it and shows a graceful fallback instead.
class PdfErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // Swallow — the fallback below is the user-facing message; nothing else to recover.
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[240px] items-center justify-center rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 text-center">
          <div className="space-y-2">
            <FileWarning className="mx-auto size-6 text-[var(--fx-text-muted)]" />
            <p className="text-[14px] font-medium text-[var(--fx-text)]">Unable to preview this resume.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FxPdfViewerClient = dynamic(() => import("@/components/FxUI/DataDisplay/FxPdfViewerClient").then((mod) => mod.FxPdfViewerClient), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)]">
      <span className="flex items-center gap-2 text-[13px] text-[var(--fx-text-muted)]">
        <Loader2 className="size-4 animate-spin" />
        Loading preview…
      </span>
    </div>
  ),
});

function FxPdfViewer(props) {
  // Key the boundary by file so switching documents resets a prior error and retries.
  const resetKey = typeof props.file === "string" ? props.file : props.file?.name ?? "file";
  return (
    <PdfErrorBoundary key={resetKey}>
      <FxPdfViewerClient {...props} />
    </PdfErrorBoundary>
  );
}
/* - - - - - - - - - - - - - - - - */
export { FxPdfViewer };
/* - - - - - - - - - - - - - - - - */
