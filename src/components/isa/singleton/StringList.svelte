<script lang="ts">
	let {
		label = '',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onChange = undefined
	} = $props();

	const SEPARATOR = ';';

	const displayLabel = $derived(label || attr);

	function parse(v: unknown): string[] {
		if (typeof v !== 'string') return [];
		return v
			.split(SEPARATOR)
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	}

	const items = $derived(parse(value));

	let newItem = $state('');

	function commit(next: string[]) {
		value = next.join(SEPARATOR);
		if (typeof onChange === 'function') onChange(value);
	}

	// Input may contain separators (e.g. pasted "a;b;c") -> split into several entries.
	function add() {
		const parts = parse(newItem);
		if (parts.length === 0) return;
		commit([...items, ...parts]);
		newItem = '';
	}

	// Edit (Update). Emptying an entry removes it; separators split it into several entries.
	function update(index: number, text: string) {
		const parts = parse(text);
		const next = [...items];
		next.splice(index, 1, ...parts);
		commit(next);
	}

	function remove(index: number) {
		commit(items.filter((_, i) => i !== index));
	}

	// Reorder: swap an entry with its neighbour (delta -1 = up, +1 = down).
	function move(index: number, delta: -1 | 1) {
		const target = index + delta;
		if (target < 0 || target >= items.length) return;
		const next = [...items];
		[next[index], next[target]] = [next[target], next[index]];
		commit(next);
	}

	function handleAddKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			add();
		}
	}

	function handleItemKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}

		{#if items.length > 0}
			<ul
				class="flex flex-col gap-2 rounded-xl border bg-base-100 p-2"
				style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
			>
				{#each items as item, i (i + ':' + item)}
					<li class="flex w-full items-center justify-between gap-2">
						<input
							type="text"
							class="input w-full"
							value={item}
							aria-label={`${displayLabel} ${i + 1}`}
							onchange={(e) => update(i, e.currentTarget.value)}
							onkeydown={handleItemKeydown}
						/>
						<div class="flex shrink-0 items-center gap-1">
							<button
								type="button"
								class="btn btn-outline btn-sm"
								aria-label={`Move ${item} up`}
								disabled={i === 0}
								onclick={() => move(i, -1)}
							>
								↑
							</button>
							<button
								type="button"
								class="btn btn-outline btn-sm"
								aria-label={`Move ${item} down`}
								disabled={i === items.length - 1}
								onclick={() => move(i, 1)}
							>
								↓
							</button>
							<button
								type="button"
								class="btn btn-outline btn-error btn-sm"
								onclick={() => remove(i)}
							>
								Remove
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="flex w-full items-center justify-between space-x-2">
			<input
				type="text"
				class="input w-full"
				placeholder="Add entry…"
				bind:value={newItem}
				onkeydown={handleAddKeydown}
			/>
			<button
				type="button"
				class="btn btn-outline btn-primary btn-sm"
				disabled={newItem.trim() === ''}
				onclick={add}
			>
				Add
			</button>
		</div>
		<p class="label">{explanation}</p>
	</fieldset>
</section>
