<script lang="ts">
	import Schema from '$lib/schemas';
	import { dataFromFile } from '$lib/util/dataFileMeta';
	import Data from '$components/isa/composed/Data.svelte';

	let {
		label = 'Data Files',
		attr,
		explanation = '',
		value: files = $bindable(),
		showLabel = true,
		lockedCount = 0
	} = $props();

	const displayLabel = $derived(label || attr);

	function addDataFile() {
		let emptyData = Schema.getObjectFromSchema('data');
		files = [...(files || []), emptyData];
	}

	let fileInput: HTMLInputElement | undefined = $state();
	let folderInput: HTMLInputElement | undefined = $state();
	let skippedCount = $state(0);

	function importPicked(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const picked = Array.from(input.files ?? []);
		const existing = files || [];
		const seen = new Set(existing.map((f: { name: string }) => f.name));
		const added = [];
		for (const file of picked) {
			const data = dataFromFile(file);
			if (seen.has(data.name)) continue;
			seen.add(data.name);
			added.push(data);
		}
		skippedCount = picked.length - added.length;
		files = [...existing, ...added];
		input.value = ''; // allow re-picking the same selection
	}

	function removeDataFile(index: number) {
		files = files?.filter((_: unknown, i: number) => i !== index);
	}
</script>

<section>
	<fieldset class="fieldset space-y-4">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}

		{#if explanation}
			<p class="label">{explanation}</p>
		{/if}

		<div class="space-y-4">
			{#if files && files.length > 0}
				{#each files as _, i (i)}
					<Data
						label="Data"
						attr=""
						bind:value={files[i]}
						onRemove={i < lockedCount ? undefined : () => removeDataFile(i)}
					/>
				{/each}
			{:else}
				<p class="label text-neutral/75 italic">No files added yet</p>
			{/if}
		</div>

		<input bind:this={fileInput} type="file" multiple class="hidden" onchange={importPicked} />
		<input
			bind:this={folderInput}
			type="file"
			webkitdirectory
			class="hidden"
			onchange={importPicked}
		/>
		<div class="flex flex-wrap gap-2">
			<button type="button" class="btn btn-accent btn-sm" onclick={addDataFile}>
				+ Add Data File
			</button>
			<button type="button" class="btn btn-sm" onclick={() => fileInput?.click()}>
				Select Files…
			</button>
			<button type="button" class="btn btn-sm" onclick={() => folderInput?.click()}>
				Select Folder…
			</button>
		</div>
		{#if skippedCount > 0}
			<p class="label text-warning">{skippedCount} file(s) skipped (already listed).</p>
		{/if}
	</fieldset>
</section>
