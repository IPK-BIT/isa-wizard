<script lang="ts">
    import { setContext } from "svelte";
    import Schemas from "@/lib/schemas.js";
    import Publication from "@/components/isa/generic/Publication.svelte";

    setContext("isaLevel", "publication");

    let { value: publications = $bindable() } = $props();

    function addPublication() {
        let emptyPublication = Schemas.getObjectFromSchema("publication");
        publications = [...publications, emptyPublication];
    }

    function removePublication(index: number) {
        publications.splice(index, 1);
        publications = [...publications];
    }
</script>

<section>
    <div class="attr">
        <h3>Publications</h3>

        {#if publications.length > 0}
            {#each publications, index}
                <Publication removePublication={(idx: number) => removePublication(idx)} bind:publication={publications[index]} {index} />
            {/each}
        {:else}
            <p><i>No publications have yet been created.</i></p>
        {/if}

        <button class="btn" onclick={() => addPublication()}>Add Publication</button>
    </div>
</section>

<style>
    section {
        margin-bottom: 10px;
    }
    button {
        margin: 0 0 10px 0;
    }
</style>
