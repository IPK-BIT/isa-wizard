<script lang="ts">
	import Characteristics from '$components/isa/collection/Characteristics.svelte';
	import String from '$components/isa/singleton/String.svelte';

	let {
		label = 'Sample',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onRemove
	} = $props();
</script>

<div
	class="rounded-lg border bg-base-200 p-4"
	style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
>
	<div class="flex justify-end gap-2">
		{#if onRemove}<button class="btn btn-error btn-sm" onclick={onRemove}>Remove</button>{/if}
	</div>

	<String
		label="Sample Name"
		attr="name"
		explanation="The name of the sample."
		bind:value={value.name}
		showLabel={true}
	/>

	<Characteristics
		label="Characteristics"
		attr="characteristics"
		explanation="The characteristics of the sample, e.g. temperature, duration, etc."
		bind:value={value.characteristics}
		showLabel={true}
	/>
</div>
