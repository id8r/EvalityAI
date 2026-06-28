/* src/components/FxUI/DataDisplay/FxRichText.js | Read-only renderer for FxRichTextEditor HTML | Sree | 2026-06-28 */

import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

// Renders HTML authored by FxRichTextEditor using the shared `.fx-prose` styles, so display matches the editor
// exactly. `fallback` renders when there's no content. NOTE: content is trusted (produced by our own editor);
// if you ever render untrusted HTML here, sanitize upstream (e.g. DOMPurify) first.
function FxRichText({ html, className, fallback = null }) {
  const content = typeof html === "string" ? html.trim() : "";
  if (!content) return fallback;
  return <div className={cn("fx-prose", className)} dangerouslySetInnerHTML={{ __html: content }} />;
}
/* - - - - - - - - - - - - - - - - */
export { FxRichText };
/* - - - - - - - - - - - - - - - - */
