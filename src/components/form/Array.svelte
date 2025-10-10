<script>
    import Schemas from "@/lib/schemas";
    import Entity from "./Entity.svelte";

    export let type;
    export let value;
    export let attr = "";

    function addEntity() {
        if (type) {
            let emptyEntity = Schemas.getObjectFromSchema(
                type.split("_schema.json#")[0],
            );
            value = [...value, emptyEntity];
        }
    }
    export let showLabel = true;
</script>

<section style="border: 0px solid black;">
    <div class="attr pure-g v-center">
        <div class="pure-u-5-24" style="align-self: flex-start;">
            {#if showLabel}
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>
                {attr.charAt(0).toUpperCase() + attr.slice(1).replace(/_/g, " ")}
            </label>
            {/if}
        </div>
        <div class="pure-u-19-24 border">
            <div>
                {#each value as entity, idx}
                    <Entity
                        bind:value={entity}
                        type={type}
                        attr={attr}
                        idx={idx}
                    />
                {/each}
            </div>
            <div>
                <button class="btn btn-primary" on:click={addEntity}>
                    Add {type?type.split("_schema.json#")[0].replace(/_/g, " "):'entity'}
                </button>
            </div>
        </div>
    </div>
</section>

<style>
    .border {
        border: 1px solid rgb(150, 150, 150);
        padding: 10px;
        margin-top: 10px;
    }
</style>
