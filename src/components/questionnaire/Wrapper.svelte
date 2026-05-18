<script lang="ts">
	import { getAppstate } from '../../lib/appstate.svelte';
	import { componentTypes, fieldTypes } from '../../lib/config/mapping';
	import { isaObj } from '../../stores/isa';

	let { label = '', attr, attr2 = undefined, explanation = '', showLabel = true, type } = $props();

	let value = $derived.by(() =>
		attr2 != null
			? isaObj.keyedComments(getAppstate().isaLvl + attr, attr2)
			: isaObj.keyed(getAppstate().isaLvl + attr)
	);
</script>

{#if type}
	{@const Component =
		fieldTypes[type as keyof typeof fieldTypes] ??
		componentTypes[type as keyof typeof componentTypes]}
	{#if Component}
		<Component {label} {attr} {explanation} {showLabel} bind:value={$value} />
	{/if}
{/if}
