# Evality Core Color Palette V1 — base colors

This document outlines the core color architecture for the Evality application platform.

**Source of truth:** `src/app/globals.css` defines the canonical runtime token values (light and dark), and `/ds` renders them live. This document and the design system doc describe intent only — when a value here disagrees with `globals.css`, `globals.css` wins.

**Correction Note:** Blue is explicitly locked as the main interactive Hero Brand Action system. Indigo functions as a secondary utility accent tier.

---

## Token Mapping Blueprint

| Base Color Hex | Semantic Token Name | Category / Group | Intended Usage |
| :--- | :--- | :--- | :--- |
| `#1068E0` | `--fx-primary` | Brand / Action | ★ Hero Brand Blue. Main application identity, primary navigation links, configuration anchors, and focal workspace action items. |
| `#1254B8` | `--fx-primary-hover` | Brand / Action | Tactile interactive hover/pressed state modifier step for the primary blue interface engine. |
| `#4F35FD` | `--fx-accent` | Brand / Action | Stripe Indigo secondary accent pop. High-visibility context switches, alternate category trackers, specialty brand notifications. |
| `#F3F6F9` | `--fx-bg` | Canvas & Surfaces | Main app outer window viewport background framework. |
| `#FFFFFF` | `--fx-surface` | Canvas & Surfaces | Primary workspace surfaces: sheet backgrounds, data tables, text fields. |
| `#F8FAFC` | `--fx-surface-subtle`| Canvas & Surfaces | Spreadsheet header decks, sticky top option bars, footer counters. |
| `#ECECEF` | `--fx-surface-muted` | Canvas & Surfaces | Layout striping alternative (zebra patterns), disabled system inputs. |
| `#E3E8EC` | `--fx-border-light` | Borders / Dividers | Light interior lines separating individual table grid cells. |
| `#BDC3CC` | `--fx-border` | Borders / Dividers | Standard component boundary packaging and input form boundaries. |
| `#888B93` | `--fx-border-strong` | Borders / Dividers | Outer application deck lines, sticky navigation panel headers. |
| `#1A293E` | `--fx-text` | Text Hierarchy | Major content headlines, deep body sentences, active tabular data items. |
| `#5A6880` | `--fx-text-muted` | Text Hierarchy | Column headers, meta descriptions, secondary subtitle fields. |
| `#3E4E6A` | `--fx-text-subtle` | Text Hierarchy | Inactive selection targets, non-focused left navigators. |
| `#78B030` | `--fx-success` | Semantic Utilities | Successful asset verification tags, execution markers. |
| `#F09C00` | `--fx-warning` | Semantic Utilities | Alert flags, pipeline compilation delays, cautionary fields. |
| `#CADDF9` | `--fx-info-surface` | Semantic Utilities | Informative notice panel wrappers, active focus highlights. |
| `#000000` | `--fx-shadow-core` | Shadow / Dark Base | Drop-shadow alpha layers and popover overlay dimensions. |
| `#26272B` | `--fx-dark-panel` | Shadow / Dark Base | High-contrast application navigation menus or static utility modules. |