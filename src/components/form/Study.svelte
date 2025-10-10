<script>
    import study_schema from "@/lib/schemas/study_schema.json";
    import String from "../isa/generic/String.svelte";
    import Publications from "../isa/generic/Publications.svelte";
    import People from "../isa/generic/People.svelte";
    import OntologyAnnotations from "../isa/generic/OntologyAnnotations.svelte";
    let study;
    export { study as value };

    export let idx;

</script>

<section>
    {#each Object.keys(new Object(study_schema).properties) as key}
        {#if new Object(study_schema).properties[key].type === "string"}
            <String
                bind:value={study[key]}
                label={new Object(study_schema).properties[key].title || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                attr={key}
            />
        {:else if new Object(study_schema).properties[key].type === "array"}
        <pre>
            {key}: {JSON.stringify(Object(study_schema).properties[key], null, 2)}
        </pre>
        {#if new Object(study_schema).properties[key].items["$ref"] === "publication_schema.json#"}
            <Publications
                bind:value={study[key]}
                attr={key}
            />
        {:else if new Object(study_schema).properties[key].items["$ref"] === "person_schema.json#"}
            <People
                bind:value={study[key]}
                attr={key}
            />
        {:else if new Object(study_schema).properties[key].items["$ref"] === "ontology_annotation_schema.json#"}
            <OntologyAnnotations
                bind:value={study[key]}
                attr={key}
            />
        {/if}
        {/if}
    {/each}
</section>

<style>
    section {
        margin: 1em;
        padding: 1em;
        border: 1px solid rgb(150,150,150);
    }
</style>