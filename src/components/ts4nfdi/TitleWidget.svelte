<script lang="ts">
	import { onMount } from 'svelte';

	let { api, iri, ontologyId = undefined, parameter = 'collection=DataPLANT' } = $props();

	let container: HTMLDivElement;
	let visible = $state(false);

	onMount(() => {
		// Only set visible to true when the element is actually in view
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				visible = true;
				observer.disconnect();
			}
		});

		if (container) {
			observer.observe(container);
		}

		return () => observer.disconnect();
	});

	$effect(() => {
		// Initialize the widget once the container becomes visible
		if (visible && container) {
			//@ts-ignore
			window['ts4nfdiWidgets']?.createTitle(
				{
					api: api,
					iri: iri,
					ontologyId: ontologyId,
					parameter: parameter
				},
				container
			);
		}
	});
</script>

<div bind:this={container} class="min-h-6">
	{#if !visible}
		<span class="text-xs text-gray-400">...</span>
	{/if}
</div>
