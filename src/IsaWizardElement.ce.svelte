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

	onMount(() => {
		const shadowRoot = $host().shadowRoot;
		if (shadowRoot) {
			const style = document.createElement('style');
			style.textContent = appCss;
			shadowRoot.prepend(style);
		}

		const mq = matchMedia('(prefers-color-scheme: dark)');
		const updateTheme = () => (theme = getPreferredTheme());
		mq.addEventListener('change', updateTheme);
		return () => mq.removeEventListener('change', updateTheme);
	});
</script>

<div data-theme={theme}>
	{#if stylesheetUrl}
		<!-- Third-party component CSS (e.g. svelecte) isn't compiled with `customElement`, so it's
		     extracted to dist/style.css instead of being injected above; link it in explicitly so
		     it still reaches this shadow root. Skipped in dev, where Vite serves CSS differently. -->
		<link rel="stylesheet" href={stylesheetUrl} />
	{/if}

	<ISAWizard {config} {configUrl} onFinish={handleFinish} onError={handleError} />
</div>
