<script lang="ts">
  import Schemas from "@/lib/schemas";
  import ProtocolComponent from "./ProtocolComponent.svelte";

  let { value: components = $bindable(), label = true } = $props();

  function addComponent() {
    let component = Schemas.getObjectFromSchema("protocol_component");
    components = [...components, component];
  }

  function removeComponent(index: number) {
    components = components.filter((_: any, i: number) => i !== index);
  }
</script>

<section class="container">
  {#if label}
    <p>Protocol Components</p>
  {/if}
  <div>
  <button class="btn btn-secondary" onclick={addComponent}>Add Component</button>
  {#each components as component, i}     
    <ProtocolComponent bind:value={components[i]} index={i} remove={(index: number) => removeComponent(index)} />
  {/each}
  </div>
</section>


<style>
  .container {
    display: grid;
    grid-template-columns: 20% 80%;
    padding: 8px;
    
  }

  .container p,
  div {
    padding: 8px;
  }

  .container div {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
  }

  .btn{
    max-width: 150px;
    max-height: 25px;
  }
</style>
