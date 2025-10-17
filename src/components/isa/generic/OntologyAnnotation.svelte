<script module>
    export interface OntologySchema {
        "@id": string;
        annotationValue: string;
        termSource: string;
        termAccession: string;
        comments: any[];
    }
</script>

<script lang="ts">
    import Schema from "@/lib/schemas";
    import OntologySvelect, { type OntologyResult } from "./OntologySvelect.svelte";

    let { label = "", value = $bindable() } = $props();

    let searchResult: OntologyResult | null = $state(null);
    // Check if ISA Value is empty Object or already filled with values (sync ISA -> Formular)
    let ontologySchema: OntologySchema | null = $derived(Object.keys(value).length === 0 ? null : (value as OntologySchema));

    /**
     * Convert Ontology Search Result into OntologySchema object and add it to the ISA String
     * @param searchResult - selected value from Ontology Svelecte Component
     */
    function addOntology(searchResult: OntologyResult): OntologySchema {
        const ontologySchema = Schema.getObjectFromSchema("ontology_annotation");
        ontologySchema.annotationValue = searchResult.label;
        ontologySchema.termSource = searchResult.ontology_name;
        ontologySchema.termAccession = searchResult.short_form;

        value = ontologySchema;
        return value;
    }
</script>

<div class="grid padding">
    <div class="padding label">{label}</div>
    <div class="padding">
        {#if ontologySchema}
            <div class="">
                <span>{`${ontologySchema.annotationValue} > ${ontologySchema.termAccession}`}</span>
                <button
                    class="btn btn-warning"
                    onclick={() => {
                        value = {}; // Reset ISA String
                        searchResult = null;
                    }}>Remove</button
                >
            </div>
        {:else}
            <OntologySvelect
                bind:searchResult
                onChangeCallback={() => {
                    if (searchResult) addOntology(searchResult);
                }}
            />
        {/if}
    </div>
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: 20% 80%;
    }

    .padding {
        padding: 8px;
    }

    .label {
        display: flex;
        align-items: center;
    }
</style>
