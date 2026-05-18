<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Material from '../composed/Material.svelte';
	import Sample from '../composed/Sample.svelte';

	let {
		label = 'Materials',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addMaterial() {
		const newMaterial = Schema.getObjectFromSchema('material');
		value = [...(value || []), newMaterial];
	}

	function removeMaterial(index: number) {
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
					<Material
						label={`Material ${index + 1}`}
						attr={`material[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeMaterial(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No materials added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addMaterial}>
			+ Add Material
		</button>
	</fieldset>
</section>
