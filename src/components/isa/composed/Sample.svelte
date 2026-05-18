<script lang="ts">
	import Characteristics from "../collection/Characteristics.svelte";
	import String from "../singleton/String.svelte";

    	let {
		label = 'Sample',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onRemove
	} = $props();
</script>

<div class="border rounded-lg p-4 bg-base-200"
			style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
>

	<div class="flex justify-end gap-2">
		<button class="btn btn-sm btn-error" onclick={onRemove}>Remove</button>
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