<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Characteristic from '../composed/Characteristic.svelte';

	let {
		label = 'Characteristics',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addCharacteristic() {
		const newCharacteristic = Schema.getObjectFromSchema('material_attribute_value');
		value = [...(value || []), newCharacteristic];
	}

	function removeCharacteristic(index: number) {
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

		<div
			class="space-y-2 rounded-lg border bg-base-100 p-4"
			style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
		>
			{#if value && value.length > 0}
				{#each value as _, index (index)}
					<Characteristic
						label={`Characteristic ${index + 1}`}
						attr={`characteristic[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeCharacteristic(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No characteristics added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addCharacteristic}>
			+ Add Characteristic
		</button>
	</fieldset>
</section>
