# ISA Wizard

An embeddable widget for collecting [ISA-Tab](https://isa-specs.readthedocs.io/) metadata (Investigation / Study / Assay) through configurable, multi-step forms. Built with Svelte 5 and shipped as a self-registering custom element, `<isa-wizard>`, so it can be dropped into any page regardless of framework.

## Usage

Embed the built widget on any page:

```html
<link rel="stylesheet" href="./style.css" />
<isa-wizard config-url="./nested-config.json"></isa-wizard>
<script type="module" src="./widget.mjs"></script>
```

Or configure it from JavaScript, once `widget.mjs` has registered the element:

```js
const widget = document.querySelector('isa-wizard');
widget.setConfig({ /* WizardConfig */ });
widget.onFinish = (data) => {
	console.log(data.investigation); // completed ISA-Tab investigation JSON
};
```

The widget is entirely config-driven: a `WizardConfig` JSON document (see [`public/nested-config.json`](public/nested-config.json) for a full example) defines templates per ISA level (investigation/study/assay), each with steps of fields or collection components. See [`src/lib/types/Config.ts`](src/lib/types/Config.ts) for the config schema and [`src/lib/config/mapping.ts`](src/lib/config/mapping.ts) for the registry of available field/component types.

A live demo is deployed via GitHub Pages on every push to `main` (see `.github/workflows/gh-pages.yml`).

## Development

Requires a sibling `../isa4js` checkout (linked via `pnpm-workspace.yaml`/`package.json`) unless you're happy relying on the published `isa4js` package from npm.

```sh
pnpm install
pnpm dev       # start the Vite dev server (demo harness at index.html)
pnpm check     # type-check with svelte-check + tsc
pnpm build     # build the library to dist/ (widget.mjs, widget.umd.js, style.css, widget.d.ts)
pnpm format    # prettier --write .
pnpm preview   # preview the production build
```

There is currently no lint script or automated test suite — `pnpm check` is the primary correctness gate.

## Architecture

See [`CLAUDE.md`](CLAUDE.md) for a detailed breakdown of the entry points, config-driven rendering, ISA-Tab data model, and component organization.
