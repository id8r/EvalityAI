# Evality Progress Checklist

Last updated: 2026-06-25

## Current Stop Point

Work stopped after setting up the visual foundation and reference material.
The actual app UI has not been built yet:

- `src/app/page.js` still renders `Hello world!`
- `src/app/layout.js` still uses default metadata
- `README.md` is still the default create-next-app README

## What Has Been Achieved

### Setup and Tooling

- [x] Next app bootstrapped and runnable
- [x] Tailwind v4 wired into `src/app/globals.css`
- [x] shadcn config added in `components.json`
- [x] base UI utility setup added under `src/lib/` and `src/components/ui/`
- [x] dependency set expanded in `package.json`

### Design System Foundations

- [x] Global CSS token structure added in `src/app/globals.css`
- [x] neutral theme variables mapped for surfaces, borders, text, charts, and radius
- [x] reusable `Button` primitive added in `src/components/ui/button.js`
- [x] `cn()` utility added in `src/lib/utils.js`

### Reference Material Collected

- [x] color system notes added in `src/FxDocs/FxColors.md`
- [x] design system notes added in `src/FxDocs/FxDesignSystem.md`
- [x] HTML/reference inspiration files stored under `src/FxDocs/`
- [x] external inspiration and dumps stored under `xRef/`

## What Is Still Pending

### Product UI

- [ ] replace `Hello world!` in `src/app/page.js` with the actual Evality landing/app shell
- [ ] update `src/app/layout.js` metadata to proper Evality title and description
- [ ] decide the first real page scope: landing page, dashboard shell, or workflow screen

### Styling Alignment

- [ ] convert the current neutral shadcn token set to the Evality color system from `src/FxDocs/`
- [ ] define the final typography system instead of the current placeholder font mapping
- [ ] add layout primitives and section patterns beyond the single button primitive

### Content and Structure

- [ ] replace the default `README.md` with project-specific setup and intent
- [ ] decide which reference files in `xRef/` are canonical and which are just raw inspiration
- [ ] document implementation decisions as they are made so the design docs and code stay aligned

## Recommended Next Steps

- [ ] pick the first screen to implement
- [ ] map Evality tokens into `src/app/globals.css`
- [ ] build the page structure in `src/app/page.js`
- [ ] add supporting UI primitives only as needed by that page
- [ ] verify in browser and refine spacing, type, and color against the references

## Working Notes

- `git status` shows staged progress is not committed yet; most of the work exists as local modifications and new files.
- The largest completed change so far is dependency and design-system scaffolding, not user-facing UI delivery.
- This file should be updated whenever we finish a visible milestone or change direction.
