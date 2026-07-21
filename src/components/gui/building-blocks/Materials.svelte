<script lang="ts">
	import MaterialTable from './MaterialTable.svelte';

	let { materials, config } = $props();
</script>

<div>
	<h2 class="font-semibold">Sources</h2>
	{#if materials.sources && materials.sources.length > 0}
		<MaterialTable collection={materials.sources} {config} label="Source" />
	{:else}
		<span class="text-neutral italic">No Sources available</span>
	{/if}
</div>
<div>
	<h2 class="font-semibold">Samples</h2>
	{#if materials.samples && materials.samples.length > 0}
		<MaterialTable collection={materials.samples} {config} label="Sample" />
	{:else}
		<span class="text-neutral italic">No Samples available</span>
	{/if}
</div>
<div>
	<h2 class="font-semibold">Other Materials</h2>
	{#if materials.otherMaterials && materials.otherMaterials.length > 0}
		<MaterialTable collection={materials.otherMaterials} {config} label="Material" />
	{:else}
		<span class="text-sm text-neutral italic">No Materials available</span>
	{/if}
</div>
