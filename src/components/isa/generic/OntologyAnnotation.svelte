<script>
    import { config } from '@/stores/config';

    export let label = '';
    export let isaLevel = null;
    export let attr;
    export let value;
    export let showLabel = true;
    export let focus = false;

    if (!label) {
        label = attr;
    }

    import Svelecte from 'svelecte';
    import { createEventDispatcher, getContext } from 'svelte';

    if (!isaLevel) {
        isaLevel = getContext('isaLevel');
    }
    
    async function handleFetch(query) {
        let params = new URLSearchParams({
            q: query,
            rows: "20",
            lang: 'en',
            schema: 'collection',
            classification: 'DataPLANT'
        });
        // const response = await fetch('https://swate-alpha.nfdi4plants.org/api/IOntologyAPIv3/searchTerm', {
        const response = await fetch(`${config.general.terminologyService}/select?`+params.toString() , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify([{
            //     query: query,
            //     ontology: null,
            //     limit: 10,
            //     searchMode: null,
            //     parentTermId: null                
            // }])
        });
        const data = await response.json();
        let terms = data.response.docs.map(option => {
            return {
                value: option.obo_id,
                label: option.label,
                ontology: option.ontology_prefix
            }
        });
        return Array.from(new Map(terms.map(term => [term.value, term])).values());
    }
    let selection;

    const dispatch = createEventDispatcher();

    function onChange() {
        value.annotationValue = selection.label;
        value.termSource = selection.ontology;
        value.termAccession = selection.value;
        dispatch('change');
    }

    function ontoRenderer(item, _isSelection, _inputValue) {
        return _isSelection
            ? `${item.label} (${item.value})`
            : `<div style="display: flex; justify-content: space-between;"><span>${item.label}</span><span>${item.value}</span></div>`;
    }

    function removeAnnotation() {
        value = {
            annotationValue: null,
            termSource: null,
            termAccession: null
        };
    }

    function createHandler(elem) {
        console.log(elem);
        return {
            value: '',
            label: elem,
            ontology: '',
            $created: true
        }
    }

</script>

<section style="border: 0px solid black;">

    <div class="attr pure-g v-center">
        <div class="pure-u-5-24">
            {#if showLabel}
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>{label}</label>
            {/if}
        </div>
        <div class="pure-u-19-24" class:wide={!showLabel} >
            {#if value.annotationValue}
            <div class="flex-row">
                <p>{value.annotationValue} ({value.termAccession})</p>
                <button class="btn btn-warning" on:click={removeAnnotation}>X</button>
            </div>
            {:else}
            <Svelecte creatable createTransform={createHandler} renderer={ontoRenderer} style="width: 100%;" fetch={handleFetch} bind:readSelection={selection} on:change={onChange} />
            {/if}
        </div>
    </div>

</section>


<style>
    .wide {
        width: 100%;
    }

    .flex-row {
        display: flex;
        justify-content: space-between;
        height: 2em;
        align-items: center;
    }
</style>