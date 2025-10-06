<script lang="ts">
  import Svelecte from "svelecte";
  import { createEventDispatcher } from "svelte";
  import String from "../generic/String.svelte";
  import OntologyAnnotation from "../generic/OntologyAnnotation.svelte";
  import Schema from "@/lib/schemas";
  import OntologySvelect from "./OntologySvelect.svelte";

  let { value: component = $bindable(), index, remove } = $props();
  let selectedValue = $state(null);
  let componentType = $derived(component?.componentType);

  $inspect(componentType);

  interface OntologyResult {
    label?: string;
    value?: string;
    description?: string[];
    iri?: string;
    ontology_name?: string;
    short_form?: string;
  }

  function handleFetch(data: { response: { docs: OntologyResult[] } }) {
    let results = data.response.docs;
    let values = results.map((result: OntologyResult) => {
      return {
        label: result.label,
        value: result,
        description: result.description?.[0] ?? null,
        iri: result.iri,
        ontology_name: result.ontology_name,
        short_form: result.short_form,
        text: `${result.label} > ${result.short_form}`,
      };
    });

    if (values.length > 0) {
      return values;
    } else {
      return [];
    }
  }

  function addComponentType(type: OntologyResult) {
    const ontologySchema = Schema.getObjectFromSchema("ontology_annotation");
    ontologySchema.annotationValue = type.label;
    ontologySchema.termSource = type.ontology_name;
    ontologySchema.termAccession = type.short_form;

    component.componentType = ontologySchema;
  }

  function removeComponentType() {
    component.componentType = {};
    result = null;
  }

  let result = $state();
  $inspect("rsult in parent: ", result);
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
        bind:searchResult = {result}
        onChangeCallback = {() => addComponentType(result)}
        
        >

        </OntologySvelect>

        <!-- <Svelecte
          placeholder="Search unit"
          bind:value={selectedValue}
          fetch="https://api.terminology.tib.eu/api/select?q=[query]&fieldList=description,label,iri,ontology_name,type,short_form"
          fetchCallback={handleFetch}
          onChange={() => (selectedValue ? addComponentType(selectedValue) : console.log("No selected Value"))}
        ></Svelecte> -->
      {:else}
        <div class="type-container">
          <p>{componentType.annotationValue} ({componentType.termAccession})</p>
          <div class="button-container">
            <button class="btn btn-warning" aria-label="remove component type" onclick={() => removeComponentType()}>
              X
            </button>
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
