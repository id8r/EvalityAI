/* src/FxDocs/EvJobWorkspaceColumns.md | Job Workspace per-stage table columns — review (from old app) | Claude | 2026-06-28 */

# Job Workspace — Per-Stage Table Columns (Review)

Extracted from the legacy `evality-rfa/app/app/jobs/[jobId]/page.js` (`columnsByKey` + per-stage `orderedColumns`,
`JOB_WORKSPACE_TABLE_HEADERS`). **Product-review only — do not build UI from this yet.** We freeze the real
columns per stage after reviewing this. Fields are mapped to our frozen `EvSchema` (Application is the row;
candidate fields come via `application.candidateId`).

## Stage mapping (old → our frozen `applicationStage`)
| Old code/label | Our stage | Notes |
|---|---|---|
| `unscreened` | `unscreened` | |
| `screened` "Pre-Screened" | `pre_screened` | |
| `shortlisted` | `shortlisted` | |
| `shared` "Interviewing" | `interviewing` | client-shared; **distinct column set** |
| `shared` + clientStatus Offered | `offered` | |
| `shared` + clientStatus Joined | `joined` | |
| `rejected` + clientStatus "Candidate Dropped Off" | `dropped` | |
| `rejected` (not dropped) | `rejected` | |

Old per-stage persistence key was `JOB_WORKSPACE_COLUMNS:v2:<stage>` → our equivalent is
`ev.table.jobWorkspace.<stage>` (EvUIData root — already implemented).

---

## Common columns (most stages) → schema mapping
| Column | Schema field | Cell type | Align | Sortable | Default | Notes |
|---|---|---|---|---|---|---|
| **Name** | `candidate.name` | text (+ status dot) | left | yes | always · **locked** · **sticky-left** | dot = `application.clientStatus` color on client stages |
| **Match / Fit Score** | `application.qualification.matchScore` | score badge (color by %) | center | yes | always | label "CV Match Score" (unscreened) / "Fit Score" (others); click → breakdown |
| **Experience** | `candidate.totalExperienceYears` | text (`Ny`) | center | yes | always | |
| **Phone** | `candidate.phone` | link/text | left | no | always | |
| **Current CTC** | `candidate.currentSalary` (Money) | currency | right | yes | always | via EvFormat |
| **Expected CTC** | `application.qualification.expectedSalary` (Money) | currency | right | yes | always | via EvFormat |
| **Email** | `candidate.email` | text | left | no | hidden* | *visible by default only on Shortlisted |
| **Availability** | `application.qualification.availability` | text (`N days`) | center | yes | hidden* | *visible by default only on Shortlisted |
| **Relevance** | `application.evaluation.cvMatchBreakdown` (strengths/gaps) | stacked | left | no | hidden | clickable |
| **Status** | `application.clientStatus` | badge OR dropdown | left | no | hidden | **dropdown** on Interviewing/Offered/Joined/Dropped, **badge** elsewhere; default "feedback_awaited" |
| **Last Updated** | `application.updatedAt` | relative date | center | yes | hidden | |
| **Rejection Reason** | `application.outcome.rejectionReason` | text | left | no | hidden | most relevant on Rejected |
| **Actions** | — | inline action button(s) | — | no | always · **locked** · **sticky-right** | stage-specific (below) |
| **Menu (kebab)** | — | dropdown | center | no | always · **locked** · **sticky-right** | stage-specific items |

**Sticky in old app:** Name (left), Actions + Menu (right). Selection/bulk checkbox was not pinned there but for
us it should be **sticky-left** (ahead of Name) when bulk selection is on.

---

## Per-stage configuration

### 1. Unscreened
- **Default visible:** Name · Phone · Match Score · Experience · Current CTC · Expected CTC · [Actions · Menu]
- **Hidden (column picker):** Email · Availability · Relevance · Status · Last Updated · Rejection Reason
- **Actions (inline):** Email Pre-Screening (with sent-count badge) · Manual Screen
- **Kebab:** View Candidate · View Resume · Download Resume · **Reject** (danger)

### 2. Pre-Screened (`screened`)
- **Default visible:** same as Unscreened; Fit Score cell shows a **screening-method icon** (AI call / email / manual)
- **Hidden:** Email · Availability · Relevance · Status · Last Updated · Rejection Reason
- **Actions (inline):** Share for Review (shared-count badge) · Shortlist
- **Kebab:** View Candidate · View Resume · View Pre-Screen Result · Share for Review · Download Resume · **Drop** (danger)

### 3. Shortlisted
- **Default visible:** Name · Phone · Fit Score · Experience · Current CTC · Expected CTC · **Email** · **Availability** · [Actions · Menu] *(Email + Availability shown by default here only)*
- **Hidden:** Relevance · Status · Last Updated · Rejection Reason
- **Actions (inline):** Schedule
- **Kebab:** View Candidate · View Resume · View Pre-Screen Result · Schedule · Download Resume · Drop · **Move back to Pre-Screened**

### 4. Interviewing (`shared`) — **distinct column set**
- **Default visible:** Name · Phone · **Schedule Details** · **Interviewer** · **Stage (round, e.g. "1 / 3")** · **Recommendation** · **Feedback** · [Actions · Menu]
  - Schedule Details → `application.interview` (scheduledAt + detail) · Interviewer → `interview.interviewerId` · Stage → `interview.stage` · Recommendation → `interview.recommendation` · Feedback → `interview.feedbackLabel` (clickable)
- **Hidden:** the standard screening columns (Match Score, Experience, CTCs, Email, Availability, Relevance, Last Updated, Rejection Reason)
- **Status:** rendered as a **dropdown** (clientStatus options) + Activity-History button
- **Actions (inline):** Interview Workspace
- **Kebab:** View Candidate · View Resume · Download Resume · **Reject** (danger)

### 5. Offered · 6. Joined · 7. Dropped (client-progress stages)
- **Default visible:** Name (status dot: Joined=green, Dropped=muted) · Phone · Match Score · Experience · Current CTC · Expected CTC · [Menu] — **no inline Actions button**
- **Hidden:** Email · Availability · Relevance · Status · Last Updated · Rejection Reason
- **Status:** **dropdown** select + Activity-History button
- **Kebab:** View Candidate · View Resume · Download Resume · Activity History · **Reject** (danger)

### 8. Rejected
- **Default visible:** Name · Phone · Fit Score · Experience · Current CTC · Expected CTC · [Actions · Menu]
- **Hidden:** Email · Availability · Relevance · Status (badge, read-only) · Last Updated · Rejection Reason
- **Actions (inline):** Move to Pre-Screened
- **Kebab:** View Candidate · View Resume · Download Resume · Move to Pre-Screened · Move to Shortlisted

---

## Notes / open questions to settle before freezing
1. **Per-stage column sets vs one shared set with stage-aware defaults?** Old app used one `columnsByKey` with
   per-stage `orderedColumns` + conditional `defaultVisible` (Email/Availability default-on for Shortlisted only).
   Interviewing is the only genuinely *different* set. Recommend: one column catalog, per-stage default-visible +
   order, persisted at `ev.table.jobWorkspace.<stage>`.
2. **Actions: inline buttons vs kebab-only?** Old app used BOTH (inline stage-action buttons + a kebab). Our
   `FxTable` actions cell supports `inline[]` + `items[]`, so we can keep both — confirm we want the inline buttons
   or consolidate into the kebab.
3. **clientStatus as in-cell dropdown** (Interviewing/Offered/Joined/Dropped) vs a read-only badge — confirm we
   want the editable dropdown in-table (it implies inline mutation + Activity History).
4. **Sticky:** Name sticky-left, Actions/Menu sticky-right, plus the **bulk checkbox sticky-left** — confirm.
5. **Score click-throughs** (CV Match breakdown / Pre-Screen result) and **Feedback** open sheets — deferred until
   the candidate sheet exists.
6. Several columns map to **reserved/embedded** Application objects (interview, evaluation) whose detailed shapes
   are deferred — fine for column display, but editing them needs those models.
