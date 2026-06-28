/* src/app/(workspace)/settings/ProfileSection.js | Settings · Profile (the current EvUser) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { FxButton, FxInput, FxSelect, FxTextarea } from "@/components/FxUI/Forms";
import { getUserByEmail, getUsers, updateUser } from "@/lib/EvData";
import { getSession } from "@/lib/EvSession";
import { SettingsSection } from "./SettingsSection";
/* - - - - - - - - - - - - - - - - */

const ROLE_OPTIONS = [
  { value: "recruiter", label: "Recruiter" },
  { value: "recruitment_lead", label: "Recruitment Lead" },
  { value: "hiring_manager", label: "Hiring Manager" },
  { value: "founder", label: "Founder" },
  { value: "hr_team", label: "HR Team" },
  { value: "other", label: "Other" },
];

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.95v5.66H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z" />
    </svg>
  );
}

// Resolve the signed-in user (by session email; falls back to the single seeded user).
function currentUser() {
  return getUserByEmail(getSession().email) ?? getUsers()[0] ?? null;
}
/* - - - - - - - - - - - - - - - - */

export function ProfileSection() {
  const user = currentUser();
  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "",
    aboutMe: user?.aboutMe ?? "",
  }));
  const [saving, setSaving] = useState(false);

  const dirty =
    Boolean(user) &&
    (form.name !== (user.name ?? "") || form.phone !== (user.phone ?? "") || form.role !== (user.role ?? "") || form.aboutMe !== (user.aboutMe ?? ""));

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function save() {
    if (!user) return;
    setSaving(true);
    updateUser(user.id, { name: form.name, phone: form.phone, role: form.role, aboutMe: form.aboutMe });
    setSaving(false);
  }

  return (
    <SettingsSection
      title="Profile"
      description="Personal details used across your recruiting workflows."
      onSave={save}
      saving={saving}
      saveDisabled={!dirty}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FxInput label="Name" value={form.name} onChange={(event) => set("name", event.target.value)} />
        <FxInput label="Email" type="email" value={user?.email ?? ""} disabled hint="Used to sign in — manage in account settings." />
        <FxInput label="Phone" type="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} placeholder="+91 98765 43210" />
        <FxSelect label="Role" placeholder="Select your role" options={ROLE_OPTIONS} value={form.role} onChange={(value) => set("role", value)} />
      </div>

      <FxTextarea
        label="About me"
        value={form.aboutMe}
        onChange={(event) => set("aboutMe", event.target.value)}
        textareaClassName="min-h-[120px]"
        placeholder="A short note about your recruiting focus."
      />

      <div className="space-y-2">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Authenticate yourself</p>
        <FxButton
          variant="secondary"
          className="border-[#0A66C2] bg-[#0A66C2] text-white hover:border-[#0958A8] hover:bg-[#0958A8] hover:text-white"
        >
          <LinkedInIcon />
          Connect LinkedIn
        </FxButton>
      </div>
    </SettingsSection>
  );
}
/* - - - - - - - - - - - - - - - - */
