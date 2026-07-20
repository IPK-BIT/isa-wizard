<script lang="ts">
	import ParameterValue from '../composed/ParameterValue.svelte';

	let {
		label = 'Parameter Values',
		attr,
		explanation = '',
		value: values = $bindable(),
		showLabel = true
	} = $props();
</script>

{#each values as _, i (i)}
	<ParameterValue
		label="Parameter Value"
		attr
		explanation=""
		bind:value={values[i]}
		showLabel={true}
	/>
{/each}
