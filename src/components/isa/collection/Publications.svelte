<script lang="ts">
	import Publication from '../composed/Publication.svelte';
	import Schema from '../../../lib/schemas';

	let {
		label = 'Publications',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addPublication() {
		const newPublication = Schema.getObjectFromSchema('publication');
		value = [...(value || []), newPublication];
	}

	function removePublication(index: number) {
		value = value?.filter((_: unknown, i: number) => i !== index);
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
				{#each value as pub, index (index)}
					<Publication
						label={`Publication ${index + 1}`}
						attr={`publication[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removePublication(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No publications added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addPublication}>
			+ Add Publication
		</button>
	</fieldset>
</section>
