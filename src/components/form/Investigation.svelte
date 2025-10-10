<script>
    // @ts-nocheck

    let isa;
    export { isa as value };

    import investigation_schema from "@/lib/schemas/investigation_schema.json";
    import String from "../isa/generic/String.svelte";
    import Date from "../isa/generic/Date.svelte";
    import Publication from "../isa/generic/Publication.svelte";
    import Publications from "../isa/generic/Publications.svelte";
    import People from "../isa/generic/People.svelte";
    import Studies from "./Studies.svelte";
    import Comments from "../isa/generic/Comments.svelte";
    import Array from "./Array.svelte";
</script>

{#if isa}
    <section class="investigation-form">
        <h3>Investigation</h3>
        {#each Object.keys(new Object(investigation_schema).properties) as key}
            {#if new Object(investigation_schema).properties[key].type === "string"}
                {#if new Object(investigation_schema).properties[key].format === "date-time"}
                    <Date
                        bind:value={isa[key]}
                        label={new Object(investigation_schema).properties[key].title || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        attr={key}
                    />
                {:else}
                    <String
                        bind:value={isa[key]}
                        label={new Object(investigation_schema).properties[key].title || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        attr={key}
                    />
                {/if}
            {:else if new Object(investigation_schema).properties[key].type === "array"}
                <Array
                    type={Object(investigation_schema).properties[key].items["$ref"]}
                    bind:value={isa[key]}
                    attr={key}
                />
            {/if}
        {/each}
    </section>
{/if}

<!-- <pre>
    {JSON.stringify(new Object(investigation_schema), null, 2)}
</pre> -->

<style>
    section.investigation-form {
        display: flex;
        flex-direction: column;
    }
</style>
