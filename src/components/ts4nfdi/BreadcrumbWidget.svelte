<script lang="ts">
	import { onMount } from 'svelte';

	let { api, iri, ontologyId = undefined, parameter = 'collection=DataPLANT' } = $props();
	let container: HTMLDivElement;
	let visible = $state(false);

	onMount(() => {
		// Only run the heavy script when the element actually hits the viewport
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				visible = true;
				observer.disconnect();
			}
		});

		observer.observe(container);

		return () => observer.disconnect();
	});

	$effect(() => {
		if (visible && container) {
			//@ts-ignore
			window['ts4nfdiWidgets']?.createBreadcrumb({ api, iri, ontologyId, parameter }, container);
		}
	});
</script>

<div bind:this={container} class="min-h-6">
	{#if !visible}
		<span class="text-xs text-gray-400">...</span>
	{/if}
</div>
