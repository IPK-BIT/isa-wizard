<script>
export let component;
export let field;
export let jsonPath = undefined;

import { isaObj } from '@/stores/isa';

let value;

if (jsonPath && isaObj.keyed) {
    value = isaObj.keyed(jsonPath);
} 

</script>

<svelte:component 
    this={component} 
    bind:value={$value} 
    showLabel={true} 
    label={field.label} 
    isaLevel={field.isaMapping.entity}
    attr={field.explanation} 
    componentConfig={field.componentConfig}
/>