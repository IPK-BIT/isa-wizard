# Metabuddy Components for ISA Wizard

Optional components that connect ISA Wizard to the Metabuddy API (LLM-powered metadata assistance).
See [implementation.md](./implementation.md) for how they are built.

## General

| Topic | Decision |
| --- | --- |
| Location | `src/components/metabuddy/`, all components are optional |
| Enablement | `integrations.metabuddy` block in the wizard config, one toggle per feature |
| API spec | `docs/metabuddy/openapi.json` (endpoints `/explain`, `/convert`, `/validate`) |
| Development | Local mock server (dependency-free Node script, see implementation.md) |
| Authentication | `X-API-Key` header, key lives in the config and is sent from the client. It is treated as a non-secret for now. **Open:** to be discussed with the Metabuddy team |
| Request context | Always the complete `isaObj` |
| Scope | The current level as a JSON-path-like string, e.g. `studies[0].protocols`. Every ISA entity is an accepted scope (the scope description in the OpenAPI spec is outdated) |
| Error handling | Inline spinner and error message with retry inside each component. The wizard is never blocked. Configurable timeout, default 60 s |

### Configuration

```jsonc
"integrations": {
  "metabuddy": {
    "baseUrl": "http://localhost:4010",
    "apiKey": "dev-key",
    "timeoutMs": 60000,
    "confidenceThreshold": 0.7,
    "features": {
      "explain": true,   // Field Explanation
      "ask": true,       // User Freetext Explanation
      "convert": true,   // File Conversion
      "validate": true   // Validation
    }
  }
}
```

## Components

### 1. Field Explanation

| | |
| --- | --- |
| Endpoint | `POST /explain` |
| Placement | Info button next to a field label |
| Enablement | `features.explain` **and** opt-in per field in the config (`metabuddy: true`) |
| Request | `scope`, `field` (the field's `jsonPath`), `isaJson` (complete `isaObj`) |
| Output | Modal showing `explanation` and `examples` |
| Expected usefulness | Low. Fields already support a static description |

### 2. User Freetext Explanation

| | |
| --- | --- |
| Endpoint | `POST /explain` |
| Placement | Right panel, below the ISA JSON preview |
| Enablement | `features.ask` |
| Request | `scope`, `field: ""`, `userQuestion`, `isaJson` (complete `isaObj`) |
| Output | `explanation`, and `examples` / `ontologyTerms` if present |
| Expected usefulness | Medium. Depends on the quality of the Metabuddy response |

### 3. File Conversion

| | |
| --- | --- |
| Endpoint | `POST /convert` (multipart/form-data) |
| Placement | Drag-and-drop area under a wizard component (csv, txt, pdf, xlsx, docx, ...) |
| Enablement | `features.convert` **and** opt-in per component in the config (`metabuddy: { convert: true }`) |
| Request | `files`, `scope`, `existingIsa` (complete `isaObj`, so Metabuddy fills gaps), optional `prompt` |
| Response handling | Response `isaJson` is a whole `isaObj`. Only the sub-tree at the scoped path is applied |
| Confirmation | The user sees a preview and must confirm before the store is changed |
| Review hints | Fields with `confidence` below the threshold (default 0.7) and paths in `warnings` are highlighted as "needs review" |
| Expected usefulness | High. Allows users to reuse their ELN notes |

### 4. Validation

| | |
| --- | --- |
| Endpoint | `POST /validate` |
| Placement | Right panel, below the ISA JSON preview. Next to the export functions in GUI mode |
| Enablement | `features.validate` |
| Request | `scope`, `isaJson` (complete `isaObj`) |
| Output | `valid` flag and `issues` grouped by severity (`error`, `warning`, `suggestion`), each with `field`, `message`, optional `suggestion` |
| Expected usefulness | Medium. Syntax is valid by design, so the value lies in completeness and content suggestions |

## Decisions from Phase 0

- **Panel visibility:** the right panel renders in `standalone` layout whenever any Metabuddy feature is enabled, independent of `showConsole`. The ISA JSON preview card stays gated by `showConsole`, and the Metabuddy cards sit below it (or alone). The `plugin` layout is out of scope.
- **Scope string:** the absolute path is `isaLvl` + `.` + the step's `jsonPath` (e.g. `studies[0].publications`). Without a step (GUI building blocks) it is `isaLvl` alone, or `guiType` at the investigation level. The same value is the `scope` for Ask, Validate and Convert and the `field` for the explain button. One helper builds it for wizard and GUI mode.
- **Convert response shape:** built on the assumption "whole `isaObj` with absolute paths, apply only the scoped sub-tree". The assumption is isolated in a single `extractScoped()` function, and the mock server uses the same shape.

## Open Questions

- **API key exposure:** a client-side key is a temporary choice, to be discussed with the Metabuddy team.
- **Convert response shape:** the assumption above must be confirmed against the real API. A different shape only changes `extractScoped()`.
