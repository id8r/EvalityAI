# Job Workspace Audit

Scope: Evality-AI rebuilt Job Workspace compared against legacy `JOB_WORKSPACE_BEHAVIOR_REPORT.md`.

Legend:
- `✅` Implemented correctly
- `🟡` Partially implemented
- `🔴` Missing
- `⚪` Intentionally omitted

## Header

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Back link | ✅ | Shell header showed `All Jobs` back link for job detail routes. | Workspace shell shows `All Jobs` with back arrow for `/jobs/[jobId]`. | None. | - |
| Job title / summary | ✅ | Job title plus workspace summary strip. | Job title, status dot, and metadata row are present. | None. | - |
| Status dot semantics | 🟡 | Dot only for published jobs; danger tone when published without `evaluationContext`. | `FxStatusMeta` always renders a dot and also styles draft. | Legacy visibility/tones are not matched exactly. | Medium |
| Recommend Candidates | 🟡 | Opened `AddCandidatesDrawer` in recommend mode. | Opens add/recommend sheet. | Dedicated legacy drawer behavior is simplified. | Medium |
| Call Preview | 🔴 | Opened `CallPreviewDrawer`. | Header button is present but not wired to a legacy-equivalent drawer. | No actual preview workflow. | High |
| Share Job | 🔴 | Opened `ShareJobSheet`. | Header button is present but not wired to a dedicated share sheet. | No share surface. | High |
| Edit Job | ⚪ | Legacy used route-based edit flow. | Rebuilt product uses in-place edit sheet on the workspace plane. | Route-based edit is intentionally omitted. | - |

## Buckets / Tabs

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Tab set | ✅ | `Unscreened`, `Pre-Screened`, `Shortlisted`, `Interviewing`, `Offered`, `Joined`, `Dropped`, `Rejected`. | Same set is rendered via shared `FxTabs`. | None. | - |
| Default tab | ✅ | Missing/invalid tab resolved to `unscreened`. | Same behavior. | None. | - |
| Counts | ✅ | Counts derived from applications and state buckets. | Counts are computed from current application data. | None. | - |
| Interviewing bucket | ✅ | Legacy visible `Interviewing` bucket represented client-progress rows. | Same visible bucket exists. | None. | - |
| Dropped bucket | ✅ | Rejected candidates with dropped-off status appear in `Dropped`. | Same mapping exists. | None. | - |
| Empty-state behavior | ✅ | Stage-specific empty copy, add action only for unscreened. | Same pattern exists. | None. | - |

## Secondary Chips / Filters

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Unscreened filter UI | ✅ | Dropdown filter, not chips. | Dropdown filter present. | None. | - |
| Pre-screen filter UI | ✅ | Dropdown filter, not chips. | Dropdown filter present. | None. | - |
| Stage-local filter scope | ✅ | Filters apply inside the active bucket only. | Same scope. | None. | - |
| Search + filter order | ✅ | Filter first, then search. | Same ordering. | None. | - |

## Search

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Search scope | ✅ | Current tab only. | Same. | None. | - |
| Search shortcut `/` | 🔴 | `/` focused search. | Shortcut not wired. | Missing keyboard shortcut. | Medium |
| Search fields | 🟡 | Name, email, phone, plus a few app fields. | Search covers name, email, title, company, location, app id, client status. | Phone is not explicitly included; current coverage is broader but not identical. | Medium |
| Escape behavior | ✅ | `Escape` clears query or blurs. | Same. | None. | - |
| Query-aware empty copy | 🟡 | Empty result copy changed to `No results for "query"`. | Empty copy is generic. | Search-specific messaging not reproduced. | Low |

## Sorting

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Default sort on prescreened/shortlisted | ✅ | Defaulted to match score descending. | Same. | None. | - |
| Sortable columns | ✅ | Name, score, experience, current CTC, expected CTC, availability. | Same set is exposed. | None. | - |
| Sort cycle | ✅ | Asc → desc → none, with desc-first for score. | Same. | None. | - |
| Extra internal sort branches | ⚪ | Legacy had internal branches for columns not surfaced. | Those branches are not surfaced in the rebuild. | Intentionally omitted because corresponding columns are not shown. | - |

## Table Columns

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Name | 🟡 | Click opened candidate workspace and marked viewed. | Opens generic detail sheet. | Missing dedicated candidate workspace behavior. | High |
| Phone | ✅ | Tel link when available, otherwise plain text. | Same. | None. | - |
| Match / Fit score | 🟡 | Click opened CV match or pre-screen result sheets depending on stage. | Opens generic detail sheets. | Missing dedicated score sheets. | High |
| Experience | ✅ | Text column, sortable. | Same. | None. | - |
| Current CTC | ✅ | Currency-formatted column. | Same. | None. | - |
| Expected CTC | ✅ | Currency-formatted column. | Same. | None. | - |
| Email | ✅ | Present in model; default-visible only in select stages. | Same pattern exists. | None. | - |
| Availability | ✅ | Present in model; default-visible only in select stages. | Same pattern exists. | None. | - |
| Actions column | 🟡 | Stage-specific quick actions in a dedicated actions column. | Present with stage-specific icons, but several actions only open placeholders. | Some action targets are not rebuilt yet. | High |
| Kebab column | ✅ | Stage-specific row menu in a 56px trailing column. | Same structural pattern exists. | None. | - |
| Shared/interviewing columns | 🟡 | Schedule details, interviewer, stage, recommendation, feedback. | Column shell exists, but detail behavior is simplified. | Feedback is clickable now; dedicated interview workflow is incomplete. | High |

## Row Interactions

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Candidate name click | 🟡 | Opened candidate workspace and marked viewed. | Opens generic detail sheet. | Missing dedicated candidate workspace. | High |
| Score pill click | 🟡 | Opened stage-specific match/pre-screen sheets. | Opens generic detail sheet. | Dedicated match / result sheets missing. | High |
| Feedback cell | 🔴 | Visible but non-actionable in current legacy capture. | Now clickable. | Behavior changed from legacy. | Medium |
| Empty row click | ✅ | No row-level click on empty space. | Same. | None. | - |

## Inline Action Icons

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Unscreened mail / users | 🟡 | Opened email screening / manual screening sheets. | Wired as placeholder detail actions. | Dedicated screening sheets not rebuilt. | High |
| Pre-screened share / shortlist | 🟡 | Opened share-for-review and shortlist actions. | Present but simplified. | Full legacy sheet/workflow not rebuilt. | High |
| Shortlisted schedule | 🟡 | Opened scheduling sheet. | Present but simplified. | Dedicated scheduling sheet missing. | High |
| Interviewing workflow | 🟡 | Opened interview workspace. | Present but simplified. | Dedicated interview workspace missing. | High |
| Rejected rotate-back | ✅ | Move rejected back to pre-screened. | Wired. | None. | - |

## Kebab Menus

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Menu structure | ✅ | Stage-specific item sets, no special disabled-state behavior. | Same structural pattern. | None. | - |
| View / resume / download | ✅ | Present across stages. | Same. | None. | - |
| Reject action | ✅ | Present except rejected bucket. | Same structural pattern. | None. | - |
| Stage-specific extras | 🟡 | Share, schedule, drop, move-back actions in specific buckets. | Present in config, but several targets are placeholders. | Behavior is not yet complete. | High |

## Bulk Actions / Selection

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Row selection | ✅ | Checkbox selection in table. | Same. | None. | - |
| Stage-based selection restrictions | ✅ | Client-progress stages disabled selection. | Same. | None. | - |
| Bulk toolbar actions | 🟡 | Full stage-specific toolbar actions. | Structural shell exists, but some actions are simplified. | Missing complete legacy workflows. | High |
| Selected-visible fallback | ✅ | Bulk actions operate on selected visible rows or current visible set. | Same. | None. | - |
| Selection pruning | 🟡 | Selection pruned when rows disappear from view. | Partially aligned. | Not fully audited in current rebuild. | Medium |

## Sheets / Dialogs

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Add / Recommend candidates sheet | ✅ | Dedicated drawer for add/recommend flows. | Reusable sheet exists. | None. | - |
| Candidate workspace sheet | 🔴 | Dedicated candidate workspace sheet. | Not rebuilt as a dedicated sheet. | Missing core detail surface. | High |
| Share job sheet | 🔴 | Dedicated share job sheet. | Not rebuilt. | Missing. | High |
| Pre-screen result sheet | 🔴 | Dedicated result sheet with actions and stages. | Not rebuilt. | Missing. | High |
| Share for review sheet | 🔴 | Dedicated review-sharing sheet. | Not rebuilt. | Missing. | High |
| Schedule interview sheet | 🔴 | Dedicated scheduling sheet. | Not rebuilt. | Missing. | High |
| Interview workspace sheet | 🔴 | Dedicated interview workspace. | Not rebuilt. | Missing. | High |
| CV match breakdown sheet | 🔴 | Dedicated match breakdown sheet. | Not rebuilt. | Missing. | High |
| Email screening sheet | 🔴 | Dedicated email screening sheet. | Not rebuilt. | Missing. | High |
| Manual screening sheet | 🔴 | Dedicated manual screening sheet. | Not rebuilt. | Missing. | High |
| Client status update sheet | 🔴 | Dedicated client-progress update sheet. | Not rebuilt. | Missing. | High |
| Reject dialog | 🟡 | Captured rejection note before moving to rejected. | Confirm dialog exists, but no note capture. | Missing reason field. | Medium |

## Candidate State Transitions

| Item | Status | Legacy behavior | Current behavior | Gap | Priority |
|---|---|---|---|---|---|
| Rejected → Pre-screened | ✅ | Supported. | Supported. | None. | - |
| Rejected → Shortlisted | ✅ | Supported. | Supported. | None. | - |
| Shortlisted → Dropped | ✅ | Supported. | Supported. | None. | - |
| Unscreened email/manual screening flow | 🔴 | Full legacy screening flow existed. | Only simplified scaffold behavior exists. | Missing core screening transitions. | High |
| Share for review flow | 🔴 | Stored review metadata and opened dedicated sheet. | Not rebuilt fully. | Missing. | High |
| Schedule to interviewing | 🔴 | Scheduled interview updated client-progress state. | Not rebuilt. | Missing. | High |
| Client status updates | 🔴 | Dedicated client status activity and state updates. | Not rebuilt. | Missing. | High |

## Intentional Omissions

| Item | Status | Reason |
|---|---|---|
| Route-based Edit Job flow | ⚪ | Replaced intentionally with in-place editing on the workspace plane. |
| Surfaced-off legacy internal sort branches | ⚪ | Kept out because the corresponding columns are not part of the rebuilt UI. |

