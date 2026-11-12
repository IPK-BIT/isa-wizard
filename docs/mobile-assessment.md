# Mobile Assessment — ISA Wizard

**Baseline:** GH Pages deployment (https://ipk-bit.github.io/isa-wizard/), 2026-11-12, before the sprint
**Re-assessment:** working tree after the mobile sprint (not yet committed or deployed), 2026-11-12

## Verdict

|                | Before                                    | After                                             |
| -------------- | ----------------------------------------- | ------------------------------------------------- |
| Overall        | **Not mobile-ready**                      | **Usable on phones**, pending a real-device check |
| Questionnaire  | Form column ~142 px, fields clipped       | Full width, nothing clipped                       |
| GUI mode       | Not assessed                              | Stacks to one column; nested tables use full card |
| Initial JS     | 2.76 MB gzipped (`widget.mjs`)            | 254 KB gzipped (`widget.mjs` 146 KB + `config.svelte` 107 KB); target was < 500 KB |

## Method

- **Viewport:** 375×667 px (iPhone SE class), using a same-origin iframe in desktop Chrome.
- **Before:** measured on the GH Pages deployment.
- **After:** measured on the dev server, with the widget taken out of the demo harness so it fills the page the same way it does on GH Pages.
- **GUI mode:** loaded from a fixture investigation with 2 people, 1 study with 2 protocols, 2 sources and 2 samples, and 1 assay with a data file.
- **Touch-only rules:** desktop Chrome reports a fine pointer, so I copied the compiled `@media (pointer: coarse)` rules out of the shadow root and applied them without the media condition.
- **Bundle size:** `widget.mjs` from `vite build`, compressed with `gzip -9`.
- **Not done:** real iOS or Android devices.

## Results at 375 px

| Check                               | Before (GH Pages)                    | After                        |
| ----------------------------------- | ------------------------------------ | ---------------------------- |
| Main grid                           | 3 columns: 121 / 142 / 111 px        | 1 column: 375 px             |
| Horizontal page overflow            | None (content clipped instead)       | None                         |
| Clipped fields / labels (step 1)    | Inputs extend to 344–436 px          | 0                            |
| Console / MetaBuddy position        | Right column                         | Below the step card          |
| Landing card                        | ~200 px, title and button text wrap  | 323 px, no wrapping          |
| Form fields < 16 px (touch)         | 7 of 7                               | 0 of 7                       |
| Controls < 44 px, questionnaire (touch) | 10 of 11                         | 2 of 11, both inside the License picker (the picker itself is full width) |
| Controls < 44 px, GUI study view (touch) | n/a                             | 0 of 13                      |
| Nested tables in GUI overview       | n/a (198 px wide boxes, cut off)     | Full card width (275 px)     |

## What changed

1. **Responsive grid** (`ISAWizard.svelte`):
   - Below `lg` (1024 px) the layout is one column: progress bar or tree first, then the step card, then the console and MetaBuddy.
   - At `lg` and wider, the three-column layout is unchanged.
2. **Error image no longer in the main bundle:** `error.png` (2 MB) is now loaded with a dynamic import, so it only downloads when the config fails to load. Vite library mode always embeds imported assets, so this is the only way to keep it out of `widget.mjs`.
3. **Fields fit narrow columns** (`app.css`):
   - Native fieldsets default to `min-width: min-content`, and daisyUI labels don't wrap, so long help texts stretched fields beyond the column. Both are fixed globally.
4. **Touch devices** (`app.css`, `@media (pointer: coarse)`):
   - All inputs and Svelecte pickers use 16 px text, so iOS doesn't zoom in on focus.
   - Inputs and selects are 44 px tall.
   - `.btn`, tree entries and breadcrumb links are at least 44×44 px.
5. **GUI overview tables** (`Investigation`, `Study` and `Assay.svelte`, plus `.entity-overview` in `app.css`):
   - Below 640 px each label sits above its value instead of in a 25 % column.
   - The header button no longer wraps, and the breadcrumb shrinks instead.
6. **Landing card** (`InitView.svelte`): `w-full max-w-96` with smaller padding on phones.
7. **Export libraries load on demand** (`Exports.svelte`, `lib/datahub/export.ts`):
   - `@nfdi4plants/arctrl`, `exceljs`, `fsspreadsheet` and `jszip` made up 87 % of `widget.mjs`.
   - They are now imported dynamically when an ISA-Tab, ARC or PLANTdataHUB export starts, as `arc-*.js` (543 KB gzipped) and `isatab-*.js` (30 KB gzipped).

## Remaining issues

- **Biggest remaining items at startup:**
  - The embedded logo (`src/assets/logo.png`): 759×749 px and 101 KB, but never shown larger than ~320 px. A 384 px WebP would save roughly 90 KB.
  - The compiled CSS embedded in the shadow root: 141 KB raw, about 20 KB gzipped, mostly daisyUI components.
- **`widget.umd.js` (2.9 MB gzipped) doesn't benefit:** UMD puts everything, including the export libraries, in one file. Recommend that embedders use the ES build.
- **First export is slower:** it now downloads ~570 KB the first time.
- **Wide nested tables still scroll inside their box.** The 3-column protocol table is 435 px wide in a 275 px box. That's acceptable, but a card/list layout for protocols on phones would read better.
- **Breadcrumbs are cut off visually** on long titles. They can be scrolled horizontally, but nothing indicates that.
- **External TS4NFDI widget assets** are loaded from `ts4nfdi.github.io` on every visit. I didn't measure them.
- ~~**Bug found while testing:** a protocol without `protocolType` crashed the study view.~~ Fixed. Optional ontology fields are now guarded in `Protocols.svelte`, `ProcessSequence.svelte`, `ParameterValue.svelte` and `Assay.svelte` (`technologyType`).
- **No real-device test yet.** The touch rules were checked by simulation only. iOS Safari and Android Chrome still need checking before release.
