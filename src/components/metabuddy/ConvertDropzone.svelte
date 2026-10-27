<script lang="ts">
	import { get } from 'svelte/store';
	import { getConfig } from '$lib/config.svelte';
	import { isaObj } from '$stores/isa';
	import { convert, MetabuddyError } from '$lib/metabuddy/client';
	import { scopedReview, setReview } from '$lib/metabuddy/review.svelte';
	import { applyScoped, buildScope, extractScoped } from '$lib/metabuddy/scope';
	import type { WizardConfig } from '$lib/types/Config';
	import ConvertPreview from './ConvertPreview.svelte';
	import ErrorState from './ErrorState.svelte';

	let { jsonPath = undefined, label = '' }: { jsonPath?: string; label?: string } = $props();

	const EXTENSIONS = ['csv', 'txt', 'pdf', 'xlsx', 'docx'];
	const DEFAULT_MAX_FILE_SIZE_MB = 10;
	const PROMPT_MAX_LENGTH = 2000;

	interface Pending {
		scope: string;
		proposed: unknown;
		warnings: string[];
		confidence: Record<string, number>;
	}

	let files: File[] = $state([]);
	let prompt = $state('');
	let dragging = $state(false);
	let rejected: string[] = $state([]);
	let loading = $state(false);
	let error: MetabuddyError | null = $state(null);
	// Raw, because it holds the response and is only read
	let pending = $state.raw<Pending | null>(null);
	let applied: string | null = $state(null);
	let picker: HTMLInputElement | undefined = $state();

	const maxFileSizeMb = $derived(
		(getConfig() as WizardConfig).integrations?.metabuddy?.maxFileSizeMb ?? DEFAULT_MAX_FILE_SIZE_MB
	);
	const canConvert = $derived(!loading && files.length > 0);
	// Read live, so the preview shows what the confirm will replace if the user kept editing
	const current = $derived(
		pending ? extractScoped({ isaJson: $isaObj }, pending.scope) : undefined
	);

	function formatSize(bytes: number) {
		return bytes < 1024 * 1024
			? `${Math.max(1, Math.round(bytes / 1024))} KB`
			: `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	function add(list: Iterable<File>) {
		const problems: string[] = [];
		const accepted: File[] = [];
		for (const file of list) {
			const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
			if (!EXTENSIONS.includes(ext)) {
				problems.push(`${file.name}: only ${EXTENSIONS.join(', ')} files are supported.`);
			} else if (file.size === 0) {
				problems.push(`${file.name}: the file is empty.`);
			} else if (file.size > maxFileSizeMb * 1024 * 1024) {
				problems.push(
					`${file.name}: ${formatSize(file.size)} exceeds the limit of ${maxFileSizeMb} MB.`
				);
			} else if (
				[...files, ...accepted].some((f) => f.name === file.name && f.size === file.size)
			) {
				problems.push(`${file.name}: already added.`);
			} else {
				accepted.push(file);
			}
		}
		rejected = problems;
		files = [...files, ...accepted];
		applied = null;
	}

	function onpick(e: Event & { currentTarget: HTMLInputElement }) {
		add(e.currentTarget.files ?? []);
		// Lets the same file be picked again after it was removed
		e.currentTarget.value = '';
	}

	function ondrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (!loading) add(e.dataTransfer?.files ?? []);
	}

	function remove(file: File) {
		files = files.filter((f) => f !== file);
	}

	async function run() {
		if (!canConvert) return;
		loading = true;
		error = null;
		applied = null;
		const scope = buildScope(jsonPath);

		const form = new FormData();
		form.append('scope', scope);
		for (const file of files) form.append('files', file);
		form.append('existingIsa', JSON.stringify(get(isaObj)));
		if (prompt.trim()) form.append('prompt', prompt.trim());

		try {
			const response = await convert(form, 'convert');
			const review = scopedReview(response, scope);
			pending = { scope, proposed: extractScoped(response, scope), ...review };
		} catch (err) {
			// A newer request replaced this one and is still running, so leave loading alone
			if (err instanceof MetabuddyError && err.superseded) return;
			error =
				err instanceof MetabuddyError ? err : new MetabuddyError('network', 'Conversion failed.');
		}
		loading = false;
	}

	function confirm() {
		if (!pending) return;
		const { scope, proposed, ...review } = pending;
		if (!applyScoped(scope, proposed)) {
			error = new MetabuddyError('invalid', `Could not apply the result at ${scope}.`);
			pending = null;
			return;
		}
		setReview(review, scope);
		applied = scope || 'investigation';
		pending = null;
		files = [];
		prompt = '';
	}

	function cancel() {
		pending = null;
	}
</script>

<div class="card border border-base-300 bg-base-100 p-4">
	<h3 class="mb-2 text-sm font-semibold">
		{label ? `Import ${label} from files` : 'Import from files'}
	</h3>

	{#if pending}
		<ConvertPreview
			scope={pending.scope}
			proposed={pending.proposed}
			{current}
			warnings={pending.warnings}
			onconfirm={confirm}
			oncancel={cancel}
		/>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex flex-col items-center gap-2 rounded-md border-2 border-dashed p-4 text-center text-sm {dragging
				? 'border-primary bg-base-200'
				: 'border-base-300'}"
			ondragover={(e) => {
				e.preventDefault();
				dragging = true;
			}}
			ondragleave={() => (dragging = false)}
			{ondrop}
		>
			<span>Drop files here</span>
			<button class="btn btn-sm" onclick={() => picker?.click()} disabled={loading}>
				Choose files
			</button>
			<span class="text-xs opacity-60">
				{EXTENSIONS.join(', ')} · max. {maxFileSizeMb} MB each
			</span>
			<input
				bind:this={picker}
				type="file"
				class="hidden"
				multiple
				accept={EXTENSIONS.map((e) => `.${e}`).join(',')}
				onchange={onpick}
			/>
		</div>

		{#if rejected.length}
			<div role="alert" class="mt-2 alert alert-soft text-xs alert-warning">
				<ul class="flex flex-col gap-1">
					{#each rejected as message}
						<li>{message}</li>
					{/each}
				</ul>
			</div>
		{/if}

		{#if files.length}
			<ul class="mt-2 flex flex-col gap-1">
				{#each files as file (file)}
					<li class="flex items-center gap-2 rounded-md border border-base-300 px-2 py-1 text-sm">
						<span class="min-w-0 flex-1 truncate" title={file.name}>{file.name}</span>
						<span class="text-xs opacity-60">{formatSize(file.size)}</span>
						<button
							class="btn btn-square btn-ghost btn-xs"
							aria-label="Remove {file.name}"
							onclick={() => remove(file)}
							disabled={loading}>✕</button
						>
					</li>
				{/each}
			</ul>
		{/if}

		<textarea
			bind:value={prompt}
			maxlength={PROMPT_MAX_LENGTH}
			class="textarea mt-2 min-h-16 w-full resize-y text-sm"
			placeholder="Optional: what should be extracted?"
		></textarea>

		<div class="mt-2 flex items-center gap-2">
			<button class="btn btn-primary btn-sm" onclick={run} disabled={!canConvert}>
				{#if loading}
					<span class="loading loading-sm loading-spinner"></span>
					Converting...
				{:else}
					Convert
				{/if}
			</button>
		</div>

		{#if applied}
			<div role="alert" class="mt-3 alert alert-soft text-sm alert-success">
				Applied to <span class="font-mono">{applied}</span>.
			</div>
		{/if}
		{#if error}
			<div class="mt-3">
				<ErrorState {error} onretry={run} />
			</div>
		{/if}
	{/if}
</div>
