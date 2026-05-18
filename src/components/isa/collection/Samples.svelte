<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Sample from '../composed/Sample.svelte';

	let {
		label = 'Samples',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addSample() {
		const newSample = Schema.getObjectFromSchema('sample');
		value = [...(value || []), newSample];
	}

	function removeSample(index: number) {
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
				{#each value as _, index (index)}
					<Sample
						label={`Sample ${index + 1}`}
						attr={`sample[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeSample(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No samples added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addSample}>
			+ Add Sample
		</button>
	</fieldset>
</section>
