<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Source from '../composed/Source.svelte';

	let {
		label = 'Sources',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addSource() {
		const newSource = Schema.getObjectFromSchema('source');
		value = [...(value || []), newSource];
	}

	function removeSource(index: number) {
		value = value?.filter((_: unknown, i: number) => i !== index);
	}

	function importSources() {
		// Placeholder for import functionality
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
			{#if value && value.length > 0}
				{#each value as _, index (index)}
					<Source
						label={`Source ${index + 1}`}
						attr={`source[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeSource(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No sources added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addSource}>
			+ Add Source
		</button>
		<button type="button" class="btn btn-sm btn-secondary" onclick={importSources}>
			Import from tabular source file
		</button>
	</fieldset>
</section>
