# Ev Reconstruction Plan — Phase 2 (Product)

Frozen direction 2026-06-27. FxUI foundation is good enough; remaining reusable patterns emerge only as
screens need them. Rebuild route-by-route, retire the old demo, avoid spaghetti.

## Layer boundary (hard rule)
- **`Fx*`** = UI / UX / design-system layer (theme, layout, primitives, visual system).
- **`Ev*`** = product / domain / demo data (collections, store, selectors, domain logic).
- Never mix. (Supersedes any earlier `FxData`/`FxDataModel` naming — that language is retired.)

## Ev data architecture
**Canonical seed JSON (static, `public/data/`):** `EvUsers.json`, `EvSettings.json`, `EvClients.json`,
`EvJobs.json`, `EvCandidates.json`, `EvApplications.json`. **No `EvOrganizations`** — company/profile lives
inside `EvSettings.json`.

**Code (`lib/`):**
- `EvStore.js` — LS plumbing: seed-on-first-load, get/set roots, soft/hard reset (Ev analog of `FxStorage`).
- `EvData.js` — domain CRUD / accessors over the collections.
- `EvSelectors.js` — pure derived/joined queries (no writes).

**Seed strategy:** static JSON is the seed source; LocalStorage is the mutable runtime copy. First load: if Ev LS
absent → fetch seed JSON → write LS; else use LS. Never overwrite LS on every refresh. `public/data` + fetch ⇒
seeding is async (needs a small init/hydration gate). No merge logic yet.

**LS root taxonomy** (one expandable key each, like `FxID8r`):
- `FxID8r` — Fx design-system UI state (theme, sidebar). *Exists.*
- `EvSeedData` — Ev domain runtime collections.
- `EvUIData` — Ev product view state; table prefs nested as fields: `ev.table.jobs`,
  `ev.table.jobWorkspace.<stage>` (unscreened / preScreened / shortlisted / sentToClient), `ev.table.candidates`,
  `ev.table.clients`.

**Table prefs** (separate from domain): `{ visibleColumnIds[], columnOrder[], sort:{columnId, direction},
density, pageSize:25 }` — wire `useFxTable` persistence through this. `pageSize`/pagination + column widths are
forward-looking. Do **not** persist search/filter yet.

**Reset (helpers deferred — remind when starting landing/table work):** Soft = clear Ev domain collections only,
reload from seed, keep auth/onboarding/theme/settings/table prefs. Hard = clear all Ev demo LS → fresh visitor.
For now "cloud refresh" / "re-seed" = overwrite LS domain collections from seed JSON.

## Domain gate — freeze 6 entities before any product page
**User · Settings · Client · Job · Candidate · Application.**

- **Candidate** = reusable person/profile. **Job** = hiring need. **Application** = one candidate inside one job
  (replaces the old `candidate.jobContexts[jobId]` — do not continue that shape).
- **All candidate-job workflow state lives on `Application`:** stage · screening status · JD match score · trust
  score · screening answers · manual/email screening state · notes · activity · sent-to-client/review status ·
  scheduling/feedback metadata · rejection reason.
- Derivations: Job Workspace stage tabs = Applications filtered by `jobId` + stage; Jobs-list candidate counts =
  aggregated Applications; Candidate pool = Candidates with their Applications joined on demand (`EvSelectors`).
- `EvSettings.json` needed **early**: workspace type (internal / agency / both) gates whether Clients are
  shown/used across the app.

---

## Final route structure (FROZEN 2026-06-27)

Cleaner than the old app — URLs are `/jobs`, not `/app/jobs`. The `(workspace)` route group adds the
authenticated shell + auth gate **without** adding a URL segment. `/ds` sits OUTSIDE the group on purpose
(no auth, no shell) so devs can consume it freely.

```
src/app/page.js                          → /            Landing            [public]
src/app/login/page.js                    → /login       Auth entry         [public]  (TO CREATE)
src/app/signup/page.js                   → /signup      Auth entry         [public]  (TO CREATE)
src/app/welcome/page.js                  → /welcome     Onboarding         [public]  (exists)
src/app/ds/page.js                       → /ds          Design system      [public, no shell] (exists)

src/app/(workspace)/layout.js            → auth gate + FxAppShell           (exists)
src/app/(workspace)/jobs/page.js         → /jobs            Jobs list       (TO CREATE)
src/app/(workspace)/jobs/[jobId]/page.js → /jobs/:jobId     Job Workspace   (TO CREATE)
src/app/(workspace)/candidates/page.js   → /candidates      Candidate pool  (TO CREATE)
src/app/(workspace)/clients/page.js      → /clients         Client list     (TO CREATE)
src/app/(workspace)/settings/page.js     → /settings        Settings        (TO CREATE)
```

Rules: `(workspace)/layout.js` owns the unauth→`/login` redirect + `FxAppShell` (via existing
`WorkspaceShell.js`); public routes and `/ds` live outside it. Do NOT recreate the old `/app/*` segment.

**Cleanup:** `src/app/(workspace)/dashboard/page.js` is not a product route — remove it (or redirect
`/dashboard`→`/jobs`) when Jobs lands. No `(workspace)/ds` exists (good — `/ds` stays top-level only).

**Open routing call:** candidate detail — recommend a **FxSheet** opened from `/candidates` (and reused in
the Job Workspace) rather than a `/candidates/[candidateId]` route; add the route only if deep-linkable
candidate URLs are wanted. Settings stays a single `/settings` route with internal left-nav (no sub-routes).

**Build gate:** routes are scaffolded only AFTER the Ev schema is frozen (pending the 7 schema questions),
then Jobs first.

---

## Route order (LOCKED) + per-route brief

### 1. Landing / Auth / Welcome — confirm only, do not block
Already scaffolded in the rebuild (`app/page.js`, `marketing/LandingPage.js`, `marketing/AuthDialog.js`,
`app/welcome/page.js`, `marketing/OnboardingPage.js`).
- **Reuse:** existing marketing components, `FxButton/hero`, `FxDialog`, `FxInput`, `FxCreatableSelect`,
  `FxRadioGroupField`, `FxStorage`, `FxCopy`.
- **Ev data:** auth flags + persona/workspaceType + company profile → `EvSettings`/storage. No business entities.
- **Now:** add `/login` + `/signup` routes wrapping AuthDialog; confirm post-auth redirects (signup→welcome,
  login→jobs) and that onboarding writes workspaceType. **Defer:** real auth/SSO, marketing polish.

### 2. 🔒 Freeze Ev schema + seed/store/selectors — *prerequisite*
Author the 6 entity schemas + seed JSON, `EvStore`/`EvData`/`EvSelectors`, and the first-load seeding gate.
**Defer:** Screening/Evaluation/Notification/ActionCenter sub-schemas (model when their screens arrive).

### 3. Jobs (list) — **FIRST: the product spine, validates the real domain model**
- **Old:** Active/Archived tabs + counts, search, Create Job, sortable table w/ per-stage counts + column picker,
  row-action menu, Create/Edit **Job sheet** (6 step-tabs).
- **Reuse:** `FxPageToolbar` (tabs+search+CTA), `FxTable`+`useFxTable`+`FxColumnManager`, `FxSheet` (step form),
  `FxBadge`, `FxTabs`, `FxAppShell`.
- **Ev data:** `Job` (+ derived stage counts via `EvSelectors` over Applications), client name from `Client`.
- **Now:** list + create/edit sheet on the frozen `Job` schema; wire `ev.table.jobs` prefs.
- **Defer:** publish/share/call-preview, AI recommend.

### 4. Job Workspace — the superset (stress-tests toolbar + table + sheet together)
- **Old:** detail header (status/meta + AI/secondary actions) → stage tabs → filter + bulk + search row →
  per-stage candidate table → candidate / add-candidate **sheets** (prev/next, resume pane).
- **Reuse:** `FxPageToolbar` (stage tabs + **bulk swap** + filter/search), `FxTable` (per-stage columns +
  selection), `FxSheet`, `FxSelectionSummary`, `FxAiButton`. **Surfaces `FxDetailHeader`** — build it only when
  this page reaches it.
- **Ev data:** `Job` + `Application` (stage/screening/scheduling/feedback all on Application).
- **Now:** stage tabs + Applications table + bulk stage-move + candidate sheet (read + move). Wire
  `ev.table.jobWorkspace.<stage>` prefs.
- **Defer:** AI screening/call, resume viewer, scheduling/calendar, client-share progress detail.

### 5. Candidates (list)
- **Old:** Active/Archived tabs, search, Add Candidate, table (name/role/fit/screening pills/updated) + column
  picker + row menu; detail = full page (header + meta grid + Profile/Match/Activity cards).
- **Reuse:** same list stack as Jobs; detail reuses `FxDetailHeader`.
- **Ev data:** `Candidate` (pool) joined to `Application` for role/fit/status via `EvSelectors`.
- **Now:** list + add; basic detail. **Defer:** AI match summary, activity timeline, resume.

### 6. Clients (list) — gated by workspace type
- **Old:** simplest list — Active/Archived tabs, search, Add Client, sortable table + column picker + row menu +
  status pills + empty state.
- **Reuse:** identical list stack; an empty-state composition (extract `FxEmptyState` only if reused).
- **Ev data:** `Client`; visibility gated by `EvSettings` workspace type.
- **Now:** CRUD list. **Defer:** client→jobs rollups.

### 7. Settings (UI) — different shape, mostly independent
- **Old:** left-nav + per-section forms (Profile, Org, Recruiting Status, Screening Mode, Email, Calendar…) each
  with a Save header; completion banner; provider connection cards.
- **Reuse:** `FxInput/FxTextarea/FxCheckboxField/FxRadioGroupField/FxCreatableSelect`, `FxPanel`, left-nav. **Not a
  toolbar pattern** — may surface a small `FxSectionHeader`.
- **Ev data:** `User` + `Settings` (company profile lives here; drives workspace type).
- **Now:** Profile + Organization + Recruiting Status (writes workspaceType consumed by Clients/Jobs).
- **Defer:** Email/Calendar/Billing/Integrations (mock provider cards), screening-mode deep config.

---

**Cross-cutting deferrals:** Career portal, Action Center, real AI, resume viewer, email/calendar integrations —
mocked until their owning screen is reached. **Demo retirement:** `/ds` stays as the living component reference;
the `(workspace)/dashboard` placeholder is replaced by real product routes under the workspace group.
