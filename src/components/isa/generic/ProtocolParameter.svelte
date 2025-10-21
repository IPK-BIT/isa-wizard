<script lang="ts">
  import { onMount } from "svelte";
  import OntologySvelect, { type OntologyResult } from "./OntologySvelect.svelte";
  import Schema from "@/lib/schemas";

  let { value: protocolParameter = $bindable(), remove, index } = $props();

  let selectedValue: OntologyResult | null = $state(null);
  let unit = $derived(protocolParameter?.comments.find((c: { name: string; value: any[] }) => c.name === "unit"));

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

  function removeUnit() {
    // because only one unit should exist in this component, we can simply remove first unit we find in comments
    const unitIndex = protocolParameter.comments.findIndex((c: { name: string }) => c.name === "unit");
    if (unitIndex) {
      protocolParameter.comments = [...protocolParameter.comments.slice(0, unitIndex), ...protocolParameter.comments.slice(unitIndex + 1)];
      result = null;
    } else {
      console.error("No unit found to remove");
    }
  }

  let result = $state(null);

  onMount(() => {
    console.log(protocolParameter);
    if (!protocolParameter.comments) {
    }
  });
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
      <input type="text" bind:value={protocolParameter.comments[0].value} />
    </label>
  </div>
  <div class="search-unit">
    {#if unit}
      <div class="">
        <span><strong>Unit:</strong> {`${unit.value.annotationValue} > ${unit.value.termAccession}`}</span>
        <button
          class="btn btn-warning"
          onclick={() => {
            selectedValue = null;
            removeUnit();
            result = null;
          }}>Remove</button
        >
      </div>
    {:else}
      <OntologySvelect
        bind:searchResult={result}
        onChangeCallback={() => {
          if (result) addUnit(result);
        }}
      ></OntologySvelect>
    {/if}
  </div>

  <div class="remove-btn">
    {#if protocolParameter.comments.find((c) => c.name === "deletable").value[1]?.value === "true"}
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
