# Reusable FxUI Audit

Quick cross-audit of `evality-rfa` vs `evality-ai`. This is intentionally short and only covers reusable UI patterns worth carrying forward.

| Component / Pattern | Purpose | Old project use | New project status | Recommendation |
|---|---|---|---|---|
| App Shell / Sidebar / Header | Authenticated frame with nav, header, and content canvas | `AppShell`, `Navbar`, `Sidebar`, `FxProtectedAppPage`; used across workspace pages | Already exists as `FxAppShell`, `FxAppHeader`, `FxAppSidebar`, `WorkspaceShell` | Already done |
| List Toolbar / Filter Bar | Tabs + search + filters + primary actions in list views | `candidates`, `clients`, `jobs` pages | Not yet a dedicated primitive | Build next |
| Bulk Action Bar | Selected-count strip with contextual actions | Large job workspace and list pages | Not yet extracted | Build next |
| Sort Header | Reusable column sort trigger / header control | Repeated in `jobs`, `candidates`, `clients` | Partial table support, but still page-level in places | Improve |
| Detail Sheet / Split Sheet | List-to-detail sheet with optional two-pane layout | Candidate/job detail flows and workspace sheets | `FxSheet` exists, but no split-detail wrapper | Build next |
| Empty State | Centered empty-card state with icon, body, action | List and panel empty states | No reusable primitive yet | Build next |
| Section Header | Eyebrow + title + note block | Repeated across product sections and marketing blocks | Only local versions in DS / pages | Build next |
| Stat Card / KPI Card | Compact metric summary card | Dashboard / summary sections | No dedicated primitive | Build next |
| Property Grid / Detail Row | Label-value rows for metadata and details | Candidate and job detail UIs | No dedicated primitive | Build next |
| Candidate Card | Candidate summary card with status, score, metadata | Candidate list / workspace views | No dedicated primitive | Build next |
| Job Card | Job summary card for lists and overview panels | Jobs pages | No dedicated primitive | Build next |
| Score Display | Fit / match score chip or cell | Candidate match surfaces | `FxScoreCell` exists | Already done |
| Step Indicator / Step Tabs | Wizard progress / multi-step workflow navigation | Create flows and guided workflows | No dedicated step component yet | Build next |
| Option Card / Radio Card Group | Card-style selectable options | Onboarding and selection flows | `FxRadioGroupField` exists, but not card-style | Build next |
| Activity Timeline | Chronological history / audit trail | Detail pages and candidate history | No reusable primitive yet | Build next |
| AI Action Panel | AI-specific action block, not just a button | AI-assisted review / screening flows | `FxAiButton` exists, not the panel pattern | Improve |
| Resume / Attachment Viewer | Document viewer pane for candidate assets | Candidate detail surfaces | Not present | Build next |
| Confirmation / Status Banner | High-signal banner for confirmations and state changes | Settings, workflows, action feedback | Not present as a reusable pattern | Build next |
| Landing / Auth / Onboarding page compositions | Route-level page shells, not atomic UI | `HomePage`, `FxLandingPage`, `FxAuthPage`, `FxOnboardingPage` | Current rebuild has landing/auth screens, but not as reusable primitives | Not worth keeping |

## Notes

- The rebuild already covers the core foundation: shell, tabs, buttons, table, inputs, creatable select, badge, and theme plumbing.
- The biggest remaining reusable gaps are list/tooling patterns, detail-sheet scaffolds, empty states, and a handful of workspace cards.
- Route-level pages should stay as compositions; only extract the repeated shell/pattern pieces into FxUI.
