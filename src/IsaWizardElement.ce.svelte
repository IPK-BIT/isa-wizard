<svelte:options
	customElement={{
		tag: 'isa-wizard',
		shadow: 'open',
		props: {
			config: { type: 'Object' },
			configUrl: { attribute: 'config-url', type: 'String' }
		}
	}}
/>

<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import ISAWizard from './ISAWizard.svelte';
	import { isaObj } from './stores/isa';
	import type { WizardConfig, WizardFinishData } from './lib/types/Config';
	import type { FinishCallback, ErrorCallback } from './lib/types/Events';
	// `?inline` routes this through Vite's normal CSS pipeline (Tailwind/PostCSS, @import
	// resolution) and returns the final compiled CSS as a string, rather than as an external
	// asset — a component `<style>` block compiled with `customElement` is emitted as a raw JS
	// string with no CSS processing, so `@import` inside it never actually resolves.
	import appCss from './app.css?inline';

	let {
		config = undefined,
		configUrl = undefined,
		onFinish = undefined,
		onError = undefined
	}: {
		config?: WizardConfig;
		configUrl?: string;
		onFinish?: FinishCallback;
		onError?: ErrorCallback;
	} = $props();

	async function handleFinish(data: WizardFinishData) {
		$host().dispatchEvent(new CustomEvent('finish', { detail: data, bubbles: true, composed: true }));
		await onFinish?.(data);
	}

	async function handleError(error: Error) {
		$host().dispatchEvent(
			new CustomEvent('error', { detail: { error }, bubbles: true, composed: true })
		);
		await onError?.(error);
	}

	export function getData(): WizardFinishData {
		return { investigation: get(isaObj), timestamp: Date.now() };
	}

	// The UMD bundle has no `import.meta.url` (Rolldown replaces `import.meta` with `{}` for
	// non-ESM formats), so fall back to the <script> tag's own src in that case.
	function getStylesheetUrl(): string | undefined {
		const metaUrl = (import.meta as { url?: string })?.url;
		if (metaUrl) return new URL('./style.css', metaUrl).toString();
		const scriptSrc = (document.currentScript as HTMLScriptElement | null)?.src;
		if (scriptSrc) return new URL('./style.css', scriptSrc).toString();
		return undefined;
	}

	const stylesheetUrl = import.meta.env.PROD ? getStylesheetUrl() : undefined;

	// daisyUI's theme CSS vars are scoped to `:root`/`[data-theme]` (see app.css), which never
	// matches inside a shadow tree — so without an explicit `data-theme` on an element that IS
	// inside the shadow root, every daisyUI color (bg-base-100, etc.) resolves to nothing. Mirror
	// the page-level `@media (prefers-color-scheme)` behavior manually instead. These theme names
	// are app.css's, not generic — kept in sync since this component already owns that import.
	let theme = $state(getPreferredTheme());
	function getPreferredTheme() {
		return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
			? 'ipk-dark'
			: 'ipk-light';
	}

	// The TS4NFDI widgets (AutoComplete, Metadata, ...) are built on Elastic UI, which styles
	// itself via Emotion (CSS-in-JS): at runtime it writes `<style data-emotion>` tags into
	// `document.head` and, in production builds, inserts rules straight into that tag's
	// CSSStyleSheet via the CSSOM rather than as text — so even reading `.textContent` would
	// miss them. Either way, `document.head` is outside this component's shadow root, and
	// shadow DOM style encapsulation blocks host-document styles from crossing in, so none of
	// it would otherwise reach the widgets rendered in here. Mirror the *effective* rules (via
	// `sheet.cssRules`, which reflects CSSOM inserts too) into a shadow-root-local <style>,
	// and keep it in sync as Emotion adds more rules for new component states.
	function mirrorEmotionStyles(shadowRoot: ShadowRoot) {
		const mirror = document.createElement('style');
		shadowRoot.prepend(mirror);

		let syncScheduled = false;
		function sync() {
			syncScheduled = false;
			const cssText: string[] = [];
			document.querySelectorAll('style[data-emotion]').forEach((styleEl) => {
				const sheet = (styleEl as HTMLStyleElement).sheet;
				if (!sheet) return;
				try {
					for (const rule of Array.from(sheet.cssRules)) {
						cssText.push(rule.cssText);
					}
				} catch {
					// Inaccessible sheet (e.g. cross-origin) — nothing we can mirror.
				}
			});
			mirror.textContent = cssText.join('\n');
		}
		function scheduleSync() {
			if (syncScheduled) return;
			syncScheduled = true;
			requestAnimationFrame(sync);
		}

		sync();
		const observer = new MutationObserver(scheduleSync);
		observer.observe(document.head, { childList: true, subtree: true, characterData: true });
		return () => observer.disconnect();
	}

	onMount(() => {
		const shadowRoot = $host().shadowRoot;
		let stopEmotionMirror: (() => void) | undefined;
		if (shadowRoot) {
			const style = document.createElement('style');
			style.textContent = appCss;
			shadowRoot.prepend(style);

			stopEmotionMirror = mirrorEmotionStyles(shadowRoot);
		}

		const mq = matchMedia('(prefers-color-scheme: dark)');
		const updateTheme = () => (theme = getPreferredTheme());
		mq.addEventListener('change', updateTheme);
		return () => {
			mq.removeEventListener('change', updateTheme);
			stopEmotionMirror?.();
		};
	});
</script>

<div data-theme={theme}>
	{#if stylesheetUrl}
		<!-- Third-party component CSS (e.g. svelecte) isn't compiled with `customElement`, so it's
		     extracted to dist/style.css instead of being injected above; link it in explicitly so
		     it still reaches this shadow root. Skipped in dev, where Vite serves CSS differently. -->
		<link rel="stylesheet" href={stylesheetUrl} />
	{/if}

	<!-- The TS4NFDI widget CSS is expected to be linked by the host page (see index.html), but a
	     host-page <link> only styles the light DOM and can't cross into this shadow root — the
	     widgets it styles (AutoCompleteWidget etc.) render inside here. Link it directly so the
	     widgets are styled regardless of what the host page does. The widget JS itself sets a
	     `window.ts4nfdiWidgets` global, which isn't shadow-scoped, so the host page's <script> tag
	     is still sufficient for that half. -->
	<link
		rel="stylesheet"
		href="https://ts4nfdi.github.io/terminology-service-suite/js-modules/latest/terminology-service-suite.min.css"
	/>

	<ISAWizard {config} {configUrl} onFinish={handleFinish} onError={handleError} />
</div>
