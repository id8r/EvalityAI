/* src/app/(workspace)/settings/SettingsSection.js | Settings section card: header (title · desc · Save) + body | Sree | 2026-06-28 */

"use client";

import { FxButton } from "@/components/FxUI/Forms";
import { SettingsCard } from "./SettingsCard";
/* - - - - - - - - - - - - - - - - */

// The common single-card section with a Save button (disabled until dirty); omit `onSave` for read-only sections.
// Thin wrapper over SettingsCard.
export function SettingsSection({ title, description, onSave, saveLabel = "Save", saving = false, saveDisabled = false, children }) {
  return (
    <SettingsCard
      title={title}
      description={description}
      action={
        onSave ? (
          <FxButton variant="secondary" size="md" onClick={onSave} loading={saving} disabled={saveDisabled}>
            {saveLabel}
          </FxButton>
        ) : null
      }
    >
      {children}
    </SettingsCard>
  );
}
/* - - - - - - - - - - - - - - - - */
