<script lang="ts">
	import { getConfig } from '../../../lib/config.svelte';
	import Schema from '../../../lib/schemas';
	import AutoCompleteWidget from '../../ts4nfdi/AutoCompleteWidget.svelte';
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import MetadataWidget from '../../ts4nfdi/MetadataWidget.svelte';
	import TitleWidget from '../../ts4nfdi/TitleWidget.svelte';

	function selectionChangedEvent(
		selectedOptions: { label: string; iri?: string; ontology_name?: string; type?: string }[]
	) {
		if (selectedOptions.length === 0) {
			value = {};
			return;
		}
		if (singleSelection) {
			let emptyOA = Schema.getObjectFromSchema('ontology_annotation');
			emptyOA!.annotationValue = selectedOptions[0].label;
			emptyOA!.termAccession = selectedOptions[0].iri;
			emptyOA!.termSource = selectedOptions[0].ontology_name;
			value = emptyOA;
		}
	}

	let {
		label = '',
		attr,
		explanation = '',
		parameter = 'collection=DataPLANT',
		value = $bindable(),
		singleSelection = true,
		showLabel = true,
		onRemove = undefined
	} = $props();

	const config: { 'lookup-services': { ts: { api: string } } } = getConfig() as {
		'lookup-services': { ts: { api: string } };
	};
	const displayLabel = $derived(label || attr);
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		{#if value && value.annotationValue}
			<div
				class="flex w-full items-center justify-between rounded-xl border bg-base-100 p-2"
				style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
			>
				<div>
					<span class="text-lg font-semibold">{value.annotationValue}</span>
					<BreadcrumbWidget
						api={config['lookup-services'].ts.api}
						iri={value.termAccession}
						ontologyId={value.termSource}
					/>
				</div>
				<div>
					<button
						class="btn btn-outline btn-sm btn-warning"
						onclick={() => (value.annotationValue = '')}
					>
						Clear
					</button>
					{#if onRemove}
						<button class="btn btn-outline btn-error btn-sm" onclick={onRemove}> Remove </button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="flex w-full items-center justify-between space-x-2">
				<div class="w-full">
					<AutoCompleteWidget
						className="z-10"
						api={config['lookup-services'].ts.api}
						{parameter}
						{selectionChangedEvent}
						{singleSelection}
					/>
				</div>
				{#if onRemove}
					<button class="btn mt-2 btn-outline btn-error btn-sm" onclick={onRemove}> Remove </button>
				{/if}
			</div>
		{/if}
		<p class="label">{explanation}</p>
	</fieldset>
</section>
