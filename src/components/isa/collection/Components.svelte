<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Component from '../composed/Component.svelte';

	let {
		label = 'Protocol Components',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addComponent() {
		const newComponent = Schema.getObjectFromSchema('protocol_component');
		value = [...(value || []), newComponent];
	}

	function removeComponent(index: number) {
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
					<Component
						label={`Component ${index + 1}`}
						attr={`component[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeComponent(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No components added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-accent btn-sm" onclick={addComponent}>
			+ Add Component
		</button>
	</fieldset>
</section>
