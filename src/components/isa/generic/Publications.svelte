<script lang="ts">
let publications: Array<Object>;
export { publications as value };
export let attr = '';
export let jsonPath = null;

import get from 'lodash/get';
import set from 'lodash/set';

import { onMount } from 'svelte';

import { isaObj } from '@/stores/isa';



import { setContext } from 'svelte';
setContext('isaLevel', 'publication');

import wording from '@/lib/wording';

import Schemas from '@/lib/schemas.js';
import Publication from '@/components/isa/generic/Publication.svelte';

const addPublication = async () => {
    let emptyPublication = await Schemas.getObjectFromSchema('publication');
    publications = [...publications, emptyPublication];
}

function onRemovePublication(event) {
    publications.splice(event.detail.index, 1);
    publications = [...publications];
}

</script>

<section>

    <div class="attr">
        <h3>Publications</h3>

        {#if publications.length > 0}
        {#each publications as publication, index}
        <Publication on:removePublication={onRemovePublication} on:change bind:publication {index} />
        {/each}
        {:else}
        <p><i>No publications have yet been created.</i></p>
        {/if}

        <button class="btn" on:click|preventDefault={() => addPublication()}>Add Publication</button>
    </div>

</section>


<style>
section {
    /*background: rgba(0,0,0,0.05);*/
    margin-bottom: 10px;
}
button {
    margin: 0 0 10px 0;
}
h3 {
    margin: 0 0 10px 0;
    font-weight: 500;
}
</style>