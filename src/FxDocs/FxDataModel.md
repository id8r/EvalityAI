/* src/FxDocs/FxDataModel.md | Extracted product domain model from previous Evality implementation | Codex | 2026-06-26 */

# Evality Data Model Review

Scope:
- Based on the previous Evality implementation in this repo
- Derived from actual storage seeds, normalization helpers, page usage, and settings/auth flows
- This is a product-domain review only, not the future canonical schema

Important high-level findings:
- `Job`, `Candidate`, and `Client` are the only real persisted business entities
- `User`, `Organization`, `Settings`, and `Authentication` are mostly local-storage state, not first-class relational models
- `Screening`, `Evaluation`, `Activity/Timeline`, `Notifications`, and `Action Center` are only partially modeled
- A large amount of state is nested under `candidate.jobContexts[jobId]`, which acts as a per-job candidate sub-document
- Demo data and synthetic/computed fields are mixed directly into the domain layer

---

## 1. Job

### Entity name
- `Job`

### Fields used

Core identity and lifecycle:
- `id`
- `title`
- `client`
- `company`
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `status`
- `isArchived`

Role definition:
- `positions`
- `experience`
- `experienceFrom`
- `experienceTo`
- `employmentType`
- `workplaceType`
- `location`
- `city`
- `locality`
- `salaryMin`
- `salaryMax`
- `currency`
- `salaryRange`
- `assignee`
- `priority`

Workflow and content:
- `evaluationContext`
- `questionFormat`
- `publishDate`
- `hideCompensationFromCandidates`

Pipeline counters:
- `unscreenedCount`
- `screenedCount`
- `preScreenedCount`
- `shortlistedCount`
- `sharedCount`
- `sentToClientCount`

Nested `data` payload:
- `jobTitle`
- `client`
- `experience`
- `employmentType`
- `workplaceType`
- `city`
- `locality`
- `salaryMin`
- `salaryMax`
- `currency`
- `assignee`
- `location`
- `domain`
- `department`
- `salaryRange`
- `priority`
- `evaluationContext`
- `questionFormat`
- `publishDate`
- `aiPrompt`
- `jobDescription`
- `primarySkills`
- `secondarySkills`
- `responsibilities`
- `evaluationRounds`
- `questions`
- `additionalInformation`
- `benefits`
- `benefitsSummary`
- `companyBrief`
- `preScreeningMode`
- `callingBackup`
- `backupNotes`

### Relationships
- One `Job` belongs to one `Client` logically via `client` / `company` string
- One `Job` has many `Candidates` via `candidate.jobId`
- One `Job` owns many per-job candidate sub-records via `candidate.jobContexts[job.id]`

### Derived/computed fields
- `company` normalized from `client`
- `salaryRange` derived from min/max/currency
- `location` derived from workplaceType/city/locality
- `screenedCount` and `preScreenedCount` mirrored
- `sharedCount` and `sentToClientCount` mirrored
- `publishDate` derived from timestamps when absent
- `domain`, `department`, `priority`, `questionFormat`, `evaluationContext` decorated from helpers/demo logic

### UI-only fields
- Jobs page view state is separate from entity:
  - search term
  - selected tab
  - sort config
  - visible columns
  - jobs view mode
- Review summaries generated in `jobs/page.js`

### Demo-only fields
- Decorated defaults from `decorateDemoJob`
- Synthetic `evaluationContext` from `DEMO_JOB_EVALUATION_CONTEXTS`
- `companyBrief` defaulted to `DEFAULT_COMPANY_BRIEF`
- Demo-generated salary ranges, departments, and priorities

### Fields that were never actually used or weakly used
- `aiPrompt` stored/form-managed but not meaningfully consumed downstream
- `benefitsSummary` mostly folded into `companyBrief`
- `additionalInformation` weak usage
- `callingBackup` and `backupNotes` only settings/form level
- `positions` used for display but not deeply operational

---

## 2. Candidate

### Entity name
- `Candidate`

### Fields used

Core identity:
- `id`
- `jobId`
- `jobTitle`
- `client`
- `name`
- `email`
- `phone`

Pipeline and qualification:
- `status`
- `clientStatus`
- `screeningOutcome`
- `trustScore`
- `matchScore`
- `experience`
- `availabilityDays`
- `currentSalary`
- `expectedSalary`
- `rejectionReason`

Resume and profile:
- `resume`
- `resumeText`
- `uploadedBy`
- `currentCompany`
- `interested`

Timestamps:
- `createdAt`
- `updatedAt`
- `appliedAt`
- `activityUpdatedAt`
- `cvAddedDate`

Screening and review:
- `screeningAnswers`
- `cvMatchBreakdown`
- `notes`

Per-job nested sub-document:
- `jobContexts`
- `jobContext` is a normalized convenience projection of `jobContexts[jobId]`

Fields observed under `jobContexts[jobId]`:
- `viewedAt`
- `status`
- `clientStatus`
- `rejectionReason`
- `screeningOutcome`
- `screeningResult`
- `screeningModeOverride`
- `screeningCompletedAt`
- `manualScreeningCompletedAt`
- `manualScreeningNotes`
- `emailScreeningStartedAt`
- `emailScreeningAttemptCount`
- `emailScreeningMessage`
- `notes`
- `notesList`
- `noticePeriod`
- `availabilityMode`
- `availabilityDate`
- `commuteComfortable`
- `shortlistedAt`
- `reviewSharedAt`
- `sharedAt`
- `reviewShareRecipients`
- `reviewShareMessage`
- `reviewShareMode`
- `reviewShareIncludes`
- `reviewShareCount`
- `clientActivity`
- `clientComments`
- `offeredAt`
- `joinedAt`
- `interviewSchedule`
- `scheduleDetails`
- `interviewer`
- `interviewStage`
- `recommendation`
- `feedbackLabel`
- `resumeText`

### Relationships
- Many `Candidates` belong to one `Job` through `jobId`
- `jobContexts` creates a many-job history shape, but current operational flow is still centered on one active `jobId`
- Candidate activity, screening, review sharing, and interview scheduling are all embedded inside candidate records, not separate entities

### Derived/computed fields
- `jobTitle` backfilled from job
- `client` backfilled from job
- `email` and `phone` auto-generated when absent in demo mode
- `trustScore` inferred from candidate status and job status
- `matchScore` inferred when absent
- `experience` inferred when absent
- `noticePeriodSortValue` computed in job workspace
- `unscreenedFilterStatus` computed from candidate + jobContext
- `jobContext` projection from `jobContexts[job.id]`
- historic jobs in `FxCandidateCard` derived from `jobContexts`

### UI-only fields
- current sheet selections
- selected candidate ids
- card variants/layout props
- open/close state for accordions, tabs, sheets
- inline edit state for card fields

### Demo-only fields
- synthetic candidate creation from job counters
- generated names, emails, phones
- generated `cvMatchBreakdown`
- fake historic jobs in `FxCandidateCard` fallback
- placeholder interviewer/recommendation/feedback fields

### Fields that were never actually used or weakly used
- `interested` mostly demo-only
- `uploadedBy` display/demo only
- `currentCompany` weak usage
- top-level `notes` partly legacy fallback once `jobContext.notes` / `notesList` exists
- `resume` raw field weak compared with `resumeText`
- `cvAddedDate` was requested in cards but not strongly operational in the old flow

---

## 3. Client

### Entity name
- `Client`

### Fields used
- `id`
- `name`
- `industry`
- `owner`
- `website`
- `email`
- `notes`
- `status`
- `archived`
- `createdAt`
- `updatedAt`

### Relationships
- One `Client` has many `Jobs`, linked by matching `job.client` / `job.company` to `client.name`
- Candidate counts on the clients page are derived through jobs, not directly linked

### Derived/computed fields
- `status` normalized from `archived`
- client metrics on UI:
  - `openJobs`
  - `candidates`
  - `lastActivity`

### UI-only fields
- active/archived tab state
- search term
- sort config
- client form draft
- delete/archive confirmation state

### Demo-only fields
- seeded demo clients
- metric rollups from seeded jobs/candidates

### Fields that were never actually used or weakly used
- `email` weakly used
- `notes` weakly used
- no strong client contact model beyond string fields

---

## 4. User

### Entity name
- No true persisted `User` entity
- Closest shapes:
  - `DEMO_USER`
  - `profileForm` in Settings
  - auth identity seed

### Fields used
From `DEMO_USER` / profile:
- `name`
- `email`
- `phone`
- `phonePlaceholder`
- `role`
- `aboutMe`

Auth-linked identity fields:
- `provider`
- `companyName`
- `companyWebsite`
- `companyLinkedIn`

### Relationships
- Not relationally modeled
- User identity influences seeded organization profile and onboarding/persona state

### Derived/computed fields
- company name/website/linkedin inferred from auth email domain or LinkedIn auth provider
- phone placeholder inferred from first job currency

### UI-only fields
- entire `profileForm`

### Demo-only fields
- `DEMO_USER`
- hardcoded role options

### Fields never actually used
- No persistent user id
- No multi-user membership model
- No recruiter directory beyond `DEMO_RECRUITERS`

---

## 5. Organization

### Entity name
- No true persisted `Organization` entity
- Closest persisted shape: `ORGANIZATION_PROFILE`

### Fields used
- `companyName`
- `companyWebsite`
- `companyLinkedIn`
- `aboutCompany`
- `companySize`
- `careerPageUrl`
- `logoUrl`
- `logoFileName`

Settings-only related fields:
- `organizationIndustries`

### Relationships
- Drives branding/defaults
- Not linked structurally to jobs/clients via ids

### Derived/computed fields
- organization seed derived from auth email domain or LinkedIn login

### UI-only fields
- industry chips
- career page settings section completion state

### Demo-only fields
- seed defaults from login/provider

### Fields never actually used or weakly used
- `careerPageUrl` weak
- `logoUrl`, `logoFileName` weak
- `organizationIndustries` not persisted with the profile

---

## 6. Screening

### Entity name
- No standalone `Screening` entity
- Screening data is split across:
  - job defaults
  - candidate top-level fields
  - `candidate.jobContexts[jobId]`
  - settings storage

### Fields used
Job-level screening config:
- `questionFormat`
- `data.preScreeningMode`
- `data.questions`
- `data.callingBackup`
- `data.backupNotes`

Settings-level screening config:
- `channels`
- `prescreenMode`

Candidate screening state:
- `screeningOutcome`
- `screeningAnswers`
- `jobContext.screeningModeOverride`
- `jobContext.screeningCompletedAt`
- `jobContext.manualScreeningCompletedAt`
- `jobContext.manualScreeningNotes`
- `jobContext.emailScreeningStartedAt`
- `jobContext.emailScreeningAttemptCount`
- `jobContext.emailScreeningMessage`
- `jobContext.commuteComfortable`
- `jobContext.availabilityMode`
- `jobContext.availabilityDate`

### Relationships
- Screening belongs to a candidate within the context of a job
- Screening questions belong to the job definition

### Derived/computed fields
- screening source label derived from mode/context
- unscreened filter state derived from status/outcome/context

### UI-only fields
- screening drawer tabs/step state
- question accordions
- manual screening draft form state

### Demo-only fields
- AI/manual/email screening placeholders
- synthetic email screening timestamps

### Fields never actually used or weakly used
- WhatsApp and phone bot screening methods were product options but not implemented
- no normalized screening record id, attempts table, or transcript model

---

## 7. Evaluation

### Entity name
- No standalone `Evaluation` entity
- Split across job definition and candidate breakdowns

### Fields used
Job-side evaluation:
- `evaluationContext`
- `data.evaluationContext`
- `data.evaluationRounds`

Candidate-side evaluation:
- `matchScore`
- `cvMatchBreakdown`
  - `overallScore`
  - `sections[]`
  - `section.key`
  - `section.label`
  - `section.score`
  - `section.maxScore`
  - `section.summary`

### Relationships
- Evaluation context belongs to job
- Match/breakdown belongs to candidate-for-job

### Derived/computed fields
- `cvMatchBreakdown` often generated lazily as mock data
- evaluation context often decorated from demo job title/id

### UI-only fields
- review summaries
- score displays, pills, tables, breakdown visualizations

### Demo-only fields
- entire mock CV match breakdown generation
- canned round seeds and question suggestions

### Fields never actually used or weakly used
- no evaluator identity
- no explicit score provenance
- no separate interview scorecard model

---

## 8. Activity / Timeline

### Entity name
- No standalone `Activity` entity
- Stored inside candidate job contexts

### Fields used
- `jobContext.clientActivity[]`
  - `type`
  - `status`
  - `text`
  - `timestamp`
  - `author`
- `jobContext.clientComments[]`
  - comment-like entries
- `jobContext.notesList[]`
  - `id`
  - `author`
  - `text`
  - `timestamp`

Timeline timestamps also used:
- `shortlistedAt`
- `reviewSharedAt`
- `sharedAt`
- `offeredAt`
- `joinedAt`
- `screeningCompletedAt`
- `manualScreeningCompletedAt`
- `emailScreeningStartedAt`

### Relationships
- Activity belongs to a candidate in a job context

### Derived/computed fields
- activity history merges `clientActivity` and legacy `clientComments`
- progress timeline displayed from milestone timestamps

### UI-only fields
- sheet mode (`status` vs `activity`)
- note draft state

### Demo-only fields
- synthetic or backfilled activity when updating statuses

### Fields never actually used or weakly used
- no canonical activity id for all entries
- no notification linkback or actor model

---

## 9. Notifications

### Entity name
- Not implemented as a stored entity

### Fields used
- None as domain data
- Only transient toast notifications:
  - title/message
  - tone implied by helper (`showSuccess`, `showWarning`)

### Relationships
- None

### Derived/computed fields
- None

### UI-only fields
- toast queue internal to UI library

### Demo-only fields
- all examples are runtime UI feedback only

### Fields never actually used
- all persistent notification types, inbox records, unread state, channels

---

## 10. Action Center

### Entity name
- Not implemented as a data model

### Fields used
- None

### Relationships
- None

### Derived/computed fields
- None

### UI-only fields
- page metadata only

### Demo-only fields
- placeholder description

### Fields never actually used
- tasks
- alerts
- reminders
- due dates
- ownership

---

## 11. Settings

### Entity name
- Not a single entity; a set of local configuration documents

### Fields used

Profile:
- `name`
- `email`
- `phone`
- `phonePlaceholder`
- `role`
- `aboutMe`

Recruiting status:
- `workspaceType`

Screening settings:
- `channels`
- `prescreenMode`

Email settings:
- `emailProviderConnections.gmail`
- `emailProviderConnections.outlook`
- `emailSenderAccount`
- `emailCommunicationPreferences.routeReplies`
- `emailCommunicationPreferences.copyRecruiters`
- `emailCommunicationPreferences.sendReminders`

Calendar settings:
- `calendarProviderConnections.googleCalendar`
- `calendarProviderConnections.outlookCalendar`
- `calendarDefaultAccount`
- `calendarTimezone`
- `calendarWeeklyAvailability[]`
  - `day`
  - `enabled`
  - `start`
  - `end`
- `calendarPreferences.useConnectedCalendar`
- `calendarPreferences.blockBusyTime`
- `calendarPreferences.preventDoubleBooking`
- `calendarPreferences.sendSchedulingReminders`

Organization settings:
- see Organization section

### Relationships
- Feeds defaults for jobs, scheduling, and branding
- Not structurally bound to user/org ids

### Derived/computed fields
- completion booleans:
  - `profileComplete`
  - `organizationComplete`
  - `recruitingComplete`
  - `emailConnected`
  - `calendarConnected`
- dirty-state flags for screening and workspace type

### UI-only fields
- active section
- sidebar scroll state
- connecting provider spinners/timers

### Demo-only fields
- provider connect simulation
- static billing section

### Fields never actually used or weakly used
- Billing is display only
- Notifications section commented out
- Integrations/team/AI context sections not implemented

---

## 12. Authentication

### Entity name
- Not a first-class auth model; entirely local storage driven

### Fields used
Storage-backed:
- `AUTH_COMPLETE`
- `AUTH_PROVIDER`
- `AUTH_EMAIL`

Derived auth identity:
- `email`
- `companyName`
- `companyWebsite`
- `companyLinkedIn`

Onboarding/auth-adjacent:
- `PERSONA`
- `ONBOARDING_COMPLETE`
- `ONBOARDING_CONTEXT`
- `DEMO_EXPERIENCE`

### Relationships
- Auth seeds organization profile
- Auth and onboarding gate app access

### Derived/computed fields
- provider/email -> inferred company identity
- auth intent controls demo experience mode and jobs view mode

### UI-only fields
- auth dialog open state
- onboarding form selections

### Demo-only fields
- social login is simulated
- email login is simulated
- auth success triggers demo store seeding on login path

### Fields never actually used or weakly used
- no user id
- no token/session/refresh token
- no backend identity provider record
- no password model

---

# Enums / Lookup Values Used

## Job Status
- `Draft`
- `Published`
- UI/archive state also uses `isArchived`

## Candidate Status
- `unscreened`
- `screened`
- `shortlisted`
- `shared`
- `offered`
- `joined`
- `dropped`
- `rejected`
- sometimes `archived` on candidates page filtering

## Client Status
- `Active`
- `Archived`

## Employment Type
- `Full-time`
- form/select allows more, but actual seeded/default usage is mostly `Full-time`

## Workplace Type
- `On-site`
- `Remote`
- `Hybrid`

## Screening Status / Outcome
- `Passed`
- `Failed`
- `In Progress`
- plus implicit source/mode:
  - `manual`
  - `form`
  - `phone` disabled
  - `whatsapp` disabled
  - runtime override values like `ai`, `manual`

## Question Format
- `prescreen_only`
- `cv_and_prescreen`

## Trust Score
- `High`
- `Medium`
- `Low`

## Availability
- Numeric day counts only in actual candidate model
- UI displays as `X day(s)`
- manual screening also introduces:
  - availability mode `date`
  - availability date

## Client Progress / Interview Pipeline Status
- `Feedback Awaited`
- `Shortlisted`
- `Interviewing`
- `Offered`
- `Joined`
- `Rejected`
- `On Hold`
- `Candidate Dropped Off`

## User Roles
Settings profile roles:
- `Recruiter`
- `Founder`
- `TA`
- `Other`

Onboarding role values:
- `recruiter`
- `recruitment-lead`
- `hiring-manager`
- `founder`
- `hr-team`
- custom created role values

## Personas
- `independent-recruiter`
- `recruiting-agency`
- `internal-talent-team`

## Workspace Types
- `my_company`
- `clients`
- `both`

## Billing Plans
- No real billing plan enum implemented

## Notification Types
- No persistent notification type enum implemented

## Industry Options
- `General`
- `Technology Staffing`
- `Consulting`
- `SaaS`
- `Analytics`
- `Fintech`
- `Product Services`
- `Cloud Infrastructure`
- `Venture Studio`

## Company Size Options
- `1-10`
- `11-50`
- `51-200`
- `201-500`
- `500+`

## Timezone Options
- `(UTC+05:30) Asia/Kolkata`
- `(UTC+00:00) UTC`
- `(UTC-05:00) America/New_York`
- `(UTC+01:00) Europe/London`
- `(UTC+08:00) Asia/Singapore`

---

# Canonical simplification guidance before JSON extraction

Strong recommendation for the next step:
- Promote only these as canonical demo entities:
  - `Job`
  - `Candidate`
  - `Client`
  - `Organization`
  - `User`
- Treat these as embedded sub-documents or later-phase extensions:
  - screening state
  - evaluation breakdown
  - activity timeline
  - share/interview metadata
  - settings/auth state

Biggest cleanup opportunity:
- split product domain from UI state
- split canonical candidate fields from `jobContexts`
- separate demo decoration from stored truth
- stop mirroring fields like `client`/`company`, `screenedCount`/`preScreenedCount`, `sharedCount`/`sentToClientCount`

That will make the future canonical files much cleaner:
- `FxJobs.json`
- `FxCandidates.json`
- `FxClients.json`
- `FxOrganizations.json`
- `FxUsers.json`

---

# Architecture Review — Canonical Domain Model (Claude)

*Reviewer: Claude. Scope: front-end demo (JSON + LocalStorage). Reviewing the proposed canonical model only — not redesigning the product. Axes: normalization, naming, relationships, extensibility.*

## Verdict

The extraction is accurate and the simplification instinct (promote a handful of entities, embed the rest) is right for a demo. One structural gap dominates everything else:

**There is no `Application` entity, and `candidate.jobContexts[jobId]` is silently doing that job.** Introducing `Application` (a candidate *in* a job) fixes normalization, relationships, and extensibility in a single move. Everything else is naming/consistency cleanup that's cheap to do now and expensive later.

## 1. Normalization

**Add a 6th canonical entity: `Application` (candidate × job).**
- `candidate.jobContexts[jobId]` already holds per-(candidate, job) state — status, screening, evaluation, activity, share, interview. That *is* an Application record in disguise.
- Move all per-job state out of `Candidate` into `Application`. `Candidate` keeps only person identity (name, email, phone, resume, currentCompany). `Application` holds pipeline status + screening + evaluation + activity + share + interview.
- Payoff: a candidate can apply to many jobs with one identity; "historic jobs" becomes `applications.filter(a => a.candidateId === c.id)` instead of mining `jobContexts`.

**Keep embedding the leaf concerns inside `Application`** (screening, evaluation/cvMatchBreakdown, activity[], notes[], share, interview). For JSON/LocalStorage, embedding is correct — they have no independent lifecycle. Do **not** over-normalize them into separate collections yet.

**Stop storing mirrored/derived fields as truth.** `client`/`company`, `salaryRange`, `location`, candidate `jobTitle`/`client`, and the `screenedCount`/`preScreenedCount` + `sharedCount`/`sentToClientCount` counters are all recomputable. Store inputs once; derive the rest in a read-time selector layer.

**Split stored truth from demo decoration.** `decorateDemoJob`, synthetic scores, fake CV breakdowns, generated emails belong in a seed/decoration layer — never in canonical JSON. This lets you swap demo data for real later without touching the schema.

## 2. Naming

- **Archive flag is inconsistent:** `isArchived` (Job) vs `archived` (Client) vs `status: Archived`. Pick one mechanism — recommend a `status` enum **plus** an `archivedAt` timestamp (null = active) everywhere (soft delete).
- **Job `data` blob is opaque.** Either flatten role fields to the top level or name sub-groups by concern (`roleSpec`, `content`, `screeningConfig`). `data` tells a reader nothing and currently duplicates top-level fields.
- **Relationship fields must be `<entity>Id`**, not display strings — `clientId`, `assigneeId`, `createdById`, `organizationId` (see Relationships).
- **Enum casing is mixed:** Job `Draft/Published`, Candidate `unscreened/screened`, Client `Active/Archived`, pipeline `Feedback Awaited`. Standardize on lowercase tokens (`draft`, `published`, `unscreened`) and render human labels in the UI layer.
- **Timestamp convention is good** (`createdAt`/`updatedAt` + `<event>At`) — keep it everywhere; give embedded activity/notes entries their own `id` + `at` + `actorId`.

## 3. Relationships (use IDs, not name matching)

- **Critical: `job.client`/`company` → `client.name` matching is fragile** — renames break links, duplicate names collide, counts mis-roll-up. Replace with `job.clientId → client.id`.
- **Candidate ↔ Job via `Application`:** `Job 1—* Application *—1 Candidate`. Drop `candidate.jobId` (a candidate isn't owned by one job); the link lives on `Application`.
- **Add `organizationId`** to Job/Client/Candidate/User even in the single-org demo — a one-line future-proof that makes the org the real root.
- **`assignee`/`owner`/`createdBy` → `userId`** referencing User (even if only one demo user exists).

## 4. Future extensibility

- **`Application` is the unlock:** interviews, screenings, evaluations, shares, and activity all hang off it cleanly; multi-job candidates and pipeline analytics become trivial.
- **ID-keyed maps over arrays** in LocalStorage: `{ [id]: entity }` per collection (O(1) lookup), plus an order array where ordering matters.
- **One namespaced LocalStorage key per collection:** `fx.jobs`, `fx.candidates`, `fx.clients`, `fx.applications`, `fx.organization`, `fx.user`. The proposed `Fx*.json` seeds map cleanly to these.
- **Defer, don't embed, future top-level concerns:** Notifications, Action-Center Tasks, Billing → model as their own collections referencing entity IDs when they arrive, not nested inside Candidate/Job.
- **Keep a thin selector/decoration layer** so derived fields and demo data never leak into stored truth.

## Proposed canonical set (my amendment to the guidance above)

**Stored collections (JSON / LocalStorage):**
`Organization` · `User` · `Client` · `Job` · `Candidate` · **`Application` (new)**

**Embedded inside `Application`:** screening, evaluation/cvMatchBreakdown, activity[], notes[], share metadata, interview/schedule.

**Not modeled yet (defer as separate collections):** Notification, Task (Action Center), Billing.

Seed files: `FxOrganizations.json`, `FxUsers.json`, `FxClients.json`, `FxJobs.json`, `FxCandidates.json`, **`FxApplications.json`**.

## Open questions before JSON extraction

1. Is a candidate ever one identity reused across jobs, or re-entered per job? (Confirms Candidate must dedupe independently of Application — I'm assuming yes, which is what motivates the split.)
2. Single-organization forever in the demo, or should `organizationId` be real now?
3. Counts as stored fields (fast) or fully derived (clean)? For a demo I'd derive.
4. Want me to draft the actual JSON shapes (`FxApplications.json` + revised Job/Candidate/Client) as the next step?
