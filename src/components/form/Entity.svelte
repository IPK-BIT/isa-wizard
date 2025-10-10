<script>
    import Schemas from "@/lib/schemas";
    import String from "../isa/generic/String.svelte";
    import Array from "./Array.svelte";
    import Date from "../isa/generic/Date.svelte";
    import AnyOfArray from "./AnyOfArray.svelte";

    export let type;
    export let value;
    export let attr = "";
    export let showLabel = true;
    export let idx;

    console.log("Entity type:", type, "value:", value);

    let schema = Schemas.getSchema(type.split("_schema.json#")[0]);
</script>

<section>
    {#each Object.keys(new Object(schema).properties) as key}
        {#if new Object(schema).properties[key].type === "string"}
            {#if new Object(schema).properties[key].format === "date-time"}
                <Date
                    bind:value={value[key]}
                    label={new Object(schema).properties[key].title ||
                        key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                    attr={key}
                />
            {:else}
                <String
                    bind:value={value[key]}
                    label={new Object(schema).properties[key].title ||
                        key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                    attr={key}
                />
            {/if}
        {:else if new Object(schema).properties[key].type === "array"}
            {#if new Object(schema).properties[key].items["$ref"]}
                <Array
                    type={new Object(schema).properties[key].items["$ref"]}
                    bind:value={value[key]}
                    attr={key}
                />
            {:else}
                <AnyOfArray
                    type={new Object(schema).properties[key].items.anyOf}
                    bind:value={value[key]}
                    attr={key}
                />
            {/if}
        {:else if new Object(schema).properties[key]["$ref"]}
            <String
                bind:value={value[key]["@id"]}
                label={new Object(schema).properties[key].title ||
                    key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                attr={key}
            />
        {/if}
    {/each}
</section>

<!-- {JSON.stringify(schema, null, 2)} -->

<style>
    section {
        margin: 1em;
        padding: 1em;
        border: 1px solid rgb(150, 150, 150);
    }
</style>
