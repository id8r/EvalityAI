/* src/lib/EvResume.js | Resume object — canonical shape, preview resolution, session-only upload blobs | Sree | 2026-06-29 */

/*
  Canonical `resume` object — stable across seed / local upload / future backend:
    { fileName, url, mimeType, size, source, uploadedAt?, text?, extracted? }
    source: "seed" (demo file in /public/demo/resumes) | "local" (this-session upload) | "backend" (future) | "none"

  Storage rule (LocalStorage demo): never store binary PDF data.
  - Seed / backend resumes have a fetchable `url` → preview directly.
  - Local uploads persist METADATA ONLY (fileName/size/mimeType/uploadedAt, url: null). The actual file lives as an
    in-memory blob URL for the current session and is resolved via resolveResumeUrl(resume, key). On refresh the
    blob is gone (acceptable — no backend yet); the metadata survives.

  Swapping in a real backend later is trivial: store the returned cloud URL on `resume.url` (source: "backend")
  and everything below resolves it the same way — no call-site changes.
*/

// In-memory, per-session blob URLs for uploaded files. NEVER persisted. Keyed by a stable id (e.g. candidate id).
const sessionBlobs = new Map();

export function registerLocalResume(key, file) {
  if (typeof window === "undefined" || !key || !file) return null;
  releaseLocalResume(key);
  const url = URL.createObjectURL(file);
  sessionBlobs.set(key, url);
  return url;
}

export function getLocalResumeUrl(key) {
  return key ? sessionBlobs.get(key) ?? null : null;
}

export function releaseLocalResume(key) {
  const url = key && sessionBlobs.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    sessionBlobs.delete(key);
  }
}

// Metadata-only resume object for a local upload — safe to persist (no binary).
export function buildResumeFromUpload(file) {
  return {
    fileName: file?.name ?? "resume.pdf",
    url: null, // no persistent URL without a backend; preview comes from the session blob
    mimeType: file?.type || "application/pdf",
    size: file?.size ?? null,
    source: "local",
    uploadedAt: new Date().toISOString(),
  };
}

// Self-heal the demo path: older seeds (still in some localStorage copies) used "/resumes/<file>"; the files now
// live at "/demo/resumes/<file>" (same filenames). Normalizing here means stale data previews without a re-seed.
function normalizeResumeUrl(url) {
  if (typeof url !== "string" || !url) return url ?? null;
  if (url.startsWith("/resumes/")) return `/demo/resumes/${url.slice("/resumes/".length)}`;
  return url;
}

// Previewable URL: a real url (seed/backend) if present, else the session blob for `key` (this session only).
export function resolveResumeUrl(resume, key) {
  return normalizeResumeUrl(resume?.url) ?? getLocalResumeUrl(key);
}

export function isPdfResume(resume) {
  return resume?.mimeType === "application/pdf" || /\.pdf$/i.test(resume?.fileName ?? "");
}

export function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(Number(bytes))) return "";
  const kb = Number(bytes) / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
}
/* - - - - - - - - - - - - - - - - */
