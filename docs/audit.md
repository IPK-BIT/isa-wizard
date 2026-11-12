Code review and live test

# ISA Wizard Audit

11 November 2026 Commit `f11448b` Live site: [ipk-bit.github.io/isa-wizard](https://ipk-bit.github.io/isa-wizard/)

## Summary

The widget works well for small studies. Most problems appear with real-sized data, when an ISA-JSON file is loaded, or when the widget is embedded in another page. Four things need attention first: data that is lost or changed without warning, slow editing in large studies, the bundle size, and the type check, which fails. The remaining findings are smaller bugs, missing input checks and duplicated code.

The GitHub Pages deploy was broken by `251411f` (`widget.mjs` was not copied) and works again since `f11448b`.

## Measured on the live site

| Test | Result |
| --- | --- |
| Typing in Study Title, 5,000 sources | 150–380 ms per key |
| Typing in Study Title, 20,000 sources | 0.8–1.2 s per key |
| “Show ISA”, 1,000 sources | 2.9 s |
| “Show ISA”, 5,000 sources | page frozen > 90 s |
| “Show ISA”, 20,000 sources | tab crashed |
| “Select all” on 11,111 process inputs | page frozen 16.7 s |
| `widget.mjs` size | 5.8 MB (2.75 MB compressed) |
| `pnpm check` | fails, 271 errors |

Timings depend on the machine. All 271 type errors are inside `node_modules`; `src` itself has none.

## Priorities

In the suggested order of work. File references are to `src/`.

1. ### Make `pnpm check` pass

   High

   The ARC export imports `@nfdi4plants/arctrl` (`lib/export/arc.ts:3`). Its types point into `@fable-org/fable-library-ts`, which ships raw `.ts` files that fail under this project's `tsconfig`. Until this is fixed, the repo has no working automatic check.
2. ### Stop data loss in exports

   High
   - ISA-Tab: assays without an identifier are named `a_assay<i>.txt`, and `i` restarts in each study. Two studies produce the same file name, and isa4js keeps only one file per name, so one assay is lost from the zip (`components/gui/Exports.svelte:22`; found by reading the code).
   - ISA-Tab: factor values are not written, because no study factor is declared for them.
   - CSV import: a column without an ontology term loses its name and is exported as `Characteristics [Unknown]` (`components/util/MaterialUpload.svelte:71`).
   - ARC: one unexpected contract type makes the export return an empty zip (`lib/export/arc.ts:37`).
   - Every new entity is exported with `"@id": ""` (`lib/schemas/index.ts:75`).
3. ### Fix state that ends up on the wrong item

   High
   - Editable lists are keyed by index. After a delete, an open editor, a running OpenAlex lookup or a parameter's value type moves to the next item.
   - Template items are locked by position (`components/questionnaire/Questionnaire.svelte:85`). A study whose first protocol is a different one gets that protocol locked, and the template protocol is never added.
   - Choosing a parameter value type writes a `type` comment into the protocol's own parameter, because both point to the same object (`components/isa/composed/ParameterValue.svelte`).
   - The ISA store, app state and config are module-level singletons. A second `<isa-wizard>` on a page empties the first one's document.
4. ### Speed up large studies

   High
   - Every change serialises the whole document with `JSON.stringify(…, null, 2)`, even when “Show ISA” is closed (`stores/isa.ts:13`, `:25`). This runs on every keystroke and takes longer as the document grows.
   - “Show ISA” puts the full JSON into a textarea and parses it again on every keystroke. Invalid JSON while typing throws an uncaught error.
   - “Select all” in `components/util/EntitySelectModal.svelte` compares every item with every selected item.
   - Closed dialogs keep their content mounted, so each process builds lists of all entities. Each process also writes to the store when it mounts (`components/isa/composed/Process.svelte:42`).
5. ### Reduce the bundle

   Medium
   - `assets/error.png` is 2 MB, inlined as base64 (about 2.6 MB of the bundle), and shown at 128 px.
   - exceljs, arctrl and jszip load on every page. Load them with `await import()` when an export button is clicked.
6. ### Make loading and embedding robust

   Medium
   - Screens read nested fields such as `category.characteristicType.annotationValue` without guards. ISA-JSON that uses `@id` references for categories is likely to crash the study and assay screens (found by reading the code, not tested with a real file).
   - `ConfigLoader.validate()` does nothing. A wrong `rootTemplate` or a template without `metadata` shows up as a TypeError.
   - The config loads only in `onMount`, so setting `config` or `config-url` later has no effect.
   - `widget.d.ts` declares `ISAWizardElement`, but the runtime export is `IsaWizardElement`.
7. ### Close security gaps

   Medium
   - The Metabuddy `apiKey` is part of the widget config, which the browser downloads, so anyone using the page can read it.
   - Metabuddy “Convert” writes the LLM's answer into the document without checking its structure. The preview shows only top-level keys.
   - The TS4NFDI script and stylesheet load from an unpinned `/latest/` URL without SRI.
8. ### Reduce duplication and dead code

   Low
   - Nine list components (519 lines) differ only in schema, child component and labels. Copying has left wrong labels: People defaults to “Publications”, “pprocess”, and “Remove publication” on protocols.
   - `Process.svelte` has 683 lines, with the input and output logic written twice.
   - Unused: `lib/eventBus.ts`, `MetadataWidget.svelte`, and the composed `Material`, `Sample` and `Source` components.
   - `CLAUDE.md` is out of date: isa4js now comes from npm, the build script copies `widget.d.ts`, and the element lives in `IsaWizardElement.ce.svelte`.

## MIMSA template: behaviour to confirm

Seen while testing the MIMSA study template. Some of these may be intended.

- The person editor has no Roles field. The BioHackathon preprint says MIMSA uses CRediT roles for people.
- Study dates, site and coordinates are protocol parameter values. They reach ISA-Tab and ARC only on rows linked through a process; with no linked materials, the ISA-Tab study file is empty.
- No value checks: latitude 200, a completion date before the start date, “2024-02-30” as a birth date and duplicate IDs were all accepted.
- Parameter values offer only text, number or ontology term. The validated date and coordinate widgets are used only by the MIAPPE template.
- Semicolon-separated CSV files, the German Excel default, are read as a single column.
- The Materials section texts are hard-coded MIAPPE plant text (`components/isa/composed/Entities.svelte:23`). “Observation Unit” downloads `sample-template.csv`.
- The Experimental Design search covers only the DataPLANT collection.

**How this was done:** live tests on the GitHub Pages site with generated data of up to 20,000 sources, a read of all source files (about 9,000 lines), configs and build setup, and `pnpm check` after a clean install.

**Not checked:** the crash with `@id` references was found by reading the code only. The MIMSA checklist spreadsheet is not public, so the template was not compared with it field by field. The full findings list has about 60 items with file and line references.