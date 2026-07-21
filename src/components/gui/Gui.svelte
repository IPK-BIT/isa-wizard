<script lang="ts">
	import { getAppstate } from '../../lib/appstate.svelte';
	import { isaObj } from '../../stores/isa';
	import Exports from './Exports.svelte';
	import Assay from './top-level/Assay.svelte';
	import Investigation from './top-level/Investigation.svelte';
	import Study from './top-level/Study.svelte';

	let { config } = $props();

	const mapping = {
		investigation: Investigation,
		study: Study,
		assay: Assay
	};

	const value = $derived(getAppstate().isaLvl ? isaObj.keyed(getAppstate().isaLvl) : undefined);
</script>

<Exports />

{#key getAppstate().isaLvl}
	<div class="card bg-base-100 shadow-xl">
		<div class="card-body">
			{#if config}
				{@const Component = mapping[getAppstate().guiType as keyof typeof mapping]}
				{#if Component}
					<Component bind:value={$value} {config} />
				{/if}
			{/if}
		</div>
	</div>
{/key}
