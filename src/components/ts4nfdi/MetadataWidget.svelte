<script lang="ts">
	import { onMount } from 'svelte';

	let { api, iri, ontologyId = undefined, parameter = 'collection=DataPLANT' } = $props();

	let container: HTMLDivElement;

	onMount(() => {
		//@ts-ignore
		window['ts4nfdiWidgets'].createMetadata(
			{
				api: api,
				iri: iri,
				ontologyId: ontologyId,
				parameter: parameter,
				useLegacy: true
			},
			container
		);
	});
</script>

<div bind:this={container}></div>
