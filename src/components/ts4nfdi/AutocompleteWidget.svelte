<script lang="ts">
    import { onMount } from "svelte";

    let {
        api,
        query = '*',
        selectionChangedEvent = (selectedOptions: {label: String, iri: String, ontology_name: String, type: string})=>{console.log(selectedOptions)},
        parameter = 'collection=DataPLANT',
        className = undefined,
        value = ''
    } = $props();

onMount(()=>{
    //@ts-ignore
    window['ts4nfdiWidgets'].createAutocomplete(
        {
            api: api,
            parameter: parameter,
            selectionChangedEvent: selectionChangedEvent,
            preselected: [],
            placeholder: "Type to search...",
            hasShortSelectedLabel: true,
            allowCustomTerms: false,
            singleSelection: false,
            ts4nfdiGateway: false,
            singleSuggestionRow: false,
            showApiSource: true,
            className: className,
            initialSearchQuery: "undefined"
        },
        document.querySelector('#autocomplete_widget_container_24')
    )
});
</script>

<div id="autocomplete_widget_container_24"></div>