/* src/app/ds/FxFormControlsShowcase.js | DS demos for the recent form controls (Select · Tags · Rich Text) | Sree | 2026-06-28 */

"use client";

import { useState } from "react";

import { FxRichText } from "@/components/FxUI/DataDisplay";
import { FxRichTextEditor, FxSelect, FxTagsInput } from "@/components/FxUI/Forms";
import { FxPanel } from "@/components/FxUI/Layout";
/* - - - - - - - - - - - - - - - - */

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "500+", label: "500+" },
];

const INDUSTRY_OPTIONS = [
  { value: "general", label: "General" },
  { value: "technology_staffing", label: "Technology Staffing" },
  { value: "consulting", label: "Consulting" },
  { value: "saas", label: "SaaS" },
  { value: "analytics", label: "Analytics" },
  { value: "fintech", label: "Fintech" },
  { value: "product_services", label: "Product Services" },
  { value: "cloud_infrastructure", label: "Cloud Infrastructure" },
];

const SAMPLE_HTML =
  '<h3>Senior Backend Engineer</h3><p>Build <strong>scalable</strong> services with <em>clean</em> APIs. See <a href="https://evality.ai">our site</a>.</p><ul><li>Design distributed systems</li><li>Mentor engineers</li></ul><blockquote>We value calm, structured delivery.</blockquote>';

const HINT = "text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground";

export function FxFormControlsShowcase({ panelTone }) {
  const [companySize, setCompanySize] = useState("51-200");
  const [industries, setIndustries] = useState(["technology_staffing", "saas"]);
  const [html, setHtml] = useState(SAMPLE_HTML);

  return (
    <>
      <FxPanel {...panelTone} eyebrow="Select & Tags" title="FxSelect And FxTagsInput">
        <div className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-3">
            <p className={HINT}>FxSelect · branded single-select</p>
            <FxSelect label="Company size" placeholder="Select size" options={COMPANY_SIZE_OPTIONS} value={companySize} onChange={setCompanySize} />
            <p className="text-[12px] leading-5 text-muted-foreground">
              Dropdown-menu based (not searchable). Panel matches the trigger width. Selected: <code className="font-mono text-[11px]">{companySize}</code>
            </p>
          </div>

          <div className="space-y-3">
            <p className={HINT}>FxTagsInput · tokenized multi-select + create</p>
            <FxTagsInput
              label="Industries"
              options={INDUSTRY_OPTIONS}
              value={industries}
              onChange={setIndustries}
              placeholder="Search or add an industry…"
            />
            <p className="text-[12px] leading-5 text-muted-foreground">
              Browse on focus, ↑/↓/Enter to pick, type to create. Tokens: <code className="font-mono text-[11px]">{industries.join(", ") || "—"}</code>
            </p>
          </div>
        </div>
      </FxPanel>

      <FxPanel {...panelTone} eyebrow="Rich Text" title="FxRichTextEditor → FxRichText">
        <div className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-3">
            <p className={HINT}>Editor · Tiptap engine hidden, HTML out</p>
            <FxRichTextEditor value={html} onChange={setHtml} minHeight={180} showCount placeholder="Write a job description…" />
          </div>

          <div className="space-y-3">
            <p className={HINT}>FxRichText · read-only render (same .fx-prose)</p>
            <div className="rounded-[6px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-2.5">
              <FxRichText html={html} fallback={<span className="text-[var(--fx-text-muted)]">Nothing yet — start typing on the left.</span>} />
            </div>
            <p className="text-[12px] leading-5 text-muted-foreground">
              Bold/italic/underline/strike · H1–H3 · lists · quote · code · link · undo/redo. Editor and read-only view share one stylesheet, so they look identical.
            </p>
          </div>
        </div>
      </FxPanel>
    </>
  );
}
/* - - - - - - - - - - - - - - - - */
