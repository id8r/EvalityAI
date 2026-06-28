/* src/FxDocs/EvSchema.md | Canonical Ev domain schema (frozen-candidate) | Claude | 2026-06-27 */

# Ev Schema — Canonical Domain Model

**Status:** FROZEN (approved 2026-06-27). Keyed/empty seed skeletons created at `public/data/Ev*.json`
(one template record each, empty values, to be replaced with real data). Next: real seed data, then
`EvStore` / `EvData` / `EvSelectors`. Supersedes the review in `FxDataModel.md` (old-app extraction).

## Conventions
- **IDs:** prefixed strings — `usr_`, `cli_`, `job_`, `cand_`, `app_`. Cross-entity links are always
  `<entity>Id`, never name matching.
- **Timestamps:** `createdAt` / `updatedAt` everywhere; event times as `<event>At`.
- **Soft delete:** `archivedAt` (null = active) on archivable entities. `status` is reserved for *true
  lifecycle* only (Job `draft|published`, Application `stage`, User account state).
- **Enums:** lowercase tokens (below); the UI renders human labels. No labels stored.
- **No derived values in canonical JSON** — counts, rollups, salary/location strings, completion %,
  historic-jobs, match summaries all live in `EvSelectors` (§Derived).
- **Seed shape:** each `Ev*.json` is a **plain array** of records (Settings is a single object).
  `EvStore` indexes arrays into `{ [id]: entity }` at load; canonical truth ≠ demo decoration.
- **No `EvOrganizations`.** No `candidate.jobContexts[jobId]` — that role is `Application`.

---

## Entities

### EvUsers — a person who uses the workspace
`id` · `name` · `email` · `phone` · `role`(userRole) · `aboutMe` · `authProvider?`(authProvider) ·
`status`(userStatus) · `createdAt` · `updatedAt`

### EvSettings — **singleton** workspace config (absorbs old Organization)
- **company:** `companyName` · `companyWebsite` · `companyLinkedIn` · `aboutCompany` ·
  `companySize`(companySize) · `careerPageUrl` · `logoUrl` · `industries[]`(industry)
- **workspace:** `workspaceType`(workspaceType — gates Clients) · `persona`(persona) · `ownerUserId`→User
- **screeningDefaults:** `channels[]`(screeningMode) · `prescreenMode`(screeningMode)
- **email** *(reserved — schema only, no UI):* `providerConnections{gmail,outlook}` · `senderAccount` ·
  `signature` · `communicationPreferences{routeReplies,copyRecruiters,sendReminders}`
- **calendar** *(reserved):* `providerConnections{googleCalendar,outlookCalendar}` · `defaultAccount` ·
  `timezone`(timezone) · `weeklyAvailability[]{day,enabled,start,end}` ·
  `preferences{useConnectedCalendar,blockBusyTime,preventDoubleBooking,sendSchedulingReminders}`
- **credits** *(reserved — usage/credits, no UI):* `plan?` · `balance` · `usage{}`
- `updatedAt`

### EvClients — hiring customer (optional per workspace type)
`id` · `name` · `industry`(industry) · `ownerUserId`→User · `website` · `email` · `notes` ·
`archivedAt`(null=active) · `createdAt` · `updatedAt`

### EvJobs — hiring requirement *(old opaque `data` blob flattened into named groups)*
- **core:** `id` · `title` · `clientId`→Client *(null = internal / my_company job)* ·
  `status`(jobStatus) · `priority`(priority) · `assigneeId`→User · `createdById`→User · `publishedAt` ·
  `archivedAt` · `createdAt` · `updatedAt`
- **roleSpec:** `positions` · `experienceFrom` · `experienceTo` · `employmentType`(employmentType) ·
  `workplaceType`(workplaceType) · `city` · `locality` · `salaryRange{ min, max, currency }` (Money) ·
  `hideCompensationFromCandidates` · `department?` · `domain?`
- **content:** `jobDescription` · `companyBrief` · `primarySkills[]` · `secondarySkills[]` ·
  `responsibilities[]` · `benefits[]`
- **screeningConfig:** `questionFormat`(questionFormat) · `preScreeningMode`(screeningMode) ·
  `questions[]{ id, text }`
- **evaluationConfig** *(reserved):* `evaluationContext` · `evaluationRounds[]` *(shape deferred)*

  Seed shape — fields are **nested objects** (`core`/`roleSpec`/`content`/`screeningConfig`/`evaluationConfig`);
  enum fields + `industry` use the frozen tokens (never friendly names); money is `{ min, max, currency }`:
  ```json
  {
    "core": { "id": "job_001", "title": "Senior Backend Engineer", "clientId": "cli_001", "status": "published",
      "priority": "high", "assigneeId": "usr_001", "createdById": "usr_001", "publishedAt": "…",
      "archivedAt": null, "createdAt": "…", "updatedAt": "…" },
    "roleSpec": { "positions": 3, "experienceFrom": 5, "experienceTo": 8, "employmentType": "full_time",
      "workplaceType": "hybrid", "city": "Bengaluru", "locality": "Bellandur",
      "salaryRange": { "min": 2800000, "max": 3600000, "currency": "INR" },
      "hideCompensationFromCandidates": false, "department": "Engineering", "domain": "Backend Platform" },
    "content": { "jobDescription": "…", "companyBrief": "…", "primarySkills": [], "secondarySkills": [],
      "responsibilities": [], "benefits": [] },
    "screeningConfig": { "questionFormat": "cv_and_prescreen", "preScreeningMode": "email",
      "questions": [{ "id": "q_001", "text": "…" }] },
    "evaluationConfig": { "evaluationContext": "…", "evaluationRounds": [] }
  }
  ```

### EvCandidates — **reusable person/profile only** (zero per-job state)
`id` · `name` · `email` · `phone` · `currentCompany` · `currentTitle?` · `totalExperienceYears` ·
`currentSalary{ amount, currency }` (Money) · `location?` ·
`resume{ fileName, url, text, extracted{ summary, skills[], experience[], education[], certifications[] } }` ·
`source`(source) · `archivedAt`(null=active — drives Active/Archived tabs) · `createdById`→User ·
`createdAt` · `updatedAt`

Resume stays on Candidate (no separate Resume entity). `text` → preview/search · `extracted.summary` → candidate
cards · `extracted.skills[]` → skill chips / JD match · `extracted.experience[]` → profile/detail ·
`extracted.education[]` / `extracted.certifications[]` → future candidate-sheet sections.

### EvApplications — **the spine: one candidate in one job; owns ALL workflow state**
- **core:** `id` · `candidateId`→Candidate · `jobId`→Job · `stage`(applicationStage) ·
  `clientStatus`(clientStatus | null — set once shared to client) · `source`(source) · `appliedAt` ·
  `viewedAt` · `createdAt` · `updatedAt`
- **stageHistory[]** `{ stage, at, actorId }` — append-only; the progress timeline + all stage `*At`
  milestones are **derived** from this (no scattered `shortlistedAt`/`offeredAt`/… fields).
- **qualification (per this job):** `matchScore`(0–100) · `trustScore`(trustScore) ·
  `expectedSalary{ amount, currency }` (Money) ·
  `availability{ mode(availabilityMode), days?, date?, commuteComfortable? }`
- **screening** *(embedded):* `{ status(screeningStatus), mode(screeningMode), answers[]{questionId,
  answer, score?}, completedAt, manual{completedAt, notes}, email{startedAt, attemptCount, message} }`
- **evaluation** *(embedded):* `{ cvMatchBreakdown{ overallScore, sections[]{key, label, score,
  maxScore, summary} } }`
- **clientShare** *(embedded):* `{ sharedAt, recipients[], message, mode, includes[] }`
- **interview** *(RESERVED — do not over-design now):* `{ status, rounds: [], summary }`. `rounds[]`
  shape intentionally undefined; the rich interview domain (multi-round, multi-interviewer, reschedule,
  feedback cycles, AI/client interviews, scheduling) evolves later without touching the outer schema.
- **outcome:** `rejectionReason?`(rejectionReason) · `rejectionNote?`(free text) — `dropped`/`rejected`
  timing comes from `stageHistory`.
- **activity[]** *(embedded):* `{ id, type, text, status, at, actorId }`
- **notes[]** *(embedded):* `{ id, text, at, actorId }`

Embedded objects (screening, evaluation, clientShare, interview, activity[], notes[]) have **no
independent lifecycle** — never separate collections.

---

## Enums (lowercase tokens; UI renders labels)

- **jobStatus:** `draft` · `published`
- **applicationStage** *(FROZEN — maps to Job Workspace tabs):* `unscreened` · `pre_screened` ·
  `shortlisted` · `interviewing` · `offered` · `joined` · `dropped` · `rejected`
- **clientStatus** *(FROZEN — client-side, after share; nullable):* `feedback_awaited` · `under_review` ·
  `interview_requested` · `offer_requested` · `offer_accepted` · `offer_declined` · `rejected` · `on_hold`
- **screeningStatus:** `pending` · `in_progress` · `passed` · `failed`
- **screeningMode:** `ai` · `manual` · `email` · `form` *(reserved-disabled: `phone`, `whatsapp`)*
- **questionFormat:** `prescreen_only` · `cv_and_prescreen`
- **trustScore:** `high` · `medium` · `low`
- **employmentType:** `full_time` · `part_time` · `contract` · `internship` · `temporary`
- **workplaceType:** `on_site` · `remote` · `hybrid`
- **availabilityMode:** `days` · `date`
- **source:** `upload` · `manual` · `referral` · `career_page` · `sourced` · `recommended`
- **rejectionReason:** `not_a_fit` · `experience_mismatch` · `salary_mismatch` · `location` ·
  `unresponsive` · `position_filled` · `other`
- **priority:** `low` · `medium` · `high`
- **userRole:** `recruiter` · `recruitment_lead` · `hiring_manager` · `founder` · `hr_team` · `other`
- **userStatus:** `active` · `invited` · `disabled`
- **authProvider:** `google` · `linkedin` · `email`
- **persona:** `independent_recruiter` · `recruiting_agency` · `internal_talent_team`
- **workspaceType:** `my_company` · `clients` · `both`
- **industry:** `general` · `technology_staffing` · `consulting` · `saas` · `analytics` · `fintech` ·
  `product_services` · `cloud_infrastructure` · `venture_studio` *(+ custom allowed)*
- **companySize:** `1-10` · `11-50` · `51-200` · `201-500` · `500+`
- **timezone:** `asia_kolkata` · `utc` · `america_new_york` · `europe_london` · `asia_singapore`
- **currency:** ISO codes (`INR`, `USD`, …)

`stage` = "where is this application in *our* recruiting pipeline?" · `clientStatus` = "what's happening
on the *client* side after we shared the candidate?" — kept as two independent fields by design.

---

## Relationship rules
- **EvSettings** = one singleton doc; `ownerUserId`→User.
- **User 1—\* Job** (`assigneeId`, `createdById`) · **User 1—\* Client** (`ownerUserId`); User also
  referenced by `activity.actorId`, `notes.actorId`, `stageHistory.actorId`.
- **Client 1—\* Job** via `job.clientId`. `clientId = null` ⇒ internal job. Clients shown/used only when
  `settings.workspaceType ∈ { clients, both }`.
- **Candidate ↔ Job = many-to-many, ONLY through Application.** `Job 1—* Application *—1 Candidate`. No
  `candidate.jobId`. A candidate is one reusable identity with many Applications.

---

## Derived — NOT stored (computed in `EvSelectors`)
Job per-stage counts · salary-range string · location string · experience label · Application stage
progress timeline (from `stageHistory`) · candidate "historic jobs" (= applications by candidateId) ·
candidate's current job/role/match/trust (from their Applications) · client rollups (openJobs,
candidates, lastActivity) · match summaries · settings completion percentages · all enum labels · all
demo decoration (synthetic scores, generated contacts, fake CV breakdowns → seed/decoration layer only).

---

## Storage mapping
- **`EvSeedData`** (LS root): collections `users`, `settings`(object), `clients`, `jobs`, `candidates`,
  `applications`. Seed `Ev*.json` arrays → `EvStore` indexes to `{ [id]: entity }` (+ order array where
  ordering matters).
- **`EvUIData`** (LS root): table/view prefs — `ev.table.jobs`, `ev.table.jobWorkspace.<stage>`,
  `ev.table.candidates`, `ev.table.clients`. Pref shape `{ visibleColumnIds[], columnOrder[],
  sort{columnId,direction}, density, pageSize }`. No search/filter persisted yet.
- **`FxID8r`** (LS root): Fx design-system UI state (theme, sidebar) — unchanged, separate layer.

---

## Review decisions (APPROVED 2026-06-27)
1. **`stageHistory[]`** is the single mechanism for stage transitions + derived timeline (no scattered
   `shortlistedAt`/`offeredAt`/… fields). ✓
2. **No `sent_to_client` stage.** "Shared to client" = `clientStatus != null` + `clientShare.sharedAt`;
   the Job Workspace "shared" view filters on that. ✓
3. **All 8 Job Workspace stages persist their own table view:** `ev.table.jobWorkspace.{unscreened,
   pre_screened, shortlisted, interviewing, offered, joined, dropped, rejected}`. ✓
4. **`interview.rounds[]`** intentionally unshaped (reserved). ✓
5. **Money objects:** `EvJobs.roleSpec.salaryRange{min,max,currency}`, `EvCandidates.currentSalary{amount,
   currency}`, `EvApplications.expectedSalary{amount,currency}`. ✓
