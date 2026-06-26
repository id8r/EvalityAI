# Fx Architecture

## Core Route Structure

Use Next.js route groups to separate public, auth, and workspace experiences without changing URL shape.

Current intended structure:

* Public landing stays at `/`
* Auth pages stay outside the workspace shell
* Authenticated workspace pages render inside `src/app/(workspace)/layout.js`
* Temporary shell review route is `/dashboard`

## Shell Principle Reference

Atlassian Navigation System Layout examples were reviewed only for layout thinking and UX principles:

* clear separation between navigation and content
* distinct responsibilities for top navigation and side navigation
* explicit scroll ownership
* stable page structure
* responsive assumptions
* disciplined content framing and spacing

Do not copy Atlassian code, API, styling, tokens, or naming.

## Top Navigation Decision

Use one reusable top navigation component, not separate public and app navbars.

Shared top bar component:

* `FxAppHeader`

FxAppHeader is the shared application header for all top-level layouts.

It should support a structural slot model:

* `start`
* `middle`
* `end`

Usage rule:

* Public landing pages use only `FxAppHeader`
* Public landing may also reuse `FxNotificationArea` when needed
* Workspace routes use `FxAppShell`, which composes `FxAppHeader` with optional shell regions such as sidebar, content, right panel, footer, and notification area

Do not use full `FxAppShell` on public landing pages.

## Current Review Decision

For the current shell review pass:

* keep `/dashboard` as the visual review route
* keep the full workspace shell frame visible
* keep `/ds` as the living visual design system
* keep architecture decisions in markdown, not in the visual playground

## FxUI Taxonomy

Reusable branded UI lives under domain folders inside `src/components/FxUI`.

Current taxonomy:

* `AppShell` for shell regions and app-frame components
* `Forms` for branded inputs, buttons, and field wrappers
* `Navigation` for reusable navigation components
* `DataDisplay` for reusable badges, tables, pills, and similar display patterns
* `Layout` for reusable panels and layout surfaces

Rules:

* `ui/` remains only for low-level Radix and shadcn primitives
* only components use the `Fx` prefix
* domain folders expose `index.js` barrel exports
* app routes and specimens should import from domain barrels where practical

## Shell Region Responsibilities

* `FxAppShell` owns viewport height, shell-level overflow boundaries, background layering, shell composition, and the sidebar and right-panel column widths
* each region component owns its own border and surface; the shell owns layout, not region chrome
* `FxAppHeader` owns the shared top navigation structure and splits into `start / middle / end`
* `FxAppSidebar` owns the left workspace navigation structure and splits into `header / body / footer`, filling the shell-provided column width
* `FxAppContent` is the single owner of content scrolling, content framing (max width), and page padding
* `FxRightPanel` owns the optional right-side utility region at shell level
* `FxAppFooter` is optional and hidden by default
* `FxNotificationArea` is optional and sits above the header when used
* optional right utility pane is a sibling shell region to `FxAppContent`, not page-local layout by default

## AppShell API Audit

### FxAppShell

Purpose:

* top-level authenticated workspace frame
* composition root for shell regions

Responsibilities:

* owns viewport height
* owns shell-level overflow boundaries
* owns application background layering
* owns the right-panel column width (`SIDEBAR_WIDTHS.rightPanel`)
* gives the sidebar an `auto` grid column that follows the sidebar element's own (animated) width
* lays out notification row first
* lays out sidebar column, workspace region, and optional right panel

Props:

* `notificationArea`
* `header`
* `sidebar`
* `rightPanel`
* `footer`
* `children`
* `className`
* `shellBodyClassName`

Defaults:

* right-panel width from `SIDEBAR_WIDTHS.rightPanel`

Does not own:

* region borders and surface treatment (each region component owns its own border and background)

Slots / children:

* `notificationArea`
* `header`
* `sidebar`
* `rightPanel`
* `footer`
* `children`

Defaults:

* no optional region is required

Optional regions:

* notification area
* sidebar
* right panel
* footer

Does not own:

* product navigation logic
* auth state
* theme behavior
* collapse behavior
* page-specific composition

### FxNotificationArea

Purpose:

* full-width application banner row above the shell

Responsibilities:

* spans the full application width
* sits above sidebar and workspace regions
* pushes the rest of the shell downward when present
* provides light tone treatment and region framing

Props:

* `children`
* `tone`
* `className`

Slots / children:

* `children`

Defaults:

* `tone="info"`

Optional regions:

* entire component is optional

Does not own:

* toast behavior
* dismissal behavior
* persistence
* event handling

### FxAppHeader

Purpose:

* shared application header for all top-level layouts

Responsibilities:

* defines a three-region top navigation model
* spans only the workspace region
* aligns directly to the sidebar edge
* owns header height contract

Props:

* `start`
* `middle`
* `end`
* `sticky`
* `className`

Slots / children:

* `start`
* `middle`
* `end`

Defaults:

* `sticky=true`
* height owned by the component from `APP_HEADER_HEIGHT` (not overridable)

Optional regions:

* any of the three slots may be empty

Does not own:

* search behavior
* user menu behavior
* auth behavior
* route data

### FxAppSidebar

Purpose:

* left authenticated workspace navigation region

Responsibilities:

* defines the sidebar as `header / body / footer`
* owns and animates its own width (expanded/collapsed) from `SIDEBAR_WIDTHS`
* owns internal sidebar scroll region

Props:

* `header`
* `body`
* `footer`
* `collapsed`
* `className`

Slots / children:

* `header`
* `body`
* `footer`

Defaults:

* `collapsed=false`
* width from `SIDEBAR_WIDTHS` (expanded/collapsed), animated via `transition-[width]`; the shell's `auto` column follows

Optional regions:

* `header`
* `footer`

Does not own:

* collapse state / persistence (a client wrapper owns state and feeds `collapsed` to the sidebar)
* route activation logic
* mobile drawer behavior
* product-specific nav rules

Note: `collapsed` here is presentational only — it adapts internal padding/alignment so slot content can render as an icon-only rail. The collapsed *width* is still owned by FxAppShell.

### Sidebar composition primitives

Reusable client primitives consumed by the sidebar slots (kept generic — data passed in, no product logic):

* `FxSidebarNavItem` — icon + animated label nav item. Props: `icon`, `label`, `href`, `onClick`, `active`, `collapsed`, `className`. Renders an icon-only button/link with a right-side tooltip when `collapsed`, and active styling from `FX_NAVIGATION`.
* `FxSidebarAccount` — avatar + name/email footer with a dropdown menu (theme toggle, settings, help, log out). Props: `name`, `email`, `collapsed`. Collapses to an icon-only avatar trigger.

### FxAppContent

Purpose:

* primary workspace content region

Responsibilities:

* owns main vertical page scrolling
* owns content padding
* owns max-width framing when desired

Props:

* `children`
* `widthClassName`
* `padded`
* `paddingClassName`
* `className`

Slots / children:

* `children`

Defaults:

* `padded=true`
* default content padding from `APP_CONTENT_PADDING`
* default width frame `max-w-7xl`

Optional regions:

* none, this is the main content region itself

Does not own:

* sidebar layout
* header layout
* right panel layout
* product page meaning

### FxRightPanel

Purpose:

* optional shell-level right utility region

Responsibilities:

* defines right panel as `header / body / footer`
* fills the width of the shell right-panel column
* stays a sibling shell region to content

Props:

* `header`
* `body`
* `footer`
* `hidden`
* `className`

Slots / children:

* `header`
* `body`
* `footer`

Defaults:

* `hidden=false`

Optional regions:

* `header`
* `footer`
* entire panel

Does not own:

* its own width (FxAppShell owns the right-panel column width via `SIDEBAR_WIDTHS.rightPanel`)
* product inspector logic
* open/close behavior
* page-local hacks

### FxAppFooter

Purpose:

* optional bottom shell region

Responsibilities:

* owns footer height contract
* frames bottom-of-shell content when enabled

Props:

* `children`
* `hidden`
* `className`

Slots / children:

* `children`

Defaults:

* `hidden=true`
* height owned by the component from `APP_FOOTER_HEIGHT` (not overridable)

Optional regions:

* entire footer

Does not own:

* app status logic
* legal/product decisions
* notification behavior

## Public Landing Decision

Public landing remains separate from workspace shell architecture.

Landing pages should:

* stay public at `/`
* use the shared top bar component
* avoid workspace shell chrome
* remain visually aligned through shared tokens, spacing, and typography

## Workspace Decision

Workspace routes should:

* use `FxAppShell`
* remain SSR-first
* keep behavior in small client leaves only when needed later
* avoid product-specific navigation logic inside `FxUI`

FxAppShell is only the authenticated workspace frame.

## Documentation Separation

These are separate concerns and should stay separate:

* `FxDesignSystem.md` = design decisions
* `FxArchitecture.md` = architecture decisions
* `/ds` = living visual design system and live component playground
