<script lang="ts">
  import { onMount } from "svelte";
  import OntologySvelect from "./OntologySvelect.svelte";
  import { SvelteSet } from "svelte/reactivity";

  let { dataframe, column_mapping = $bindable(), approve } = $props();

  let isValid = $state(false),
    hasInput = $state(false),
    oneInput = $state(false),
    hasOutput = $state(false),
    oneOutput = $state(false);

  let invalidOntologies = $state(new SvelteSet());

  function validate(mapping: any) {
    const keys = Object.keys(mapping);
    let inputCount = 0;
    let outputCount = 0;
    invalidOntologies.clear();

    keys.forEach((key) => {
      const type = mapping[key].type;
      if (type === "input") {
        inputCount++;
      } else if (type === "output") {
        outputCount++;
      }
      if (
        (type === "characteristic" && mapping[key].value === null) ||
        (type === "factor" && mapping[key].value === null)
      ) {
        invalidOntologies.add(key);
      }
    });

    hasInput = inputCount >= 1;
    oneInput = inputCount === 1;
    hasOutput = outputCount >= 1;
    oneOutput = outputCount === 1;

    isValid =
      hasInput &&
      oneInput &&
      hasOutput &&
      oneOutput &&
      invalidOntologies.size === 0;
  }

  onMount(() => {
    validate(column_mapping);
  });
</script>

<div class="table-container">
  <div class="table-header grid">
    <div class="highlight">Column</div>
    <div class="highlight">Example Value</div>
    <div class="highlight">Column Mapping</div>
  </div>
  {#each dataframe.listColumns() as column}
    <div class="grid row-container">
      <div class="highlight">{column}</div>
      <div class="highlight">{dataframe.getRow(0).get(column)}</div>
      <div class="highlight">
         {column_mapping[column].type.charAt(0).toUpperCase() + column_mapping[column].type.slice(1)}
         {#if column_mapping[column].value}
            [{column_mapping[column].value?.label}]
         {/if}
    </div>

      <div class="option-container">
        <button
          class="btn"
          class:disabled={column_mapping[column].type !== "ignore"}
          onclick={() => {
            column_mapping[column] = { type: "ignore", value: null };
            validate(column_mapping);
          }}>Ignore</button
        >
        <button
          class="btn"
          class:disabled={column_mapping[column].type !== "input"}
          onclick={() => {
            column_mapping[column] = { type: "input", value: null };
            validate(column_mapping);
          }}>Input</button
        >
        <button
          class="btn"
          class:disabled={column_mapping[column].type !== "output"}
          onclick={() => {
            column_mapping[column] = { type: "output", value: null };
            validate(column_mapping);
          }}>Output</button
        >
        <button
          class="btn"
          class:disabled={column_mapping[column].type !== "characteristic"}
          onclick={() => {
            column_mapping[column] = { type: "characteristic", value: null };
            validate(column_mapping);
          }}>Characteristic</button
        >
        <button
          class="btn"
          class:disabled={column_mapping[column].type !== "factor"}
          onclick={() => {
            column_mapping[column] = { type: "factor", value: null };
            validate(column_mapping);
          }}>Factor</button
        >
      </div>

      <div
        class="ontology-row"
        class:red-border={invalidOntologies.has(column)}
      >
        {#if column_mapping[column].type === "characteristic" || column_mapping[column].type === "factor"}
          <span>Column Meaning</span>
          <OntologySvelect
            bind:searchResult={column_mapping[column].value}
            placeholder="e.g. Organism"
            onChangeCallback={() => {
              invalidOntologies.delete(column);
              validate(column_mapping);
            }}
          ></OntologySvelect>
        {/if}
      </div>
    </div>
  {/each}
</div>

<div class="validate-container">
  <ul style="color: red;">
    {#if !hasInput}
      <li>Please define an Input!</li>
    {:else if !oneInput}
      <li>Please define only one Input!</li>
    {/if}
    {#if !hasOutput}
      <li>Please define an Output!</li>
    {:else if !oneOutput}
      <li>Please define only one Output!</li>
    {/if}
    {#if invalidOntologies.size > 0}
      {#each invalidOntologies.values() as name}
        <li>Please provide an value for: {name}</li>
      {/each}
    {/if}
  </ul>

    <div class="btn-container">
    <button
      disabled={!isValid}
      class:disabled={!isValid}
      class="btn btn-primary"
      onclick={() => approve()}>Approve</button
    >
  </div>
</div>

<style>
  .validate-container {
    padding: 16px 0px;
        display: flex;
    justify-content: space-between;
  }

  .validate-container > .btn-container > .btn {
    width: 150px;
    height: 50px;
  }
 
  .red-border {
    border: 1px solid red;
  }

  .highlight {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #eeeeee;
    padding: 8px;
  }

  .table-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .table-header {
    background-color: #eee;
    font-size: larger;
    font-weight: bold;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }

  .row-container {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    gap: 8px;
    padding-top: 8px;
    padding-left: 8px;
    padding-right: 8px;
  }

  .row-container > .highlight {
    font-style: italic;
  }

  .option-container {
    padding-top: 8px;
    grid-column: 1 / span 3;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 16px;
  }

  .ontology-row {
    grid-column: 1 / span 3;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 4px;
  }

  button.btn.disabled {
    background: linear-gradient(
      0deg,
      hsl(0, 0%, 70%) 0%,
      hsl(0, 0%, 85%) 100%
    ) !important;
    color: black;
  }
</style>
