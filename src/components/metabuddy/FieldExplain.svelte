<script lang="ts">
	import { get } from 'svelte/store';
	import { isaObj } from '$stores/isa';
	import { explain, MetabuddyError } from '$lib/metabuddy/client';
	import { buildScope } from '$lib/metabuddy/scope';
	import type { ExplainResponse } from '$lib/metabuddy/types';
	import ErrorState from './ErrorState.svelte';

	/**
	 * `path` is the absolute path of the field. A comment-backed field (`commentName`) has no plain
	 * path, it is addressed as `<path>.<commentName>`, the same form the review hints use.
	 */
	let {
		label = '',
		path,
		commentName = undefined
	}: { label?: string; path: string; commentName?: string } = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let loading = $state(false);
	let error: MetabuddyError | null = $state(null);
	let current: ExplainResponse | null = $state(null);

	// One answer per (scope, field), kept while the field is on screen. Closing the modal keeps it,
	// so reopening does not ask again. Navigating to another step drops it with the component.
	const cache = new Map<string, ExplainResponse>();

	async function load() {
		const scope = buildScope();
		const field = commentName != null ? `${path}.${commentName}` : path;
		const key = `${scope}\n${field}`;

		const cached = cache.get(key);
		if (cached) {
			current = cached;
			error = null;
			return;
		}

		loading = true;
		error = null;
		current = null;
		try {
			const response = await explain({ scope, field, isaJson: get(isaObj) }, 'explain-field');
			cache.set(key, response);
			current = response;
		} catch (err) {
			// A newer request replaced this one and is still running, so leave loading alone
			if (err instanceof MetabuddyError && err.superseded) return;
			error =
				err instanceof MetabuddyError ? err : new MetabuddyError('network', 'Request failed.');
		}
		loading = false;
	}

	function open() {
		dialog?.showModal();
		if (!loading) load();
	}
</script>

<button
	type="button"
	class="btn btn-circle btn-ghost btn-xs"
	aria-label={`Explain ${label || path}`}
	title="Explain this field"
	onclick={open}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		class="size-4"
		aria-hidden="true"
	>
		<circle cx="12" cy="12" r="9" />
		<path d="M12 11v5M12 8h.01" stroke-linecap="round" />
	</svg>
</button>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<h3 class="mb-3 text-lg font-bold">{label || path}</h3>

		{#if loading}
			<div class="flex items-center gap-2 text-sm">
				<span class="loading loading-sm loading-spinner"></span>
				Asking Metabuddy...
			</div>
		{:else if error}
			<ErrorState {error} onretry={load} />
		{:else if current}
			<div class="flex flex-col gap-3 text-sm">
				{#if current.explanation}
					<p class="whitespace-pre-wrap">{current.explanation}</p>
				{/if}
				{#if current.examples?.length}
					<div>
						<div class="mb-1 text-xs font-semibold">Examples</div>
						<ul class="list-disc pl-5">
							{#each current.examples as example}
								<li>{example}</li>
							{/each}
						</ul>
					</div>
				{/if}
				{#if !current.explanation && !current.examples?.length}
					<p class="opacity-70">Metabuddy has nothing to add for this field.</p>
				{/if}
			</div>
		{/if}

		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close">close</button>
	</form>
</dialog>
