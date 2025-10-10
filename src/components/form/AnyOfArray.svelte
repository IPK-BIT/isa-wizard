<script lang="ts">
    import Schemas from "@/lib/schemas";
    import Entity from "./Entity.svelte";

    export let type;
    export let value;
    export let attr = "";
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
            </div>
        </div>
    </div>
</section>