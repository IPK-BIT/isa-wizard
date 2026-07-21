<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Parameter from '../composed/Parameter.svelte';

	let {
		label = 'Protocol Parameters',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addParameter() {
		const newParameter = Schema.getObjectFromSchema('protocol_parameter');
		value = [...(value || []), newParameter];
	}

	function removeParameter(index: number) {
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
					<Parameter
						label={`Parameter ${index + 1}`}
						attr={`parameter[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeParameter(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No parameters added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-accent btn-sm" onclick={addParameter}>
			+ Add Parameter
		</button>
	</fieldset>
</section>
