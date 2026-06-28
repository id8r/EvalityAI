/* src/app/(workspace)/settings/CalendarSection.js | Settings · Calendar (EvSettings.calendar) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { FxButton, FxInput, FxSelect } from "@/components/FxUI/Forms";
import { Checkbox } from "@/components/ui/checkbox";
import { getSettings, updateSettingsGroup } from "@/lib/EvData";
import { cn } from "@/lib/FxUtils";
import { SettingsCard } from "./SettingsCard";
import { ConnectionProviderCard, PreferenceRow } from "./SettingsParts";
/* - - - - - - - - - - - - - - - - */

const TIMEZONE_OPTIONS = [
  "(UTC+05:30) Asia/Kolkata",
  "(UTC+00:00) UTC",
  "(UTC-05:00) America/New_York",
  "(UTC+01:00) Europe/London",
  "(UTC+08:00) Asia/Singapore",
];

const DEFAULT_WEEKLY_AVAILABILITY = [
  { day: "Mon", enabled: true, start: "09:00", end: "18:00" },
  { day: "Tue", enabled: true, start: "09:00", end: "18:00" },
  { day: "Wed", enabled: true, start: "09:00", end: "18:00" },
  { day: "Thu", enabled: true, start: "09:00", end: "18:00" },
  { day: "Fri", enabled: true, start: "09:00", end: "18:00" },
  { day: "Sat", enabled: false, start: "09:00", end: "18:00" },
  { day: "Sun", enabled: false, start: "09:00", end: "18:00" },
];

const SCHEDULING_PREFERENCES = [
  { key: "blockBusyTime", label: "Block busy time automatically", description: "Prevents recruiters from being scheduled over existing calendar events." },
  { key: "preventDoubleBooking", label: "Prevent double booking", description: "Keeps interview slots from being reused by overlapping events." },
  { key: "useConnectedCalendar", label: "Use connected calendar for interview scheduling", description: "Keeps booking actions tied to the selected calendar account." },
  { key: "sendSchedulingReminders", label: "Send scheduling reminders", description: "Keeps interview reminders visible without extra manual follow-up." },
];

const CALENDAR_LABELS = { googleCalendar: "Google Calendar", outlookCalendar: "Microsoft Outlook" };

function WeeklyAvailabilityRow({ day, enabled, start, end, onToggle, onChange }) {
  return (
    <div className={cn("rounded-[10px] border px-3 py-2.5", enabled ? "border-[var(--fx-border)] bg-[var(--fx-surface)]" : "border-[var(--fx-border)] bg-[var(--fx-surface-subtle)]")}>
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={enabled} onCheckedChange={(checked) => onToggle(Boolean(checked))} />
        <span className="text-[13px] font-semibold text-[var(--fx-text)]">{day}</span>
      </label>
      <div className="mt-2">
        {enabled ? (
          <div className="flex items-center gap-1.5">
            <FxInput value={start} onChange={(event) => onChange("start", event.target.value)} clearable={false} className="min-w-0 flex-1" inputClassName="h-[32px] px-2 text-center text-[13px]" />
            <span className="shrink-0 text-[12px] text-[var(--fx-text-muted)]">–</span>
            <FxInput value={end} onChange={(event) => onChange("end", event.target.value)} clearable={false} className="min-w-0 flex-1" inputClassName="h-[32px] px-2 text-center text-[13px]" />
          </div>
        ) : (
          <span className="block leading-[32px] text-[12px] text-[var(--fx-text-muted)]">Unavailable</span>
        )}
      </div>
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

export function CalendarSection() {
  const saved = getSettings().calendar ?? {};
  // Always render all 7 days: merge any saved row onto the default (covers stale data missing Sat/Sun).
  const savedByDay = new Map((Array.isArray(saved.weeklyAvailability) ? saved.weeklyAvailability : []).map((row) => [row.day, row]));
  const savedState = {
    connections: { googleCalendar: false, outlookCalendar: false, ...(saved.providerConnections ?? {}) },
    defaultAccount: saved.defaultAccount ?? "",
    timezone: saved.timezone ?? "",
    weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY.map((day) => ({ ...day, ...(savedByDay.get(day.day) ?? {}) })),
    preferences: { blockBusyTime: true, preventDoubleBooking: true, useConnectedCalendar: false, sendSchedulingReminders: true, ...(saved.preferences ?? {}) },
  };

  const [connections, setConnections] = useState(savedState.connections);
  const [defaultAccount, setDefaultAccount] = useState(savedState.defaultAccount);
  const [timezone, setTimezone] = useState(savedState.timezone);
  const [weeklyAvailability, setWeeklyAvailability] = useState(savedState.weeklyAvailability);
  const [preferences, setPreferences] = useState(savedState.preferences);
  const [connecting, setConnecting] = useState(null);
  const [saving, setSaving] = useState(false);

  const current = { connections, defaultAccount, timezone, weeklyAvailability, preferences };
  const dirty = JSON.stringify(current) !== JSON.stringify(savedState);

  const hasConnectedCalendar = Boolean(connections.googleCalendar || connections.outlookCalendar);
  const calendarOptions = [
    connections.googleCalendar ? { value: "googleCalendar", label: "Google Calendar" } : null,
    connections.outlookCalendar ? { value: "outlookCalendar", label: "Microsoft Outlook" } : null,
  ].filter(Boolean);
  const connectedLabel = connections.googleCalendar ? "Google Calendar" : connections.outlookCalendar ? "Microsoft Outlook" : "Not connected";

  function connect(provider) {
    if (connections[provider] || connecting) return;
    setConnecting(provider);
    setTimeout(() => {
      setConnections((current) => ({ ...current, [provider]: true }));
      setDefaultAccount((current) => current || provider);
      setConnecting(null);
    }, 700);
  }

  function updateDay(day, patch) {
    setWeeklyAvailability((current) => current.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  }

  function togglePreference(key, checked) {
    setPreferences((current) => ({ ...current, [key]: checked }));
  }

  function save() {
    setSaving(true);
    updateSettingsGroup("calendar", { providerConnections: connections, defaultAccount, timezone, weeklyAvailability, preferences });
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
        title="Calendar Connections"
        description="Connect the calendar Evality should use for interview booking and availability."
        action={saveButton}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <ConnectionProviderCard
            title="Google Calendar"
            subtitle="Google Workspace"
            provider="google-calendar"
            connected={connections.googleCalendar}
            connecting={connecting === "googleCalendar"}
            onConnect={() => connect("googleCalendar")}
            bodyText="Connect Google Calendar so interview booking stays aligned with recruiter availability."
          />
          <ConnectionProviderCard
            title="Microsoft Outlook"
            subtitle="Microsoft 365"
            provider="outlook-calendar"
            connected={connections.outlookCalendar}
            connecting={connecting === "outlookCalendar"}
            onConnect={() => connect("outlookCalendar")}
            bodyText="Connect Outlook Calendar for calendar-aware interview scheduling inside Evality."
          />
        </div>
        {hasConnectedCalendar ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <FxSelect label="Default calendar account" value={defaultAccount} onChange={setDefaultAccount} options={calendarOptions} placeholder="Select a calendar" />
            <div className="rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface-subtle)] px-3.5 py-3">
              <div className="text-[13px] font-medium text-[var(--fx-text-muted)]">Connected calendar</div>
              <div className="mt-1 text-[14px] text-[var(--fx-text)]">{CALENDAR_LABELS[defaultAccount] ?? connectedLabel}</div>
            </div>
          </div>
        ) : null}
      </SettingsCard>

      <SettingsCard title="Timezone" description="Use the timezone recruiters work in most often.">
        <div className="max-w-[420px]">
          <FxSelect label="Workspace timezone" value={timezone} onChange={setTimezone} options={TIMEZONE_OPTIONS} placeholder="Select a timezone" />
        </div>
      </SettingsCard>

      <SettingsCard title="Weekly Availability" description="Set the hours recruiters are generally available for scheduling.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {weeklyAvailability.map((row) => (
            <WeeklyAvailabilityRow
              key={row.day}
              {...row}
              onToggle={(enabled) => updateDay(row.day, { enabled })}
              onChange={(field, value) => updateDay(row.day, { [field]: value })}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Scheduling Preferences" description="Control how calendar booking behaves for recruiters and candidates.">
        <div className="grid gap-3 sm:grid-cols-2">
          {SCHEDULING_PREFERENCES.map((preference) => (
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
