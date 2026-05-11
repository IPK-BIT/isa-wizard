<script lang="ts">
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
			emptyOA.annotationValue = selectedOptions[0].label;
			emptyOA.termAccession = selectedOptions[0].iri;
			emptyOA.termSource = selectedOptions[0].ontology_name;
			value = emptyOA;
		}
	}

	let {
		label = '',
		attr,
		explanation = '',
		parameter = "collection=DataPLANT",
		value = $bindable(),
		singleSelection = true,
		showLabel = true
	} = $props();

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
					<TitleWidget
						api="https://terminology.services.base4nfdi.de/api-gateway/ols4/api/"
						iri={value.termAccession}
						ontologyId={value.termSource}
					/>
					<BreadcrumbWidget
						api="https://terminology.services.base4nfdi.de/api-gateway/ols4/api/"
						iri={value.termAccession}
						ontologyId={value.termSource}
					/>
				</div>
				<button class="btn btn-outline btn-sm btn-error" onclick={() => (value = {})}>
					Clear
				</button>
			</div>
		{:else}
			<AutoCompleteWidget
				api="https://terminology.services.base4nfdi.de/api-gateway/ols4/api/"
				parameter={parameter}
				{selectionChangedEvent}
				{singleSelection}
			/>
		{/if}
		<p class="label">{explanation}</p>
	</fieldset>
</section>
