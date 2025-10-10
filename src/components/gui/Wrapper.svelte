<script>
export let component;
export let jsonPath;
export let componentConfig = {};

import { isaObj } from '@/stores/isa';

let value;

function updateComponent(jPath) {
    value = isaObj.keyed(jPath);
}

$: updateComponent(jsonPath);

</script>

<svelte:component 
    this={component} 
    bind:value={$value}
    jsonPath={jsonPath}
    {componentConfig}
/>

<style>

</style>