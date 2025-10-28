<script>
  export let component;
  export let jsonPath = undefined;
  export let componentConfig = {};

  import { isaObj } from "@/stores/isa";

  let value;

  if (jsonPath && isaObj.keyed) {
    value = isaObj.keyed(jsonPath);
  }
</script>

<svelte:component this={component} bind:value={$value} {jsonPath} {componentConfig} />
