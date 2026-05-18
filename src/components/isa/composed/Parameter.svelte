<script lang="ts">
	import OntologyAnnotation from '../singleton/OntologyAnnotation.svelte';

	let {
		label = 'Protocol Parameter',
		attr,
		explanation = '',
		value: parameter = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	const displayLabel = $derived(label || attr);
	let editMode = $state(false);
</script>

<div
	class="rounded-lg border bg-base-200 p-4"
	style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
>
	<OntologyAnnotation
		label="Parameter Name"
		attr="parameterName"
		explanation="The name of the parameter, e.g. 'temperature', 'duration', etc."
		bind:value={parameter.parameterName}
		showLabel={true}
		{onRemove}
	/>
</div>
