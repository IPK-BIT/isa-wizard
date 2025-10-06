<script lang="ts">
  import Schema from "@/lib/schemas";
  import Svelecte from "svelecte";
  import { onMount } from "svelte";

  interface OntologyResult {
    label?: string;
    value?: string;
    description?: string[];
    iri?: string;
    ontology_name?: string;
    short_form?: string;
  }

  let { value: protocolParameter = $bindable(), remove, index } = $props();

  let selectedValue: OntologyResult | null = $state(null);
  let unit = $derived(protocolParameter?.comments.find((c: {name: string, value: any[]}) => c.name === 'unit'));

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

  function addUnit(unit: OntologyResult){
    const commentSchema = Schema.getObjectFromSchema('comment');
    commentSchema.name = "unit";
    const ontologySchema = Schema.getObjectFromSchema('ontology_annotation');
    ontologySchema.annotationValue = unit.label;
    ontologySchema.termSource = unit.ontology_name;
    ontologySchema.termAccession = unit.short_form;
    commentSchema.value = ontologySchema;

    protocolParameter.comments = [...protocolParameter.comments, commentSchema];
  }

  function removeUnit(){
    // because only one unit should exist in this component, we can simply remove first unit we find in comments
    const unitIndex = protocolParameter.comments.findIndex((c: {name: string}) => c.name === 'unit');
    if(unitIndex){
      protocolParameter.comments = [
        ...protocolParameter.comments.slice(0, unitIndex),
        ...protocolParameter.comments.slice(unitIndex + 1),
      ];
    }else{
      console.error('No unit found to remove');
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
          }}>Remove</button
        >
      </div>
    {:else}
      <Svelecte
        placeholder="Search unit"
        bind:value={selectedValue}
        fetch="https://api.terminology.tib.eu/api/select?q=[query]&fieldList=description,label,iri,ontology_name,type,short_form"
        fetchCallback={handleFetch}
        onChange={() => selectedValue ? addUnit(selectedValue) : console.log('No selected Value')}
      >
        {#snippet option(opt, inputValue)}
          {@const ontology = opt as OntologyResult}
          <div class="unit-container">
            <div class="ontology-label">
              {ontology.label}
              [{ontology.ontology_name}]
            </div>
            <div class="ontology-description">
              {#if ontology.description}
                {ontology.description}
              {/if}
            </div>

            <div class="ontology-iri">
              {ontology.iri}
            </div>
          </div>
        {/snippet}
      </Svelecte>
    {/if}
  </div>
  <div class="remove-btn">
    <button type="button" class="btn btn-warning" onclick={() => remove(index)}
      >Remove</button
    >
  </div>
</div>

<style>
  .unit-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .ontology-label {
    font-weight: bold;
  }

  .ontology-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    -webkit-box-align: start;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ontology-iri {
    font-size: 0.8em;
    color: #666;
  }

  .container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    grid-template-rows: auto;
    background-color: red;
  }
  .container > div {
    display: flex;
    align-items: center;
    background-color: #f1f1f1;
    border: 1px solid black;
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
