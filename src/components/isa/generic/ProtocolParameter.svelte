<script lang="ts">
  import OntologySvelect, { type OntologyResult } from "./OntologySvelect.svelte";
  import Schema from "@/lib/schemas";

  interface CommentISA {
    "@id": string;
    name: string;
    value: any;
  }

  let { value: protocolParameter = $bindable(), remove, index } = $props();

  let selectedValue: OntologyResult | null = $state(null);
  // Derive indexes from ISA JSON because its easier to create bidirectional binding with direct array bindings instead of manipulating Objects like valueObj.value
  let unitIdx = $derived(protocolParameter?.comments.findIndex((c: CommentISA) => c.name === "unit"));
  let deletableIdx = $derived(protocolParameter?.comments.findIndex((c: CommentISA) => c.name === "deletable"));
  let valueIdx = $derived(protocolParameter?.comments.findIndex((c: CommentISA) => c.name === "value"));

  // The Svelecte selected search result is saved here
  let searchResult = $state(null);

  /**
   * Creates a new Comment Schema with a ontology annotation Schema as a value
   * The created Unit will be added to the ISA JSON String for this protocolParameter
   * @param unit
   */
  function addUnit(unit: OntologyResult) {
    const commentSchema = Schema.getObjectFromSchema("comment");
    commentSchema.name = "unit";
    const ontologySchema = Schema.getObjectFromSchema("ontology_annotation");
    ontologySchema.annotationValue = unit.label;
    ontologySchema.termSource = unit.ontology_name;
    ontologySchema.termAccession = unit.short_form;
    commentSchema.value = ontologySchema;

    protocolParameter.comments = [...protocolParameter.comments, commentSchema];
  }

  /**
   * Slice out the unit comment from protocolParameter.comments with the derived unit index
   */
  function removeUnit() {
    if (unitIdx !== -1) {
      protocolParameter.comments = [...protocolParameter.comments.slice(0, unitIdx), ...protocolParameter.comments.slice(unitIdx + 1)];
      searchResult = null;
    } else {
      console.error("No unit found to remove");
    }
  }
</script>

<div class="container">
  <div class="name">
    <p>
      <strong>Name:</strong>
      {protocolParameter.parameterName.annotationValue}
    </p>
  </div>
  <div class="value">
    <label
      >Value:
      {#if valueIdx !== -1}
        <input type="text" bind:value={protocolParameter.comments[valueIdx].value} />
      {/if}
    </label>
  </div>
  <div class="search-unit">
    {#if unitIdx !== -1}
      <div class="">
        <span
          ><strong>Unit:</strong>
          {`${protocolParameter.comments[unitIdx].value.annotationValue} > ${protocolParameter.comments[unitIdx].value.termAccession}`}</span
        >
        <button
          class="btn btn-warning"
          onclick={() => {
            selectedValue = null;
            removeUnit();
            searchResult = null;
          }}>Remove</button
        >
      </div>
    {:else}
      <OntologySvelect
        placeholder={"Search unit..."}
        bind:searchResult
        onChangeCallback={() => {
          if (searchResult) addUnit(searchResult);
        }}
      ></OntologySvelect>
    {/if}
  </div>

  <div class="remove-btn">
    {#if deletableIdx === -1}
      <button type="button" class="btn btn-warning" onclick={() => remove(index)}>Remove</button>
    {:else}
      <i>predefined</i>
    {/if}
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    grid-template-rows: auto;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }
  .container > div {
    display: flex;
    align-items: center;
    padding: 5px;
    text-align: center;
  }

  .name {
    grid-column: 1 / span 2;
    grid-row: 1;
  }
  .value {
    grid-column: 3;
    grid-row: 1;
  }

  .search-unit {
    grid-column: 1 / span 4;
    grid-row: 2;
  }
  .remove-btn {
    grid-column: 4;
    grid-row: 1;
  }

  button {
    width: 100px;
    height: 25px;
  }
</style>
