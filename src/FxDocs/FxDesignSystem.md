# Fx Design System
**Version:** 1.0

---

## Design Direction

The Evality design language should stay intentionally in the middle.

Avoid both extremes:

* Too technical or developer-tooling driven: terminal aesthetics, cyber styling, dense engineering UI, excessive sharp edges, overuse of monospace, dark hacker tone.
* Too soft or consumer-mobile: oversized controls, overly large radii, excessive whitespace, bubbly presentation, playful illustration-heavy surfaces.

Target a modern professional SaaS workspace suitable for a broad audience.

### Desired Qualities

* Clean
* Contemporary
* Calm
* Efficient
* Trustworthy
* Premium
* Data-first
* Fast to scan
* Minimal visual noise

Reference the maturity and restraint of products like Linear, Atlassian, Stripe Dashboard, and Vercel Dashboard, without copying them.

### Interaction And Visual Rules

* Prefer subtle over flashy.
* Use whitespace deliberately.
* Use color for meaning, not decoration.
* Maintain strong visual hierarchy.
* Components should feel light and crisp.
* Rounded corners should be moderate, generally `6px` to `8px`, with larger radii only where appropriate.
* Shadows should be soft and minimal.
* Borders should do most of the structural work.
* Animations should be quick and understated.
* Typography should carry hierarchy more than color.

### FxUI Library Rule

Every `FxUI` component should be generic enough to be reused across future products while still expressing the Evality design language through tokens, spacing, typography, and composition, not through one-off styling or product-specific logic.

When choosing between two visual approaches, prefer the one that is simpler, calmer, and more timeless.

---

## 🎨 Colors

### Brand & Actions
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--fx-primary` | `#1068E0` | Primary buttons, active navigation, links, CTAs |
| `--fx-primary-hover` | `#1254B8` | Hover and pressed states |
| `--fx-accent` | `#4F35FD` | AI actions, highlights, premium accents |

### Surfaces
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--fx-bg` | `#F3F6F9` | App background |
| `--fx-surface` | `#FFFFFF` | Cards, sheets, dialogs, tables |
| `--fx-surface-subtle` | `#F8FAFC` | Headers, footers, secondary panels |
| `--fx-surface-muted` | `#ECECEF` | Zebra rows, disabled surfaces |

### Borders
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--fx-border-light` | `#E3E8EC` | Dividers, grid lines |
| `--fx-border` | `#BDC3CC` | Inputs, cards, standard borders |
| `--fx-border-strong` | `#888B93` | Strong boundaries, sticky sections |

### Text
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--fx-text` | `#1A293E` | Primary text |
| `--fx-text-muted` | `#5A6880` | Secondary text |
| `--fx-text-subtle` | `#3E4E6A` | Inactive UI text |

### Semantic
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--fx-success` | `#78B030` | Success states |
| `--fx-warning` | `#F09C00` | Warning states |
| `--fx-danger` | `#D84040` | Errors, destructive actions |
| `--fx-info-surface` | `#CADDF9` | Information banners, selection highlights |

### Utility
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `--fx-shadow-core` | `#000000` | Shadow generation |
| `--fx-dark-panel` | `#26272B` | Reserved utility token |

---

## Typography

**Font Family:** `Inter, system-ui, sans-serif`

### Type Scale
| Role | Size | Weight | Usage |
| :--- | :--- | :--- | :--- |
| **Page Title** | `28px` | `600` | Page headings |
| **Section Title** | `20px` | `600` | Sections |
| **Card Title** | `16px` | `600` | Cards, sheets, dialogs |
| **Body** | `14px` | `400` | Default text |
| **Clickable** | `14px` | `500` | Links, clickable values |
| **Meta** | `13px` | `400` | Helper text |
| **Label** | `12px` | `500` | Labels, table headers |

---

## 📐 Dimensions & Layout

### Radius
| Token | Value |
| :--- | :--- |
| `Sm` | `6px` |
| `Md` | `8px` |
| `Lg` | `12px` |
| `Pill` | `999px` |

### Spacing
* **Base Unit:** `8px`
* **Scale:** `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`

### Control Heights
| Control | Height |
| :--- | :--- |
| **Input** | `40px` |
| **Select** | `40px` |
| **Button Sm** | `36px` |
| **Button Md** | `40px` |
| **Button Lg** | `44px` |

### Sheet Widths
| Token | Width | Multiplier | Usage |
| :--- | :--- | :--- | :--- |
| `Sm` | `512px` | 64 × 8px | Detail flyouts, login/auth window components, small forms |
| `Md` | `768px` | 96 × 8px | Standard data tables, configuration panels |
| `Lg` | `1024px` | 128 × 8px | Full screen viewport split-sheets, metrics dashboards |
| `Xl` / `Book-Sheet` | `1184px` | 148 × 8px | Dense workbook grids, multi-column analytics viewports |
