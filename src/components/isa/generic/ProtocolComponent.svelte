<script lang="ts">
  import String from "../generic/String.svelte";
  import Schema from "@/lib/schemas";
  import OntologySvelect, { type OntologyResult } from "./OntologySvelect.svelte";
  import type { OntologyAnnotation } from "@/lib/schemas/types_isa";

  let { value: component = $bindable(), index, remove } = $props();
  let componentType = $derived(component?.componentType);

  function addComponentType(type: OntologyResult) {
    const ontologySchema = Schema.getObjectFromSchema<OntologyAnnotation>("ontology_annotation");
    ontologySchema.annotationValue = type.label;
    ontologySchema.termSource = type.ontology_name;
    ontologySchema.termAccession = type.short_form;
    component.componentType = ontologySchema;
  }

  function removeComponentType() {
    component.componentType = {};
    result = null;
  }

  let result = $state(null);
</script>

<div class="component-container">
  <div class="button-container">
    <button class="btn btn-warning" onclick={() => remove(index)}>Remove Component</button>
  </div>
  <div class="name-container">
    <String bind:value={component.componentName} attr="name" label="Component Name" />
  </div>

  <div class="container">
    <p>Component Type</p>
    <div>
      {#if !componentType || Object.keys(componentType).length === 0}
        <OntologySvelect
          bind:searchResult={result}
          onChangeCallback={() => {
            if (result) addComponentType(result);
          }}
        ></OntologySvelect>
      {:else}
        <div class="type-container">
          <p>{componentType.annotationValue} ({componentType.termAccession})</p>
          <div class="button-container">
            <button class="btn btn-warning" aria-label="remove component type" onclick={() => removeComponentType()}> X </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .component-container {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }

  .button-container {
    display: flex;
    justify-content: flex-end;
    padding: 4px 0px;
  }

  .container {
    display: grid;
    grid-template-columns: 20% 80%;
    padding: 0px 8px;
    align-items: center;
  }

  .container * {
    padding: 0px 8px;
  }

  .type-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .type-container button {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
