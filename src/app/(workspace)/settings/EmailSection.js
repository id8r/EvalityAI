/* src/app/(workspace)/settings/EmailSection.js | Settings · Email (EvSettings.email) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { FxButton, FxSelect, FxTextarea } from "@/components/FxUI/Forms";
import { getSettings, updateSettingsGroup } from "@/lib/EvData";
import { SettingsCard } from "./SettingsCard";
import { ConnectionProviderCard, PreferenceRow } from "./SettingsParts";
/* - - - - - - - - - - - - - - - - */

const COMMUNICATION_PREFERENCES = [
  { key: "routeReplies", label: "Route candidate replies to the connected mailbox", description: "Keeps recruiting conversations attached to the provider you connected." },
  { key: "copyRecruiters", label: "Copy recruiters on outbound messages", description: "Useful when the workspace needs visibility across the hiring team." },
  { key: "sendReminders", label: "Send follow-up reminders from Evality", description: "Keeps reminder cadence inside the workspace rather than outside it." },
];

const MAILBOX_LABELS = { gmail: "Gmail", outlook: "Microsoft Outlook" };
const SAMPLE_SENDER = "Ananya Sharma <ananya.sharma@evality.ai>";
const SAMPLE_REPLY_TO = "ananya.sharma@evality.ai";

function SenderPreviewCard({ senderLabel, replyTo }) {
  return (
    <SettingsCard title="Sender Preview" description="This is how Evality will present outbound recruiting mail.">
      <div className="space-y-3 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span className="min-w-[72px] text-[13px] font-medium text-[var(--fx-text-muted)]">From:</span>
          <span className="text-[14px] text-[var(--fx-text)]">{senderLabel}</span>
        </div>
        <div className="flex items-start gap-3">
          <span className="min-w-[72px] text-[13px] font-medium text-[var(--fx-text-muted)]">Reply-To:</span>
          <span className="text-[14px] text-[var(--fx-text)]">{replyTo}</span>
        </div>
      </div>
    </SettingsCard>
  );
}
/* - - - - - - - - - - - - - - - - */

export function EmailSection() {
  const saved = getSettings().email ?? {};
  const savedState = {
    connections: { gmail: false, outlook: false, ...(saved.providerConnections ?? {}) },
    senderAccount: saved.senderAccount ?? "",
    signature: saved.signature ?? "",
    preferences: { routeReplies: true, copyRecruiters: false, sendReminders: true, ...(saved.communicationPreferences ?? {}) },
  };

  const [connections, setConnections] = useState(savedState.connections);
  const [senderAccount, setSenderAccount] = useState(savedState.senderAccount);
  const [signature, setSignature] = useState(savedState.signature);
  const [preferences, setPreferences] = useState(savedState.preferences);
  const [connecting, setConnecting] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = { connections, senderAccount, signature, preferences };
  const dirty = JSON.stringify(current) !== JSON.stringify(savedState);

  const mailboxOptions = [
    connections.gmail ? { value: "gmail", label: "Gmail" } : null,
    connections.outlook ? { value: "outlook", label: "Microsoft Outlook" } : null,
  ].filter(Boolean);
  const hasMailbox = mailboxOptions.length > 0;
  const preview = hasMailbox && senderAccount ? { senderLabel: SAMPLE_SENDER, replyTo: SAMPLE_REPLY_TO } : { senderLabel: "Not set", replyTo: "Not set" };

  // Mock connect: a short "Connecting…" then connected.
  function connect(provider) {
    if (connections[provider] || connecting) return;
    setConnecting(provider);
    setTimeout(() => {
      setConnections((current) => ({ ...current, [provider]: true }));
      setSenderAccount((current) => current || provider);
      setConnecting(null);
    }, 700);
  }

  function togglePreference(key, checked) {
    setPreferences((current) => ({ ...current, [key]: checked }));
  }

  function save() {
    setSaving(true);
    updateSettingsGroup("email", {
      providerConnections: connections,
      senderAccount,
      signature,
      communicationPreferences: preferences,
    });
    setSaving(false);
  }

  const saveButton = (
    <FxButton variant="secondary" size="md" onClick={save} loading={saving} disabled={!dirty}>
      Save
    </FxButton>
  );

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Connected Mailboxes"
        description="Connect the mailbox Evality should use for recruiting communication."
        action={saveButton}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ConnectionProviderCard
            title="Gmail"
            subtitle="Google Workspace"
            provider="gmail"
            connected={connections.gmail}
            connecting={connecting === "gmail"}
            onConnect={() => connect("gmail")}
            bodyText="Connect Gmail so Evality can send and receive recruiting communication from your mailbox."
          />
          <ConnectionProviderCard
            title="Microsoft Outlook"
            subtitle="Microsoft 365"
            provider="outlook"
            connected={connections.outlook}
            connecting={connecting === "outlook"}
            onConnect={() => connect("outlook")}
            bodyText="Connect Outlook so recruiters can keep messages inside Microsoft 365."
          />
        </div>
      </SettingsCard>

      {hasMailbox ? (
        <SettingsCard title="Default Sender Account" description="Choose which connected mailbox should send recruiting mail by default.">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <FxSelect label="Default sender account" value={senderAccount} onChange={setSenderAccount} options={mailboxOptions} placeholder="Select a mailbox" />
            <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3.5 py-3">
              <div className="text-[13px] font-medium text-[var(--fx-text-muted)]">Selected mailbox</div>
              <div className="mt-1 text-[14px] text-[var(--fx-text)]">{MAILBOX_LABELS[senderAccount] ?? "Not set"}</div>
            </div>
          </div>
        </SettingsCard>
      ) : null}

      <SenderPreviewCard senderLabel={preview.senderLabel} replyTo={preview.replyTo} />

      <SettingsCard title="Email Signature" description="Set the signature that Evality appends to outbound recruiting messages.">
        <FxTextarea label="Signature" value={signature} onChange={(event) => setSignature(event.target.value)} textareaClassName="min-h-[120px]" />
      </SettingsCard>

      <SettingsCard title="Communication Preferences" description="Control how recruiting conversations flow through the connected mailbox.">
        <div className="grid gap-3">
          {COMMUNICATION_PREFERENCES.map((preference) => (
            <PreferenceRow
              key={preference.key}
              label={preference.label}
              description={preference.description}
              checked={Boolean(preferences[preference.key])}
              onCheckedChange={(checked) => togglePreference(preference.key, Boolean(checked))}
            />
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
