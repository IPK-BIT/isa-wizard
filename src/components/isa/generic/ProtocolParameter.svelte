<script lang="ts">
  import { onMount, untrack } from "svelte";
  import OntologySvelect, { type OntologyResult } from "./OntologySvelect.svelte";
  import Schema from "@/lib/schemas";

  interface CommentSchema {
    "@id": string;
    name: string;
    value: any;
  }

  let { value: protocolParameter = $bindable(), remove, index } = $props();

  // Derive indexes from ISA JSON because its easier to create bidirectional binding with direct array bindings instead of manipulating Objects like valueObj.value
  let unitIdx = $derived(protocolParameter?.comments.findIndex((c: CommentSchema) => c.name === "unit"));
  let deletableIdx = $derived(protocolParameter?.comments.findIndex((c: CommentSchema) => c.name === "deletable"));
  let valueIdx = $derived(protocolParameter?.comments.findIndex((c: CommentSchema) => c.name === "value"));

  let valueIsOntologyIdx = $derived(protocolParameter?.comments.findIndex((c: CommentSchema) => c.name === "valueIsOntology"));
  let valueIsOntology = $derived.by(() => {
    if (valueIsOntologyIdx !== -1) {
      return protocolParameter.comments[valueIsOntologyIdx].value === true ? true : false;
    } else {
      return false; // not defined -> default = false
    }
  });

  let searchResult: OntologyResult | null = $state(null); // The Svelecte selected search result is saved here
  let saveValue = $state(""); // Save value input here for the user in case he unintentionally checks is Value Box

  onMount(() => {
    if (valueIsOntologyIdx === -1) {
      // Create Comment, so that user can define if Value is an ontology
      const commentSchema = Schema.getObjectFromSchema("comment");
      commentSchema.name = "valueIsOntology";
      commentSchema.value = false;
      protocolParameter.comments = [...protocolParameter.comments, commentSchema];
    }
  });

  /**
   * Called from the Svelecte Component if a unit is selected and add it with the createUnitComment Function
   * @param unit
   */
  function addUnit(unit: OntologyResult) {
    const annotationValue = unit.label ?? "";
    const termSource = unit.ontology_name ?? "";
    const termAccession = unit.short_form ?? "";

    createUnitCommment(annotationValue, termSource, termAccession);
  }

  /**
   * Create a new Unit Comment based on the comment schema and with the ontology_annotation schema as a value
   * If unit already exists (via steps.config) and value is not an ontology, replace with new Schema
   * If value is no ontology, add the new unit comment schema
   * If value is an ontology, replace the value with the ontology schema
   * @param annotationValue
   * @param termSource
   * @param termAccession
   */
  function createUnitCommment(annotationValue: string, termSource: string, termAccession: string) {
    const commentSchema = Schema.getObjectFromSchema("comment");
    commentSchema.name = "unit";
    const ontologySchema = Schema.getObjectFromSchema("ontology_annotation");
    ontologySchema.annotationValue = annotationValue;
    ontologySchema.termSource = termSource;
    ontologySchema.termAccession = termAccession;
    commentSchema.value = ontologySchema;

    if (unitIdx !== -1 && !valueIsOntology) {
      protocolParameter.comments[unitIdx] = commentSchema;
    } else if (!valueIsOntology) {
      protocolParameter.comments = [...protocolParameter.comments, commentSchema];
    } else {
      protocolParameter.comments[valueIdx].value = ontologySchema;
    }
  }

  /**
   * Slice out the unit comment from protocolParameter.comments with the derived unit index
   * If valueIsOntology is true, the unit will be removed from the value comment and replaced with an empty string
   */
  function removeUnit() {
    if (unitIdx !== -1) {
      protocolParameter.comments = [...protocolParameter.comments.slice(0, unitIdx), ...protocolParameter.comments.slice(unitIdx + 1)];
      searchResult = null;
    } else if (valueIsOntology) {
      protocolParameter.comments[valueIdx].value = "";
    } else {
      console.error("No unit found to remove");
    }
  }

  /**
   * Typeguard to check if a given value is in valid Unit Form
   * @param value
   */
  function valueIsUnit(value: any) {
    const isUnit = typeof value === "object" && value !== null && typeof (value as any).annotationValue === "string" && typeof (value as any).termSource === "string" && typeof (value as any).termAccession === "string";
    return isUnit;
  }

  /**
   * Called when the checkbox is clicked to change if the value is an ontology
   * If true, the unit comment will be deleted and the ontology annotation will be placed on the value comment
   * If false, a unit Comment will be created with the value from the value comment (if it is a valid Unit)
   * @param isOntology
   */
  function changeIsOntology(isOntology: boolean) {
    if (isOntology) {
      const unitValue = protocolParameter.comments[unitIdx]?.value;
      if (valueIsUnit(unitValue)) {
        protocolParameter.comments[valueIdx].value = unitValue; // Unit => Value
        removeUnit();
      }
    } else {
      const parameterValue = protocolParameter.comments[valueIdx].value;
      protocolParameter.comments[valueIdx].value = saveValue; // Restore old Value
      if (valueIsUnit(parameterValue)) {
        createUnitCommment(parameterValue.annotationValue, parameterValue.termSource, parameterValue.termAccession); // Value => Unit
      }
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
    <label>
      {#if valueIdx !== -1 && !valueIsOntology}
        <strong>Value: </strong>
        <input type="text" bind:value={protocolParameter.comments[valueIdx].value} onchange={() => (saveValue = protocolParameter.comments[valueIdx].value)} />
      {/if}
    </label>
  </div>

  <div class="search-unit">
    {#if (valueIsOntology && valueIsUnit(protocolParameter.comments[valueIdx]?.value)) || (unitIdx !== -1 && protocolParameter.comments[unitIdx].value)}
      <div class="unit-container">
        <span
          ><strong>Unit:</strong>
          {#if valueIsOntology}
            {`${protocolParameter.comments[valueIdx]?.value?.annotationValue} > ${protocolParameter.comments[valueIdx]?.value?.termAccession}`}
          {:else}
            {`${protocolParameter.comments[unitIdx]?.value?.annotationValue} > ${protocolParameter.comments[unitIdx]?.value?.termAccession}`}
          {/if}
        </span>
        <label>
          is Value
          {#if valueIsOntologyIdx !== -1}
            <input type="checkbox" onchange={() => changeIsOntology(valueIsOntology)} bind:checked={protocolParameter.comments[valueIsOntologyIdx].value} />
          {/if}
        </label>
      </div>

      <button
        class="btn btn-warning removeUnit"
        onclick={() => {
          removeUnit();
          searchResult = null;
        }}>X</button
      >
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
    {#if deletableIdx !== -1 && protocolParameter.comments[deletableIdx].value === false}
      <i>predefined</i>
    {:else if deletableIdx === -1 || protocolParameter.comments[deletableIdx].value === true}
      <button type="button" class="btn btn-warning button" onclick={() => remove(index)}>Remove</button>
    {/if}
  </div>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr auto auto;
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
    grid-column: 2;
    grid-row: 1;

    display: flex;
    justify-items: center;
    justify-content: space-between;
    gap: 4px;
  }

  .search-unit {
    grid-column: 1 / span 4;
    grid-row: 2;
    display: flex;
  }
  .remove-btn {
    grid-column: 4;
    grid-row: 1;
  }

  .button {
    width: 100px;
    height: 25px;
  }

  .removeUnit {
    margin-left: auto;
  }

  .unit-container {
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
  }
</style>
