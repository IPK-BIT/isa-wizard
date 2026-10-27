<script lang="ts" module>
	import type { ExplainResponse } from '$lib/metabuddy/types';

	interface HistoryEntry {
		id: number;
		question: string;
		response: ExplainResponse;
	}

	const HISTORY_LIMIT = 10;

	// Module level, so the history survives the panel being unmounted and remounted. Not persisted.
	let history: HistoryEntry[] = $state([]);
	let nextId = 0;
</script>

<script lang="ts">
	import { get } from 'svelte/store';
	import { isaObj } from '$stores/isa';
	import { explain, MetabuddyError } from '$lib/metabuddy/client';
	import { buildScope } from '$lib/metabuddy/scope';
	import ErrorState from './ErrorState.svelte';

	let question = $state('');
	let loading = $state(false);
	let error: MetabuddyError | null = $state(null);
	// The question of the last submit, so Retry still works after the textarea was edited
	let submitted = '';

	const canSubmit = $derived(!loading && question.trim().length > 0);

	async function run(text: string) {
		loading = true;
		error = null;
		submitted = text;
		try {
			const response = await explain(
				{ scope: buildScope(), field: '', userQuestion: text, isaJson: get(isaObj) },
				'ask'
			);
			history = [{ id: nextId++, question: text, response }, ...history].slice(0, HISTORY_LIMIT);
			if (question.trim() === text) question = '';
		} catch (err) {
			// A newer request replaced this one and is still running, so leave loading alone
			if (err instanceof MetabuddyError && err.superseded) return;
			error =
				err instanceof MetabuddyError ? err : new MetabuddyError('network', 'Request failed.');
		}
		loading = false;
	}

	function submit() {
		if (canSubmit) run(question.trim());
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			submit();
		}
	}

	function isHttpUrl(value: string | undefined): value is string {
		if (!value) return false;
		try {
			return ['http:', 'https:'].includes(new URL(value).protocol);
		} catch {
			return false;
		}
	}
</script>

{#snippet answer(response: ExplainResponse)}
	<div class="flex flex-col gap-3 text-sm">
		{#if response.explanation}
			<p class="whitespace-pre-wrap">{response.explanation}</p>
		{/if}
		{#if response.examples?.length}
			<div>
				<div class="mb-1 text-xs font-semibold">Examples</div>
				<ul class="list-disc pl-5">
					{#each response.examples as example}
						<li>{example}</li>
					{/each}
				</ul>
			</div>
		{/if}
		{#if response.ontologyTerms?.length}
			<div>
				<div class="mb-1 text-xs font-semibold">Ontology terms</div>
				<ul class="flex flex-col gap-2">
					{#each response.ontologyTerms as t}
						<li class="rounded-md border border-base-300 p-2">
							{#if t.term}<span>{t.term}</span>{/if}
							{#if t.source}<span class="ml-1 badge badge-outline badge-sm">{t.source}</span>{/if}
							{#if t.uri}
								<div class="text-xs break-all">
									{#if isHttpUrl(t.uri)}
										<a class="link" href={t.uri} target="_blank" rel="noopener noreferrer"
											>{t.uri}</a
										>
									{:else}
										<span class="opacity-60">{t.uri}</span>
									{/if}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/snippet}

<div class="card bg-base-100 p-4 shadow-md">
	<h3 class="mb-2 text-sm font-semibold">Ask a question</h3>
	<textarea
		bind:value={question}
		{onkeydown}
		class="textarea min-h-20 w-full resize-y text-sm"
		placeholder="Ask about ISA, this step or what to enter..."
	></textarea>
	<div class="mt-2 flex items-center gap-2">
		<button class="btn btn-primary btn-sm" onclick={submit} disabled={!canSubmit}>
			{#if loading}
				<span class="loading loading-sm loading-spinner"></span>
				Asking...
			{:else}
				Ask
			{/if}
		</button>
		<span class="text-xs opacity-60">Ctrl+Enter</span>
	</div>

	{#if error}
		<div class="mt-3">
			<ErrorState {error} onretry={() => run(submitted)} />
		</div>
	{/if}

	{#if history.length}
		<div class="mt-3 flex flex-col gap-3">
			<div>
				<div class="mb-1 text-xs font-semibold opacity-70">{history[0].question}</div>
				{@render answer(history[0].response)}
			</div>
			{#if history.length > 1}
				<div class="flex flex-col gap-1">
					{#each history.slice(1) as entry (entry.id)}
						<div class="collapse-arrow collapse border border-base-300">
							<input type="checkbox" aria-label="Show answer" />
							<div class="collapse-title py-2 text-xs font-semibold">{entry.question}</div>
							<div class="collapse-content">{@render answer(entry.response)}</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
