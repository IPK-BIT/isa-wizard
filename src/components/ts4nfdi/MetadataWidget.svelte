<script lang="ts">
	import { onMount } from 'svelte';

	let { api, iri, ontologyId = undefined, parameter = 'collection=DataPLANT' } = $props();

	let id = `metadata_widget_container_${Math.floor(Math.random() * 10000)}`;

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
			document.querySelector(`#${id}`)
		);
	});
</script>

<div {id}></div>
