# Sprint Plan: Mobile Accessibility

**Dates:** Mon 2026-11-16 — Fri 2026-11-27 (2 weeks) | **Team:** 1 engineer
**Sprint Goal:** A first-time user on a 375 px phone can load the ISA Wizard in a reasonable time and complete the questionnaire without clipped fields or mis-taps.

Based on the findings in [mobile-assessment.md](mobile-assessment.md).

## Capacity

| Person | Available Days | Allocation | Notes |
|---|---|---|---|
| Developer | 10 of 10 | 8 days | ~20% buffer for reviews and interruptions |
| **Total** | **10** | **8 days** | |

## Sprint Backlog

| Priority | Item | Estimate | Dependencies |
|---|---|---|---|
| P0 | **Responsive main grid.** Make the grid in `ISAWizard.svelte` single-column below `lg`, stack the progress bar/tree above the content, and move the ISA console and MetaBuddy column below the step card | 2 d | None |
| P0 | **Shrink the bundle.** Compress or convert `error.png` (2 MB) and load it lazily, set `build.assetsInlineLimit`, and compress `logo.png`. Target: `widget.mjs` under 500 KB gzipped | 0.5 d | None |
| P0 | **Form controls fit the column.** Inputs use `w-full`/`max-w-full`, with a 16 px font on small screens so iOS doesn't zoom on focus | 1 d | Grid item |
| P1 | **Touch targets of at least 44×44 px on coarse pointers.** Covers about 80 `btn-sm`/`btn-xs` usages and the icon buttons | 1.5 d | Grid item |
| P1 | **Fix the init card width.** `InitView.svelte` uses `w-full max-w-sm` and smaller padding on narrow screens | 0.25 d | None |
| P1 | **GUI mode at 375 px.** Check the tree, entity tables (about 13 table components) and process sequence, and fix the worst problems, e.g. horizontal scroll wrappers on tables | 2 d | Grid item |

**Planned capacity:** 8 days | **Committed load (P0+P1):** 7.25 days (91%)

Out of scope: Lighthouse/axe checks in CI.

## Status (2026-11-12)

Details in [mobile-assessment.md](mobile-assessment.md). Nothing has been committed yet.

| Item | Status |
|---|---|
| P0 Responsive main grid | ✅ Done, verified at 375 px |
| P0 Shrink the bundle | ⚠️ Partly done: 2.76 MB → 719 KB gzipped; target < 500 KB not met |
| P0 Form controls fit the column | ✅ Done, verified (16 px font checked by simulating touch) |
| P1 Touch targets ≥ 44 px | ✅ Done, verified by simulating touch: 0 small controls in GUI, 2 inside the License picker |
| P1 Init card width | ✅ Done, verified |
| P1 GUI mode at 375 px | ✅ Overview tables stack and headers no longer wrap; wide nested tables still scroll inside their box |

**Still open:** the real-device check (Definition of Done), the bundle-size target, and the unguarded `protocolType` crash in `Protocols.svelte`, which I found while testing.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| The GUI mode tables are harder to fix than expected | The P1 GUI item spills over | Timebox it to 2 days, then fix the top 3 screens and move the rest to the backlog |
| Layout changes break embedded (`layoutMode` ≠ `standalone`) hosts | Regressions for widget consumers | Test the `<isa-wizard>` web component in a host page at both desktop and mobile widths |
| No real devices available | iOS-only issues go unnoticed | Use BrowserStack or a borrowed device for the final check |

## Definition of Done

- [ ] Questionnaire steps 1–3 can be completed at 375 px with no clipped content
- [ ] `pnpm check` passes and changes are reviewed and merged to `main`
- [ ] Checked on iOS Safari and Android Chrome against the GH Pages deployment
- [ ] `mobile-assessment.md` updated with before/after numbers

## Key Dates

| Date | Event |
|---|---|
| 2026-11-16 | Sprint start |
| 2026-11-20 | Mid-sprint check-in: P0 items merged |
| 2026-11-27 | Sprint end, demo on a phone, retro |
