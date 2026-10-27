<script lang="ts">
	let {
		scope,
		proposed,
		current,
		warnings = [],
		onconfirm,
		oncancel
	}: {
		scope: string;
		/** Sub-tree from the convert response, `undefined` when the response has nothing at the scope */
		proposed: unknown;
		/** Sub-tree currently in the store at the same path */
		current: unknown;
		warnings?: string[];
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();

	const MAX_LENGTH = 80;

	type Row = { key: string; kind: 'added' | 'changed' | 'unchanged'; from: string; to: string };

	function isEmpty(value: unknown) {
		if (value == null || value === '') return true;
		if (Array.isArray(value)) return value.length === 0;
		return typeof value === 'object' && Object.keys(value).length === 0;
	}

	function equal(a: unknown, b: unknown): boolean {
		if (a === b) return true;
		if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
		if (Array.isArray(a) !== Array.isArray(b)) return false;
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		return [...keys].every((k) =>
			equal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
		);
	}

	function show(value: unknown): string {
		if (isEmpty(value)) return '(empty)';
		let text = typeof value === 'string' ? value : JSON.stringify(value);
		if (Array.isArray(value)) text = `${value.length} item${value.length === 1 ? '' : 's'}`;
		return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text;
	}

	function entries(value: unknown): Record<string, unknown> {
		return value != null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
	}

	// One row per top-level key (or array index). A key the response dropped counts as changed,
	// because applying replaces the whole sub-tree.
	const rows: Row[] = $derived.by(() => {
		if (proposed === undefined) return [];
		if (typeof proposed !== 'object' || proposed === null) {
			const kind = equal(current, proposed) ? 'unchanged' : isEmpty(current) ? 'added' : 'changed';
			return [{ key: scope || 'value', kind, from: show(current), to: show(proposed) }];
		}
		const before = entries(current);
		const after = entries(proposed);
		return [...new Set([...Object.keys(before), ...Object.keys(after)])].map((key) => {
			const kind = equal(before[key], after[key])
				? 'unchanged'
				: isEmpty(before[key])
					? 'added'
					: 'changed';
			return { key, kind, from: show(before[key]), to: show(after[key]) };
		});
	});

	const added = $derived(rows.filter((r) => r.kind === 'added'));
	const changed = $derived(rows.filter((r) => r.kind === 'changed'));
	const unchanged = $derived(rows.filter((r) => r.kind === 'unchanged'));
	const hasChanges = $derived(added.length + changed.length > 0);
</script>

{#snippet list(items: Row[])}
	<ul class="flex flex-col gap-1">
		{#each items as row (row.key)}
			<li class="rounded-md border border-base-300 p-2 text-sm">
				<div class="font-mono text-xs font-semibold">{row.key}</div>
				<div class="break-words">
					{#if row.kind === 'changed'}
						<span class="line-through opacity-60">{row.from}</span>
						→
					{/if}
					<span>{row.to}</span>
				</div>
			</li>
		{/each}
	</ul>
{/snippet}

<div class="flex flex-col gap-3">
	<div class="text-xs">
		Proposed changes at <span class="font-mono font-semibold">{scope || 'investigation'}</span>
	</div>

	{#if proposed === undefined}
		<div role="alert" class="alert alert-soft text-sm alert-info">
			Nothing was found at this path. Try other files, or a prompt that names what to extract.
		</div>
	{:else if !hasChanges}
		<div role="alert" class="alert alert-soft text-sm alert-info">
			The converted data matches what is already entered here.
		</div>
	{:else}
		{#if changed.length}
			<div role="alert" class="alert alert-soft text-sm alert-warning">
				Confirming replaces the existing values below.
			</div>
		{/if}
		{#if added.length}
			<div>
				<div class="mb-1 flex items-center gap-2 text-xs font-semibold">
					Added <span class="badge badge-sm badge-success">{added.length}</span>
				</div>
				{@render list(added)}
			</div>
		{/if}
		{#if changed.length}
			<div>
				<div class="mb-1 flex items-center gap-2 text-xs font-semibold">
					Changed <span class="badge badge-sm badge-warning">{changed.length}</span>
				</div>
				{@render list(changed)}
			</div>
		{/if}
	{/if}

	{#if proposed !== undefined && unchanged.length}
		<div class="text-xs opacity-70">
			Unchanged: {unchanged.length}
			({unchanged.map((r) => r.key).join(', ')})
		</div>
	{/if}

	{#if warnings.length}
		<div>
			<div class="mb-1 flex items-center gap-2 text-xs font-semibold">
				Needs manual input <span class="badge badge-sm badge-warning">{warnings.length}</span>
			</div>
			<ul class="flex flex-col gap-1">
				{#each warnings as path}
					<li class="font-mono text-xs break-all opacity-80">{path}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="flex gap-2">
		{#if proposed !== undefined && hasChanges}
			<button class="btn btn-primary btn-sm" onclick={onconfirm}>Apply</button>
			<button class="btn btn-sm" onclick={oncancel}>Cancel</button>
		{:else}
			<button class="btn btn-sm" onclick={oncancel}>Close</button>
		{/if}
	</div>
</div>
