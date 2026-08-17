# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm install` — install dependencies. Requires a sibling `../isa4js` directory (linked via `"isa4js": "link:../isa4js"` in package.json/pnpm-workspace overrides).
- `pnpm dev` — start Vite dev server (demo harness: `src/main.ts` + `App.svelte`, loads `public/nested-config.json`).
- `pnpm build` — `vite build` (library build, see below) followed by `tsc --declaration --emitDeclarationOnly` to emit `dist/widget.d.ts`.
- `pnpm check` — type-checks: `svelte-check --tsconfig ./tsconfig.app.json` then `tsc -p tsconfig.node.json`. Use this as the primary correctness check — there is no lint script and no test framework/test files in this repo currently.
- `pnpm format` — `prettier --write .`
- `pnpm preview` — preview the production build.

Package manager is **pnpm** (pnpm-lock.yaml / pnpm-workspace.yaml).

## Architecture

This is a Vite + Svelte 5 (runes) project built as an **embeddable widget/library**, not a SvelteKit app. It has no `src/routes/`.

### Entry points
- `src/web-component.ts` — the real distributable entry point. Defines `ISAWizardElement`, a custom element registered as `<isa-wizard>` (self-registers on import). Attaches a shadow root, mounts `ISAWizard.svelte` into it, and forwards config via `config-url`/`config` attributes or `setConfig()`. Dispatches a `finish` CustomEvent and supports an `onFinish` callback. Builds to `dist/widget.mjs` / `dist/widget.umd.js` (see `vite.config.ts`: lib mode, `$components` alias → `./src/components`, single combined CSS output).
- `src/main.ts` + `src/App.svelte` — local dev/demo harness only (mounts `<ISAWizard configUrl="/nested-config.json" />` into `#app`), not part of the published bundle.

### Config-driven rendering
The widget is driven by a JSON `WizardConfig` (see `public/nested-config.json` for the live example, and `src/lib/types/Config.ts` for the interfaces). A config has `templates` keyed by ISA level/type (investigation, study, assay variants), each with `steps`, each step having either:
- a `fields` array — each field has a `type` (resolved through `fieldTypes` in `src/lib/config/mapping.ts` to an `isa/singleton/*.svelte` component) and an `isaMapping.jsonPath` saying where in the ISA document the value lives, or
- a single `component` — resolved through `componentTypes` in the same mapping file to an `isa/collection/*.svelte` or `isa/composed/Entities.svelte` component (e.g. `publications`, `people`, `protocols`, or namespaced ones like `"brapi:images"`).

`src/lib/config/mapping.ts` is the glue registry between config strings and actual Svelte components — extend it when adding a new field/component type.

### ISA-Tab data model
- `src/stores/isa.ts` holds the entire Investigation JSON document in a single Svelte `writable` store (`isaObj`), with `studies[]` and `studies[].assays[]` encoding the Investigation → Study → Assay hierarchy. It layers `@humanspeak/svelte-keyed` on top so nested paths (e.g. `studies[0].assays[1]`) can be bound directly as `$bindable()` props via `isaObj.keyed(lvl)`, plus `keyedComments(jsonPath, commentName)` for ISA "Comments" (e.g. License storage).
- `src/lib/schemas/*.json` — JSON Schema for every ISA entity (investigation, study, assay, person, protocol, material, sample, source, process, publication, ontology_annotation, etc.). `src/lib/schemas/index.ts` exports `Schema.getObjectFromSchema(identifier, ...)`, used to instantiate new studies/assays/etc. with correctly-shaped defaults. `src/lib/types/isa.generated.d.ts` holds generated TS types from these schemas.

### UI state
Two runes-based `.svelte.ts` singletons (getter/updater functions, not Svelte context):
- `src/lib/appstate.svelte.ts` — navigation/UI state: `currentStepIndex`, `mode` (`'wizard'` | `'gui'`), `isaLvl` (a JSON-path-like string), `guiType`. `Gui.svelte` and the top-level components read/write this via `getAppstate()`/`updateAppstate()`.
- `src/lib/config.svelte.ts` — holds the loaded `WizardConfig` and `ConfigLoader.load()` (from URL or inline object). Note: `ConfigLoader.validate()` is currently a no-op.

### Component organization (`src/components/`)
- `isa/{singleton,collection,composed}` — the generic, standard-agnostic ISA-Tab widget library. `singleton` = single-value field widgets (Date, Select, OntologyAnnotation, ...); `collection` = list/table widgets (People, Protocols, Samples, ...); `composed` = full entity edit forms combining singleton/collection pieces (Person, Protocol, Process, ...).
- `brapi/` and `miappe/` — standard-specific extensions meant to plug into the same `fieldTypes`/`componentTypes` registry under namespaced keys (e.g. `"brapi:images"`). Currently `brapi/collection/BrapiImages.svelte` is the only implemented widget; `miappe/*` is scaffolded but empty (`.gitkeep` placeholders) — treat it as planned, not present.
- `gui/top-level/{Investigation,Study,Assay}.svelte` — the drill-down "gui" mode screens. Each takes a `$bindable()` slice of `isaObj` plus `config`, and navigates via `updateAppstate({ isaLvl, guiType, mode })`; `Assay.svelte` derives its parent `study` via `parseIsaLvl`/`constructStudyPath` in `src/lib/util/breadcrumbUtils.ts`.
- `gui/building-blocks/` — composite widgets used by the top-level screens (Materials, Protocols, ProcessSequence, TemplateCards, EditAsButton, ...).
- `questionnaire/` — the alternative step-by-step "wizard" mode UI (`mode: 'wizard'` in appstate), as opposed to `gui/`'s drill-down mode.
- `layout/` — chrome (Header, ProgressBar, Tree, Modal, InitView).
- `ts4nfdi/` — Terminology Service for NFDI ontology-lookup widgets (AutoComplete, Breadcrumb, Title, Metadata), tied to the `lookup-services` block in the wizard config.
- `util/` — misc dialogs (MaterialUpload, EntitySelectModal).
