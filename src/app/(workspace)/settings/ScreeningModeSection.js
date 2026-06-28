/* src/app/(workspace)/settings/ScreeningModeSection.js | Settings · Screening Mode (EvSettings.screeningDefaults) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSettings, updateSettingsGroup } from "@/lib/EvData";
import { FX_TYPOGRAPHY } from "@/lib/FxTheme";
import { cn } from "@/lib/FxUtils";
import { SettingsSection } from "./SettingsSection";
/* - - - - - - - - - - - - - - - - */

// Exact wordings / disabled states from the previous build. "manual" is always selected (locked); phone + whatsapp
// are reserved (disabled). Picking a non-manual channel reveals the question-flow choice.
const SCREENING_METHOD_OPTIONS = [
  { value: "manual", title: "Manual", description: "Review candidates yourself." },
  { value: "form", title: "Automated Email", description: "Candidates answer a questionnaire by email." },
  { value: "phone", title: "Phone Call", description: "Run AI-led phone screening.", disabled: true },
  { value: "whatsapp", title: "WhatsApp Bot", description: "Coming soon.", disabled: true },
];

const PRESCREEN_OPTIONS = [
  { value: "prescreen_only", title: "Standard Questions Only", description: "Keep the flow shorter when the goal is quick qualification." },
  { value: "cv_and_prescreen", title: "Standard Questions and AI led Email", description: "Use CV context first, then ask focused qualification questions." },
];

function ChannelCard({ option, checked, prescreenMode, onToggle, onPrescreenModeChange }) {
  const disabled = Boolean(option.disabled);
  const isManual = option.value === "manual";
  const checkboxDisabled = disabled || isManual; // manual is fixed-selected
  const showAccordion = checked && !isManual && !disabled;
  const optionId = `screening-${option.value}`;

  return (
    <div
      className={cn(
        "rounded-[10px] border text-left transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        checked
          ? "border-[color:color-mix(in_srgb,var(--fx-primary)_55%,var(--fx-border)_45%)] bg-[var(--fx-surface)]"
          : "border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-transparent",
        !disabled ? "hover:bg-[var(--fx-surface-hover)]/40" : "",
      )}
    >
      <label htmlFor={optionId} className="flex items-start gap-3 px-3.5 py-3.5">
        <Checkbox
          id={optionId}
          checked={checked}
          disabled={checkboxDisabled}
          onCheckedChange={(next) => {
            if (!checkboxDisabled) onToggle(option.value, Boolean(next));
          }}
          className="mt-0.5"
        />
        <span className="min-w-0 flex-1 space-y-0.5">
          <span className="block text-[14px] font-medium leading-5 text-[var(--fx-text)]">{option.title}</span>
          <span className="block text-[13px] leading-5 text-[var(--fx-text-muted)]">{option.description}</span>
        </span>
        {!isManual && !disabled ? (
          <ChevronDown
            className={cn("mt-0.5 size-4 shrink-0 text-[var(--fx-text-muted)] transition-transform duration-200", showAccordion ? "rotate-180" : "rotate-0")}
          />
        ) : null}
      </label>

      {showAccordion ? (
        <div className="border-t border-[color:color-mix(in_srgb,var(--fx-border)_56%,transparent)] px-3.5 py-3.5">
          <RadioGroup value={prescreenMode} onValueChange={onPrescreenModeChange} className="grid gap-2.5 md:grid-cols-2">
            {PRESCREEN_OPTIONS.map((flow) => {
              const flowId = `${optionId}-${flow.value}`;
              const active = prescreenMode === flow.value;
              return (
                <label
                  key={flow.value}
                  htmlFor={flowId}
                  className={cn(
                    "flex items-start gap-2.5 rounded-[8px] border px-3 py-3 text-left transition-colors",
                    active
                      ? "border-[color:color-mix(in_srgb,var(--fx-primary)_55%,var(--fx-border)_45%)] bg-[var(--fx-surface-subtle)]"
                      : "border-[color:color-mix(in_srgb,var(--fx-border)_72%,transparent)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]/35",
                  )}
                >
                  <RadioGroupItem
                    id={flowId}
                    value={flow.value}
                    className="mt-0.5 border-[color:color-mix(in_srgb,var(--fx-border)_82%,var(--fx-text)_18%)] data-[state=checked]:border-[var(--fx-primary)]"
                  />
                  <span className="space-y-0.5">
                    <span className="block text-[14px] font-medium leading-5 text-[var(--fx-text)]">{flow.title}</span>
                    <span className="block text-[13px] leading-5 text-[var(--fx-text-muted)]">{flow.description}</span>
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      ) : null}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */

export function ScreeningModeSection() {
  const saved = getSettings().screeningDefaults ?? {};
  const savedChannels = Array.isArray(saved.channels) && saved.channels.length ? saved.channels : ["manual"];
  const [channels, setChannels] = useState(savedChannels);
  const [prescreenMode, setPrescreenMode] = useState(saved.prescreenMode ?? "cv_and_prescreen");
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(channels) !== JSON.stringify(savedChannels) || prescreenMode !== (saved.prescreenMode ?? "cv_and_prescreen");

  // manual stays selected; other channels toggle on top of it.
  function toggleChannel(value, checked) {
    if (value === "manual") return;
    setChannels((current) => {
      const base = current.includes("manual") ? current : ["manual", ...current];
      if (checked) return base.includes(value) ? base : [...base, value];
      return base.filter((item) => item !== value);
    });
  }

  function save() {
    setSaving(true);
    updateSettingsGroup("screeningDefaults", { channels, prescreenMode });
    setSaving(false);
  }

  return (
    <SettingsSection
      title="Screening Mode"
      description="Choose the default screening path and question flow applied to new roles."
      onSave={save}
      saving={saving}
      saveDisabled={!dirty}
    >
      <h3 className={cn(FX_TYPOGRAPHY.clickable, "text-[var(--fx-text)]")}>Setup Screening Mode</h3>
      <div className="grid grid-cols-1 gap-3">
        {SCREENING_METHOD_OPTIONS.map((option) => (
          <ChannelCard
            key={option.value}
            option={option}
            checked={channels.includes(option.value)}
            prescreenMode={prescreenMode}
            onToggle={toggleChannel}
            onPrescreenModeChange={setPrescreenMode}
          />
        ))}
      </div>
    </SettingsSection>
  );
}
/* - - - - - - - - - - - - - - - - */
