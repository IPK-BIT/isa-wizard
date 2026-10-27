# Metabuddy Implementation Plan

Implements the components described in [components.md](./components.md).

## 1. File Layout

```
src/
  lib/
    metabuddy/
      client.ts                # fetch wrapper for the 3 endpoints
      types.ts                 # request/response types from openapi.json
      scope.ts                 # appstate -> scope string, path helpers
      review.svelte.ts         # "needs review" paths from convert (confidence/warnings)
  components/
    metabuddy/
      FieldExplain.svelte      # info button + modal (explain)
      AskPanel.svelte          # free-text question (explain)
      ConvertDropzone.svelte   # drag-and-drop + preview/confirm (convert)
      ConvertPreview.svelte    # diff/summary of the proposed change
      ValidatePanel.svelte     # validation run + issue list
      MetabuddyPanel.svelte    # right-panel container hosting Ask/Validate/Convert
      ErrorState.svelte        # shared inline error + retry
mock/
  metabuddy-server.mjs         # local mock server
```

## 2. Config and Types

Extend `src/lib/types/Config.ts` (and `src/widget.d.ts`, which duplicates the config types):

```ts
export interface MetabuddyConfig {
	baseUrl: string;
	apiKey?: string;
	timeoutMs?: number;            // default 60000
	confidenceThreshold?: number;  // default 0.7
	features: { explain?: boolean; ask?: boolean; convert?: boolean; validate?: boolean };
}
```

- Add `metabuddy?: MetabuddyConfig` to `WizardConfig['integrations']`. The existing `fairdom` entry should become optional as well, so that the block is truly optional.
- Add `metabuddy?: boolean` to `FieldConfig` (opt-in for the explain button).
- Add the demo block to `public/nested-config.json`, pointing to the mock server.

## 3. API Client (`src/lib/metabuddy/client.ts`)

- `explain(req)`, `validate(req)`, `convert(form)`, each built on one internal `request()` helper.
- Reads `baseUrl`, `apiKey`, `timeoutMs` from the loaded config (`src/lib/config.svelte.ts`).
- Sets `X-API-Key` when a key is configured.
- Uses `AbortController` for the timeout and for cancelling stale requests.
- Normalises errors into `{ kind: 'network' | 'timeout' | 'auth' | 'invalid' | 'server', message }`. Maps `401` to `auth` and `400` to `invalid`, using the `ErrorResponse.detail` text when present.
- `convert` sends `multipart/form-data` (`scope`, `files[]`, `existingIsa` as a JSON string, optional `prompt`). Do not set `Content-Type` manually.
- Types in `types.ts` mirror the OpenAPI schemas (`ExplainRequest/Response`, `ValidateRequest/Response`, `ConvertResponse`, `ValidationIssue`, `OntologyTerm`). `scope` is typed as `string`.

## 4. Scope Handling (`src/lib/metabuddy/scope.ts`)

- Config `jsonPath` values are relative to the current level (e.g. `title`), while `appstate.isaLvl` holds the level path (e.g. `studies[0]`).
- `buildScope(stepJsonPath?: string): string` returns `isaLvl` + `.` + `stepJsonPath` (e.g. `studies[0].publications`). Without a step path it returns `isaLvl` alone, or `guiType` when `isaLvl` is empty (investigation level).
- The same value is used as `scope` for Ask, Validate and Convert, and as `field` for the explain button.
- Wizard mode passes the current step's `jsonPath` (or the field's `isaMapping.jsonPath`). GUI mode passes the path of the building block it is in, or nothing.
- Always send the complete `get(isaObj)` as `isaJson` / `existingIsa`.
- `extractScoped(response, scope)` returns the sub-tree at `scope` from a convert response. It is the only place that knows the response shape, so a different API shape changes only this function (and the mock).
- Comment-backed fields (`isaMapping.commentName`) have no plain path. Decide in phase 4 whether to send the `comments` path or a synthetic one.
- Reuse `parseIsaLvl` / `constructStudyPath` from `src/lib/util/breadcrumbUtils.ts` where useful.

## 5. Components

### 5.1 FieldExplain
- Rendered next to the label by the field components in `src/components/isa/singleton/*`, when `metabuddy` is enabled for the field and `features.explain` is on. To avoid touching every field, add a small shared label snippet or wrapper and use it in each singleton.
- Click opens the existing `layout/Modal.svelte`, calls `explain({ scope, field: jsonPath })` and renders `explanation` and a list of `examples`.
- Loading and error states are inside the modal (`ErrorState` with retry). Responses are cached per `(field, scope)` until the modal closes.

### 5.2 AskPanel
- Textarea plus submit. Calls `explain({ scope, field: '', userQuestion })`.
- Renders `explanation`, plus `examples` and `ontologyTerms` when present. Keeps a short in-memory history of question/answer pairs for the session.

### 5.3 ConvertDropzone and ConvertPreview
- Opt-in per component in the config: `metabuddy: { convert: true }` on a step's `component` (needs `features.convert`). The dropzone renders directly under that component and its scope is `buildScope(component.isaMapping.jsonPath)`. It is not part of the right panel. Loaded with a dynamic `import()` from `Questionnaire.svelte`.
- Drag-and-drop plus file picker, optional prompt input. Accepts csv, txt, pdf, xlsx, docx. Maximum size is a client-side config limit (TBD with the Metabuddy team).
- Calls `convert` with `scope` and `existingIsa`. On success:
  1. Read the sub-tree at the scoped path from the returned `isaJson`.
  2. Show `ConvertPreview` with a summary of what changes at that path (added, changed, unchanged) and the list of `warnings`.
  3. On confirm, write only that sub-tree into the store at the scoped path. On cancel, discard.
- Applying: use a path-based setter on `isaObj` (via `isaObj.keyed(path)` or `update`), so nothing outside the scope is touched.
- `confidence` and `warnings` go into `review.svelte.ts` (a `$state` set of paths with scores). Cleared for a path once the user edits that field.

### 5.4 Needs-review highlighting
- `review.svelte.ts` exposes `needsReview(jsonPath): { score?: number } | undefined`.
- The field components in `isa/singleton/*` look up their `jsonPath` and show a warning style (e.g. DaisyUI `input-warning` and a small "needs review" badge) when the score is below `confidenceThreshold` or the path is in `warnings`.
- Collection components (People, Protocols, ...) are only highlighted at their top-level path, as a first step.

### 5.5 ValidatePanel
- Button "Run check". Calls `validate({ scope, isaJson })`.
- Shows a summary (`valid`) and `issues` grouped by severity (error, warning, suggestion) with `message` and `suggestion`.
- Clicking an issue navigates to the field by `updateAppstate` (best effort, parsing `issue.field`).

### 5.6 MetabuddyPanel and layout
- The right panel in `src/ISAWizard.svelte` (col 3, currently only the ISA JSON textarea, shown when `layoutMode === 'standalone'` and `showConsole`) gets a `MetabuddyPanel` rendered **below the ISA JSON preview card**.
- `MetabuddyPanel` renders `AskPanel` and `ValidatePanel` as cards or tabs, each only when its feature is enabled (`ConvertDropzone` lives next to the component it is enabled for, see 5.3). It renders nothing when `integrations.metabuddy` is missing.
- In `ISAWizard.svelte`, split the right column so that the ISA JSON card stays gated by `showConsole`, while the column itself renders when `showConsole` or any Metabuddy feature is on (still `standalone` only). The Metabuddy cards sit below the JSON card.

## 6. Optional Loading

- Everything is gated on `config.integrations?.metabuddy?.features.<x>`.
- Use dynamic `import()` for the Metabuddy components from the places that render them, so that disabled installs do not pay for them. Check that this works with the single-bundle lib build in `vite.config.ts`.
- No Metabuddy code runs, and no network call is made, when the block is absent.

## 7. Mock Server (`mock/metabuddy-server.mjs`)

- Plain Node `http`, no dependencies. Port 4010, CORS enabled (`Access-Control-Allow-Headers: X-API-Key, Content-Type`, handle `OPTIONS`).
- Checks `X-API-Key` and returns `401` if missing, so the auth path can be tested.
- `POST /explain`: canned `explanation`, `examples`, `ontologyTerms`. Echoes the scope and `userQuestion`.
- `POST /validate`: returns a fixed list with one error, one warning and one suggestion, with paths such as `studies[0].studyDesignDescriptors`.
- `POST /convert`: parses multipart minimally (or ignores the body), returns the posted `existingIsa` with a few extra values at the scoped path, plus `confidence` and `warnings`.
- A query param or header to force errors and latency (e.g. `?mock=400`, `?delay=3000`) for testing the error UX.
- `package.json`: `"mock:metabuddy": "node mock/metabuddy-server.mjs"`.

## 8. Implementation Phases

Each phase is mergeable on its own and ends with `pnpm check` plus a manual run in `pnpm dev` against the mock server.

### Phase 0: Decisions (no code)

- ~~Right panel visibility~~ **Decided:** renders in `standalone` layout when any Metabuddy feature is on, independent of `showConsole`. No `plugin` layout support.
- ~~Scope derivation~~ **Decided:** `isaLvl` + `.` + step `jsonPath`, see section 4.
- `/convert` response shape: **built to the assumption** (whole `isaObj`, absolute paths) and isolated in `extractScoped()`. Confirming it with the Metabuddy team stays open and runs in parallel to phases 1 and 2.

**Done when:** the Metabuddy team has confirmed or corrected the convert response shape. Phases 1 and 2 do not wait for this.

### Phase 1: Foundation and Validation

- Types, config extension and demo config (section 2).
- API client (section 3), scope helper (section 4) and mock server (section 7), checked with curl.
- `MetabuddyPanel` and the layout integration in `ISAWizard.svelte` (section 5.6), with the optional-loading gate (section 6).
- `ValidatePanel` (section 5.5), the simplest end-to-end case.

**Done when:** "Run check" in the right panel shows mock issues, and 401, 400 and timeout states render inline without blocking the wizard.

### Phase 2: Free-Text Question

- `AskPanel` (section 5.2), reusing the client, scope helper and `ErrorState` from phase 1.

**Done when:** a typed question returns `explanation`, `examples` and `ontologyTerms` in the panel.

### Phase 3: File Conversion

- `ConvertDropzone` and `ConvertPreview` (section 5.3), including the path-scoped apply.
- Built on the assumed response shape, isolated in `extractScoped()`. If the Metabuddy team answers differently, only that function and the mock change.

**Done when:** dropping a file shows a preview, confirming changes only the scoped sub-tree, cancelling changes nothing, and `warnings` are listed.

### Phase 4: Field-Level Hooks

- `FieldExplain` and the opt-in `metabuddy` flag on fields (section 5.1).
- Needs-review highlighting (section 5.4), fed by `confidence` and `warnings` from phase 3.
- Both need a hook in every `isa/singleton/*` component, so they are done together via a shared label and field wrapper.

**Done when:** opted-in fields show the info button and open the modal, and fields below the confidence threshold are highlighted after a conversion and cleared on edit.

## 9. Risks and Open Points

- **API key in the client:** exposed to every user. Needs a decision with the Metabuddy team.
- **Convert response shape and path format:** assumed absolute from the root. Confirm with the real API. Only `extractScoped()` and the mock change.
- **Scope derivation:** `isaLvl` + step `jsonPath`. Nested collection items and comment-backed fields (`commentName`) may need extra handling.
- **Right panel availability:** `plugin` layout has no right panel and Metabuddy is not supported there.
- **Field wiring:** the explain button and the review highlight need a small hook in every singleton field component.
- **No test framework** exists in the repo, so verification is `pnpm check` plus manual testing against the mock server.
