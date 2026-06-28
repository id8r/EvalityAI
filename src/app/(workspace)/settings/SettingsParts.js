/* src/app/(workspace)/settings/SettingsParts.js | Shared settings primitives: provider cards, preference rows | Sree | 2026-06-28 */

"use client";

import { Mail } from "lucide-react";

import { FxButton } from "@/components/FxUI/Forms";
import { Checkbox } from "@/components/ui/checkbox";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

const PROVIDER_LOGOS = {
  gmail: "/images/providers/gmail.svg",
  outlook: "/images/providers/outlook.svg",
  "google-calendar": "/images/providers/google-calendar.svg",
  "outlook-calendar": "/images/providers/outlook-calendar.svg",
};

function ProviderLogo({ provider }) {
  const src = PROVIDER_LOGOS[provider];
  // Small static brand SVGs from /public — next/image adds no benefit here.
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img alt="" src={src} className="size-12 shrink-0 object-contain" />;
  return <Mail className="size-12 text-[var(--fx-text-muted)]" strokeWidth={1.6} />;
}

function ProviderBadge({ children, connected = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium leading-4",
        connected ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]" : "bg-[var(--fx-surface-subtle)] text-[var(--fx-text-muted)]",
      )}
    >
      {children}
    </span>
  );
}

// A connect/disconnect provider tile. `comingSoon` swaps the action for a disabled "Coming Soon" button.
export function ConnectionProviderCard({
  title,
  subtitle,
  provider,
  connected,
  connecting,
  onConnect,
  buttonLabel = "Connect",
  bodyText,
  comingSoon = false,
  statusLabel = null,
  comingSoonText = "More providers will come later. Gmail and Microsoft 365 are the primary options for V1.",
}) {
  const actionLabel = connected ? "Connected" : buttonLabel;

  return (
    <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProviderLogo provider={provider} />
          <div className="min-w-0 space-y-0.5">
            <div className={cn(FX_TYPOGRAPHY.cardTitle, "truncate text-[var(--fx-text)]")}>{title}</div>
            <div className="text-[13px] leading-5 text-[var(--fx-text-muted)]">{subtitle}</div>
          </div>
        </div>
        <ProviderBadge connected={connected}>{statusLabel ?? (connected ? "Connected" : "Not connected")}</ProviderBadge>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[36ch] text-[13px] leading-5 text-[var(--fx-text-muted)]">
          {comingSoon
            ? comingSoonText
            : bodyText ??
              (connected ? "This account is ready for recruiting conversations in Evality." : "Connect this account to route recruiting work through Evality.")}
        </p>
        {comingSoon ? (
          <FxButton variant="secondary" size="md" disabled className="shrink-0">
            Coming Soon
          </FxButton>
        ) : (
          <FxButton variant="secondary" size="md" className="shrink-0" disabled={connected || connecting} onClick={onConnect}>
            {connecting ? "Connecting…" : actionLabel}
          </FxButton>
        )}
      </div>
    </div>
  );
}

// A bordered checkbox preference row (label + description).
export function PreferenceRow({ label, description, checked, onCheckedChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-3">
      <Checkbox className="mt-0.5" checked={checked} onCheckedChange={onCheckedChange} />
      <span className="space-y-0.5">
        <span className="block text-[14px] leading-5 text-[var(--fx-text)]">{label}</span>
        <span className="block text-[13px] leading-5 text-[var(--fx-text-muted)]">{description}</span>
      </span>
    </label>
  );
}
/* - - - - - - - - - - - - - - - - */
