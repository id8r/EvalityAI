/* src/components/Ev/Candidates/EvScheduleInterviewSheet.js | Schedule Interview — candidate packet + interview setup | Sree | 2026-07-01 */

"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, ChevronDown, MapPin, PanelLeft, Phone, Video } from "lucide-react";

import { FxButton, FxCombobox, FxIconToggle, FxInput, FxSelect, FxTextarea } from "@/components/FxUI/Forms";
import { FxTabs } from "@/components/FxUI/Navigation";
import { FxSheet } from "@/components/FxUI/Overlays/FxSheet";
import { FxConfirmDialog } from "@/components/FxUI/Overlays/FxConfirmDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { EvCandidateCard } from "@/components/Ev/Candidates/EvCandidateCard";
import { EvCandidatePreview } from "@/components/Ev/Candidates/EvCandidatePreview";
import { EvScreeningChecklist } from "@/components/Ev/Candidates/EvScreeningChecklist";
import { EvInterviewCalendar } from "@/components/Ev/Candidates/EvInterviewCalendar";
import { DEFAULT_SCREENING_QUESTIONS } from "@/lib/EvScreening";
import {
  ROUND_OPTIONS,
  INTERVIEW_MODES,
  DURATION_OPTIONS,
  DEFAULT_DURATION,
  TIMEZONES,
  DEFAULT_TIMEZONE,
  RECENT_INTERVIEWERS,
  firstAvailableDateKey,
  getDayAvailability,
  buildScheduleDetails,
  confirmLineParts,
} from "@/lib/EvInterview";
import { jobClientName } from "@/lib/EvSelectors";
import { useScreeningExpanded } from "@/lib/useScreeningExpanded";
import { cn } from "@/lib/FxUtils";
/* - - - - - - - - - - - - - - - - */

/*
  Schedule Interview (single candidate — no bulk). Left = candidate packet (Summary/Resume + a minimal, progressive
  "What should be shared?" packet). Right = interview setup: round · mode · interviewer(s) · date/slot · duration ·
  timezone · mode-aware location · notes, with a live confirmation line. Availability is deterministic mock
  (EvInterview). On submit the parent writes app.interview, moves the candidate to Interview, and (background) notifies.
*/
const PACKET_TABS = [
  { value: "summary", label: "Summary" },
  { value: "resume", label: "Resume" },
];
const SHARE_OPTIONS = [
  { value: "cv_only", label: "CV only", description: "Share candidate resume and name only." },
  { value: "cv_details", label: "CV + selected details", description: "Choose which contact, compensation and screening details to include." },
];
const DETAIL_TOGGLES = [
  { key: "phone", label: "Phone number" },
  { key: "email", label: "Email address" },
  { key: "ctc", label: "CTC details" },
  { key: "summary", label: "Screening summary" },
];
const WHERE_META = {
  remote: { icon: Video, label: "Meeting link", placeholder: "https://meet.google.com/xxx-xxxx-xxx" },
  in_person: { icon: MapPin, label: "Address", placeholder: "Office address / room" },
  phone: { icon: Phone, label: "Dial-in Number", placeholder: "+91 98765 43210" },
};

function GroupLabel({ children, className = "" }) {
  return <p className={cn("text-[15px] font-medium text-[var(--fx-text)]", className)}>{children}</p>;
}

function ShareCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 transition-colors hover:bg-[var(--fx-surface-hover)] has-[[data-state=checked]]:border-[color:color-mix(in_srgb,var(--fx-primary)_38%,var(--fx-border))]">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(Boolean(value))} />
      <span className="text-[13px] leading-[18px] text-[var(--fx-text)]">{label}</span>
    </label>
  );
}

// Segmented single-select (Remote / In-person / Phone) — matches the old neat pill row.
function ModeToggle({ value, onChange }) {
  return (
    <div className="flex w-full gap-1 rounded-[8px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-[3px]">
      {INTERVIEW_MODES.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "inline-flex h-8 flex-1 items-center justify-center rounded-[6px] px-3 text-[12px] font-medium transition-colors",
            value === item.value ? "bg-[var(--fx-surface-selected)] text-[var(--fx-primary)]" : "text-[var(--fx-text-muted)] hover:bg-[var(--fx-surface-hover)] hover:text-[var(--fx-text)]",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function EvScheduleInterviewSheet({ open, onOpenChange, row, job, onSchedule }) {
  const candidate = row?.candidate ?? null;
  const app = row?.app ?? null;
  const seed = String(row?.id ?? app?.id ?? candidate?.id ?? "seed");
  const [now] = useState(() => Date.now());
  const first = RECENT_INTERVIEWERS[0];

  const [expanded, setExpanded] = useScreeningExpanded(); // ⤢ sheet width (shared, persisted)
  const [tab, setTab] = useState("summary");
  const [showSummaryPane, setShowSummaryPane] = useState(true);

  // Share packet
  const [shareMode, setShareMode] = useState("cv_details");
  const [include, setInclude] = useState({ phone: true, email: true, ctc: true, summary: true });
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Interview setup
  const [round, setRound] = useState("Round 1");
  const [mode, setMode] = useState("remote");
  const [interviewerName, setInterviewerName] = useState(first.name);
  const [interviewerCompany, setInterviewerCompany] = useState(jobClientName(job) ?? "");
  const [interviewerEmail, setInterviewerEmail] = useState(first.email);
  const [interviewerPhone, setInterviewerPhone] = useState(first.phone);
  const [duration, setDuration] = useState(String(DEFAULT_DURATION));
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [meetingLink, setMeetingLink] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Calendar — default to the first upcoming day with open slots at the default duration.
  const [selectedDateKey, setSelectedDateKey] = useState(() => firstAvailableDateKey(now, { seed, durationMin: DEFAULT_DURATION }));
  const [monthKey, setMonthKey] = useState(() => `${firstAvailableDateKey(now, { seed, durationMin: DEFAULT_DURATION }).slice(0, 7)}-01`);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const durationMin = Number(duration);
  const where = mode === "remote" ? meetingLink : mode === "in_person" ? address : phoneNumber;
  const whereMeta = WHERE_META[mode];
  const setWhere = mode === "remote" ? setMeetingLink : mode === "in_person" ? setAddress : setPhoneNumber;

  const confirm = useMemo(
    () => confirmLineParts({ round, mode, candidateName: row?.candidateName, dateKey: selectedDateKey, slotStart: selectedSlot, durationMin, timezone, hasInterviewer: Boolean(interviewerEmail.trim()) }),
    [round, mode, row?.candidateName, selectedDateKey, selectedSlot, durationMin, timezone, interviewerEmail],
  );

  const canSchedule = Boolean(round && interviewerEmail.trim() && selectedDateKey && selectedSlot != null);
  const dirty = Boolean(interviewerEmail.trim() || selectedSlot != null || notes.trim() || where.trim());
  // Expansion is purely manual (summaryOpen). Checking "Screening summary" auto-opens it (see toggleInclude),
  // but the header can always collapse it again — don't OR-in include.summary or it can never close.
  const coveredIds = app?.screening?.manual?.coveredQuestions ?? DEFAULT_SCREENING_QUESTIONS.map((q) => q.id);

  // Changing duration re-derives slots; drop the selected slot if it no longer fits.
  function handleDuration(next) {
    setDuration(next);
    if (selectedSlot == null || !selectedDateKey) return;
    const av = getDayAvailability(selectedDateKey, { now, durationMin: Number(next), seed });
    const stillOpen = av.slots.some((s) => s.start === selectedSlot && !s.disabled);
    if (!stillOpen) setSelectedSlot(null);
  }
  function handleSelectDate(key) {
    setSelectedDateKey(key);
    setSelectedSlot(null);
  }
  function toggleInclude(key) {
    setInclude((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "summary" && next.summary) setSummaryOpen(true);
      return next;
    });
  }
  function handleOpenChange(next) {
    if (!next && dirty) {
      setConfirmDiscard(true);
      return;
    }
    onOpenChange?.(next);
  }
  function handleSubmit() {
    if (!canSchedule) return;
    onSchedule?.(row, {
      round,
      mode,
      dateKey: selectedDateKey,
      slotStart: selectedSlot,
      durationMin,
      timezone,
      interviewers: [{ name: interviewerName.trim(), company: interviewerCompany.trim(), email: interviewerEmail.trim(), phone: interviewerPhone.trim() }],
      where: { remote: { link: meetingLink }, in_person: { address }, phone: { number: phoneNumber } }[mode],
      notes: notes.trim(),
      sharePacket: { shareMode, include: shareMode === "cv_details" ? include : {} },
      scheduleDetails: buildScheduleDetails({ dateKey: selectedDateKey, slotStart: selectedSlot, durationMin, timezone }),
      notify: true, // scheduling always sends the invite — no separate opt-in
    });
  }

  return (
    <FxSheet open={open} onOpenChange={handleOpenChange} side="right" size="xl" expandable expanded={expanded} onExpandedChange={setExpanded}>
      <FxSheet.Header
        title="Schedule Interview"
        actions={
          <FxIconToggle
            icon={PanelLeft}
            pressed={showSummaryPane}
            onClick={() => setShowSummaryPane((current) => !current)}
            label={showSummaryPane ? "Hide candidate panel" : "Show candidate panel"}
          />
        }
      />
      {row ? (
        <FxSheet.Panes>
          {/* Left — candidate packet: Summary/Resume tabs + minimal share packet. */}
          {showSummaryPane ? (
            <FxSheet.Pane role="secondary" width="40%" className="p-0">
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex-none border-b border-[var(--fx-border)] px-4 py-3">
                  <FxTabs variant="segmented" value={tab} onValueChange={setTab} tabs={PACKET_TABS} />
                </div>
                {tab === "resume" ? (
                  <div className="min-h-0 flex-1 p-4">
                    <EvCandidatePreview candidate={candidate} fill resumeOnly />
                  </div>
                ) : (
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
                    <EvCandidateCard
                      candidate={candidate}
                      application={app}
                      mode="summary"
                      editable={false}
                      score={row.matchScore != null ? { label: "Fit Score", value: `${row.matchScore}%` } : undefined}
                    />

                    {/* What should be shared? — kept, but minimal + progressive. */}
                    <div className="space-y-3 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] px-3.5 py-3">
                      <GroupLabel>What should be shared?</GroupLabel>
                      <ShareRadio value={shareMode} onChange={setShareMode} />
                      {shareMode === "cv_details" ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            {DETAIL_TOGGLES.map((toggle) => (
                              <ShareCheckbox key={toggle.key} label={toggle.label} checked={include[toggle.key]} onChange={() => toggleInclude(toggle.key)} />
                            ))}
                          </div>
                          {/* Screening summary — collapsed accordion, auto-opens when its detail is included. */}
                          <div className="overflow-hidden rounded-[10px] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
                            <button
                              type="button"
                              onClick={() => setSummaryOpen((v) => !v)}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[var(--fx-surface-hover)]"
                            >
                              <span className="text-[13px] font-medium text-[var(--fx-text)]">Screening summary</span>
                              <ChevronDown className={cn("size-4 text-[var(--fx-text-muted)] transition-transform", summaryOpen && "rotate-180")} />
                            </button>
                            {summaryOpen ? (
                              <div className="border-t border-[var(--fx-border)] p-3">
                                <EvScreeningChecklist readOnly questions={DEFAULT_SCREENING_QUESTIONS} checked={coveredIds} title="Questions covered" />
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </FxSheet.Pane>
          ) : null}

          {/* Right — interview setup. White pane; the form is bound inside a soft inset card (like the Email sheet).
              Content is capped + centered so it stays readable when the pane is very wide. */}
          <FxSheet.Pane role="primary" className="p-0">
            <div className="h-full min-h-0 overflow-y-auto">
             <div className="mx-auto w-full max-w-[920px] px-5 py-5">
              <div className="flex flex-col gap-5 rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-bg-soft)] p-5">
              {/* Interviewer(s) */}
              <div className="space-y-2.5">
                <GroupLabel>Interviewer</GroupLabel>
                <div className="grid gap-3 md:grid-cols-2">
                  <FxInput size="md" value={interviewerName} onChange={(e) => setInterviewerName(e.target.value)} clearable={false} placeholder="Interviewer name" />
                  <FxInput size="md" value={interviewerCompany} onChange={(e) => setInterviewerCompany(e.target.value)} clearable={false} placeholder="Company / team" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FxInput
                    size="md"
                    value={interviewerEmail}
                    onChange={(e) => setInterviewerEmail(e.target.value)}
                    clearable={false}
                    list="ev-interviewer-emails"
                    placeholder="Add comma-separated emails"
                  />
                  <FxInput size="md" value={interviewerPhone} onChange={(e) => setInterviewerPhone(e.target.value)} clearable={false} placeholder="Interviewer phone" />
                </div>
                <datalist id="ev-interviewer-emails">
                  {RECENT_INTERVIEWERS.map((person) => (
                    <option key={person.email} value={person.email}>{person.name}</option>
                  ))}
                </datalist>
              </div>

              {/* Interview details — round · mode · duration · timezone in one compact row. */}
              <div className="space-y-3">
                <GroupLabel>Interview details</GroupLabel>
                {/* Row 1: Round (half — matches the inputs above) | Duration + Timezone share the other half. */}
                <div className="grid gap-3 md:grid-cols-2">
                  <FxCombobox size="md" label="Round / Stage" options={ROUND_OPTIONS} value={round} onChange={setRound} createLabel="Add round" placeholder="Select round" />
                  <div className="grid grid-cols-2 gap-3">
                    <FxSelect size="md" label="Duration" options={DURATION_OPTIONS} value={duration} onChange={handleDuration} />
                    <FxSelect size="md" label="Timezone" options={TIMEZONES} value={timezone} onChange={setTimezone} />
                  </div>
                </div>
                {/* Row 2: Mode (half — full-width tabs like the row above) | its mode-aware location (Dial-in / link / Address). */}
                <div className="grid items-start gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="text-[13px] font-medium text-[var(--fx-text-muted)]">Mode</p>
                    <ModeToggle value={mode} onChange={setMode} />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="ev-where" className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--fx-text-muted)]">
                      <whereMeta.icon className="size-3.5" /> {whereMeta.label}
                    </label>
                    {mode === "in_person" ? (
                      <FxTextarea id="ev-where" value={where} onChange={(e) => setWhere(e.target.value)} rows={2} placeholder={whereMeta.placeholder} />
                    ) : (
                      <FxInput id="ev-where" size="md" value={where} onChange={(e) => setWhere(e.target.value)} clearable={false} placeholder={whereMeta.placeholder} />
                    )}
                  </div>
                </div>
              </div>

              {/* When: pick a date + slot. */}
              <div className="space-y-3">
                <GroupLabel>When</GroupLabel>
                <div className="rounded-[12px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                  <EvInterviewCalendar
                    now={now}
                    seed={seed}
                    monthKey={monthKey}
                    onMonthChange={setMonthKey}
                    selectedDateKey={selectedDateKey}
                    onSelectDate={handleSelectDate}
                    durationMin={durationMin}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />
                </div>
              </div>

              {/* Notes / agenda */}
              <div className="space-y-1.5">
                <GroupLabel>Notes / agenda</GroupLabel>
                <FxTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Context or focus areas for the interviewer (optional)." />
              </div>

              {/* Live confirmation banner — key entities bolded so it reads as a clear recap of what's being booked. */}
              {confirm ? (
                <p className="flex items-start gap-2 rounded-[10px] border border-[color:color-mix(in_srgb,var(--fx-primary)_34%,var(--fx-border))] bg-[color:color-mix(in_srgb,var(--fx-primary)_11%,var(--fx-surface))] px-3.5 py-3 text-[13px] leading-[20px] text-[var(--fx-text)]">
                  <CalendarCheck className="mt-[2px] size-4 shrink-0 text-[var(--fx-primary)]" />
                  <span>
                    Booking a <strong className="font-semibold text-[var(--fx-text)]">{confirm.round}</strong>{" "}
                    <strong className="font-semibold text-[var(--fx-text)]">{confirm.mode}</strong> interview
                    {confirm.who ? <> with <strong className="font-semibold text-[var(--fx-text)]">{confirm.who}</strong></> : null} on{" "}
                    <strong className="font-semibold text-[var(--fx-text)]">{confirm.date}</strong> at{" "}
                    <strong className="font-semibold text-[var(--fx-text)]">{confirm.time}</strong>
                    <span className="text-[var(--fx-text-muted)]"> · {confirm.duration} min{confirm.tz ? `, ${confirm.tz}` : ""}</span>.
                  </span>
                </p>
              ) : null}
              </div>
             </div>
            </div>
          </FxSheet.Pane>
        </FxSheet.Panes>
      ) : (
        <FxSheet.Body />
      )}

      <FxSheet.Footer footerStart={<FxButton variant="outline" size="md" onClick={() => handleOpenChange(false)}>Cancel</FxButton>}>
        <FxButton variant="primary" size="md" className="min-w-[150px]" disabled={!canSchedule} onClick={handleSubmit}>
          Schedule &amp; Send Invite
        </FxButton>
      </FxSheet.Footer>

      <FxConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title="Discard this interview?"
        description="You haven't scheduled yet. Closing now will discard the details."
        confirmLabel="Discard"
        tone="danger"
        onConfirm={() => { setConfirmDiscard(false); onOpenChange?.(false); }}
      />
    </FxSheet>
  );
}

// CV only / CV + selected details radios (compact).
function ShareRadio({ value, onChange }) {
  return (
    <div className="space-y-2">
      {SHARE_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex w-full items-start gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition-colors",
              active ? "border-[color:color-mix(in_srgb,var(--fx-primary)_38%,var(--fx-border))] bg-[var(--fx-surface)]" : "border-[var(--fx-border)] bg-[var(--fx-surface)] hover:bg-[var(--fx-surface-hover)]",
            )}
          >
            <span className={cn("mt-[3px] inline-flex size-[15px] shrink-0 items-center justify-center rounded-full border", active ? "border-[var(--fx-primary)]" : "border-[var(--fx-border)]")}>
              {active ? <span className="size-[7px] rounded-full bg-[var(--fx-primary)]" /> : null}
            </span>
            <span>
              <span className="block text-[13px] font-medium text-[var(--fx-text)]">{option.label}</span>
              <span className="block text-[12px] leading-[16px] text-[var(--fx-text-muted)]">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
/* - - - - - - - - - - - - - - - - */
export { EvScheduleInterviewSheet };
/* - - - - - - - - - - - - - - - - */
