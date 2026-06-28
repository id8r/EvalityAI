/* src/app/(workspace)/settings/RecruitingStatusSection.js | Settings · Recruiting Status (EvSettings.workspace) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { FxRadioGroupField } from "@/components/FxUI/Forms";
import { getSettings, updateSettingsGroup } from "@/lib/EvData";
import { SettingsSection } from "./SettingsSection";
/* - - - - - - - - - - - - - - - - */

// values = the frozen workspaceType enum; controls whether Clients are shown/used across the app.
const WORKSPACE_TYPE_OPTIONS = [
  { value: "my_company", label: "Hiring for My Company", description: "Use Evality primarily for internal recruiting." },
  { value: "clients", label: "Hiring for Clients", description: "Default workflows for agency or client-facing recruiting." },
  { value: "both", label: "Hiring for Both", description: "Support both internal and client hiring from one workspace." },
];

export function RecruitingStatusSection() {
  const workspace = getSettings().workspace ?? {};
  const saved = workspace.workspaceType ?? "my_company";
  const [value, setValue] = useState(saved);
  const [saving, setSaving] = useState(false);

  const dirty = value !== saved;

  function save() {
    setSaving(true);
    updateSettingsGroup("workspace", { workspaceType: value });
    setSaving(false);
  }

  return (
    <SettingsSection
      title="Recruiting Status"
      description="Controls default workflows and which sections (like Clients) appear."
      onSave={save}
      saving={saving}
      saveDisabled={!dirty}
    >
      <div className="max-w-[560px]">
        <FxRadioGroupField options={WORKSPACE_TYPE_OPTIONS} value={value} onValueChange={setValue} />
      </div>
    </SettingsSection>
  );
}
/* - - - - - - - - - - - - - - - - */
