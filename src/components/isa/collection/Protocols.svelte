<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Protocol from '../composed/Protocol.svelte';

	let {
		label = 'Protocols',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addProtocol() {
		const newProtocol = Schema.getObjectFromSchema('protocol');
		value = [...(value || []), newProtocol];
	}

	function removeProtocol(index: number) {
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
					<Protocol
						label={`Protocol ${index + 1}`}
						attr={`protocol[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removeProtocol(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No protocols added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-accent btn-sm" onclick={addProtocol}>
			+ Add Protocol
		</button>
	</fieldset>
</section>
