<script lang="ts">
	import { onMount } from 'svelte';

	let {
		api,
		query = '*',
		selectionChangedEvent = (selectedOptions: {
			label: String;
			iri: String;
			ontology_name: String;
			type: string;
		}) => {
			console.log(selectedOptions);
		},
		parameter = 'collection=DataPLANT',
		className = undefined,
		value = '',
		singleSelection = false
	} = $props();

	let container: HTMLDivElement;

	onMount(() => {
		//@ts-ignore
		window['ts4nfdiWidgets'].createAutocomplete(
			{
				api: api,
				parameter: parameter,
				selectionChangedEvent: selectionChangedEvent,
				preselected: [],
				placeholder: 'Type to search...',
				hasShortSelectedLabel: true,
				allowCustomTerms: true,
				singleSelection: singleSelection,
				ts4nfdiGateway: false,
				singleSuggestionRow: false,
				showApiSource: true,
				className: className,
				initialSearchQuery: 'undefined'
			},
			container
		);
	});
</script>

<div bind:this={container} class={className}></div>
