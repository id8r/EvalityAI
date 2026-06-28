/* src/app/(workspace)/settings/OrganizationSection.js | Settings · Organization (EvSettings.company) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { FxInput, FxSelect, FxTagsInput, FxTextarea } from "@/components/FxUI/Forms";
import { getSettings, updateSettingsGroup } from "@/lib/EvData";
import { SettingsSection } from "./SettingsSection";
/* - - - - - - - - - - - - - - - - */

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "500+", label: "500+" },
];

// Industry uses the frozen enum tokens (value) with friendly labels; custom industries are allowed via create.
const INDUSTRY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "technology_staffing", label: "Technology Staffing" },
  { value: "consulting", label: "Consulting" },
  { value: "saas", label: "SaaS" },
  { value: "analytics", label: "Analytics" },
  { value: "fintech", label: "Fintech" },
  { value: "product_services", label: "Product Services" },
  { value: "cloud_infrastructure", label: "Cloud Infrastructure" },
  { value: "venture_studio", label: "Venture Studio" },
];
/* - - - - - - - - - - - - - - - - */

export function OrganizationSection() {
  const company = getSettings().company ?? {};
  const [form, setForm] = useState(() => ({
    companyName: company.companyName ?? "",
    companyWebsite: company.companyWebsite ?? "",
    companyLinkedIn: company.companyLinkedIn ?? "",
    careerPageUrl: company.careerPageUrl ?? "",
    companySize: company.companySize ?? "",
    aboutCompany: company.aboutCompany ?? "",
  }));
  const [industries, setIndustries] = useState(() => company.industries ?? []);
  const [saving, setSaving] = useState(false);

  const dirty =
    form.companyName !== (company.companyName ?? "") ||
    form.companyWebsite !== (company.companyWebsite ?? "") ||
    form.companyLinkedIn !== (company.companyLinkedIn ?? "") ||
    form.careerPageUrl !== (company.careerPageUrl ?? "") ||
    form.companySize !== (company.companySize ?? "") ||
    form.aboutCompany !== (company.aboutCompany ?? "") ||
    JSON.stringify(industries) !== JSON.stringify(company.industries ?? []);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function save() {
    setSaving(true);
    updateSettingsGroup("company", { ...form, industries });
    setSaving(false);
  }

  return (
    <SettingsSection
      title="Organization"
      description="Workspace identity used for internal hiring and your public branding."
      onSave={save}
      saving={saving}
      saveDisabled={!dirty}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FxInput label="Company name" value={form.companyName} onChange={(event) => set("companyName", event.target.value)} />
        <FxInput label="Company website" value={form.companyWebsite} onChange={(event) => set("companyWebsite", event.target.value)} placeholder="https://" />
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
        <FxInput label="Company LinkedIn" value={form.companyLinkedIn} onChange={(event) => set("companyLinkedIn", event.target.value)} placeholder="https://linkedin.com/company/…" />
        <FxInput label="Career page URL" value={form.careerPageUrl} onChange={(event) => set("careerPageUrl", event.target.value)} placeholder="https://" />
        <FxSelect label="Company size" placeholder="Select size" options={COMPANY_SIZE_OPTIONS} value={form.companySize} onChange={(value) => set("companySize", value)} />
      </div>

      <FxTextarea
        label="About company"
        value={form.aboutCompany}
        onChange={(event) => set("aboutCompany", event.target.value)}
        textareaClassName="min-h-[120px]"
        placeholder="What your company does and who you hire for."
      />

      <FxTagsInput
        label="Industries"
        options={INDUSTRY_OPTIONS}
        value={industries}
        onChange={setIndustries}
        placeholder="Search or add an industry…"
        hint="Used to tailor screening and matching. Add your own if it isn’t listed."
      />
    </SettingsSection>
  );
}
/* - - - - - - - - - - - - - - - - */
