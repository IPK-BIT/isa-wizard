<script lang="ts">
  import { DataFrame } from "dataframe-js";
  import { onMount } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import OntologySvelect from "./OntologySvelect.svelte";

  let { approve, value: studies = $bindable() } = $props();

  let selectedProtocols: any[] = $state([]);
  function selectProtocol(protocol: any) {
    const protocolIdx = selectedProtocols.findIndex((p) => p.name === protocol.name);
    if (protocolIdx !== -1) {
      selectedProtocols.splice(protocolIdx, 1);
    } else {
      selectedProtocols.push(protocol);
    }
    validate(column_mapping);
  }

  function handleFileDrop(event: any) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    loadFile(file);
  }

  function handleFileSelection() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv, .tsv"; // Specify the accepted file type(s) here

    input.addEventListener("change", () => {
      if (input.files) {
        loadFile(input.files[0]);
      }
    });
    input.click();
  }

  let dataframe: any = $state();
  let hasHeader = $state(true);

  /**
   * @param {File} file
   */
  async function loadFile(file: File) {
    let df = await DataFrame.fromCSV(file, true).then((df) => df);
    dataframe = df;
    column_mapping = {};
    dataframe.listColumns().forEach((element: any) => {
      column_mapping[element] = {
        type: "ignore",
        value: null,
      };
    });
  }

  let column_mapping: any = $state({});

  let isValid = $state(false),
    hasInput = $state(false),
    oneInput = $state(false),
    hasOutput = $state(false),
    oneOutput = $state(false),
    protocolSelected = $state(false);

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
      if ((type === "characteristic" && mapping[key].value === null) || (type === "factor" && mapping[key].value === null)) {
        invalidOntologies.add(key);
      }
    });

    hasInput = inputCount >= 1;
    oneInput = inputCount === 1;
    hasOutput = outputCount >= 1;
    oneOutput = outputCount === 1;
    protocolSelected = selectedProtocols.length > 0;

    isValid = hasInput && oneInput && hasOutput && oneOutput && invalidOntologies.size === 0 && protocolSelected;
  }

  onMount(() => {
    validate(column_mapping);
  });
</script>

<div>
  <p>Please upload the list of materials by clicking the upload area below or by dragging and dropping the file onto the upload area.</p>
  <div class="drag-drop-area" role="button" tabindex="0" ondrop={handleFileDrop} ondragover={(event) => event.preventDefault()}>
    <button style="background: transparent; border: none; cursor: pointer" onclick={handleFileSelection}>Drag and drop your filled sample file here</button>
  </div>
  <label>
    <span>Has Header</span>
    <input type="checkbox" bind:checked={hasHeader} />
  </label>
</div>

{#if dataframe}
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

        <div class="ontology-row" class:red-border={invalidOntologies.has(column)}>
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

  {#if studies.protocols && studies.protocols.length > 0}
    <div class="protocol-container">
      <div>Please specify which protocols where used:</div>
      <div>
        {#each studies.protocols as protocol}
          <label class="protocol-label">
            <input type="checkbox" value={protocol.name} onchange={() => selectProtocol(protocol)} />
            Protocol: {protocol.name}
          </label>
        {/each}
      </div>
    </div>
  {/if}

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
      {#if !protocolSelected}
        <li>Please select at least one protocol!</li>
      {/if}
    </ul>

    <div class="btn-container">
      <button disabled={!isValid} class:disabled={!isValid} class="btn btn-primary" onclick={() => approve({ dataframe, column_mapping, selectedProtocols })}>Approve</button>
    </div>
  </div>
{/if}

<style>
  .protocol-container {
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    padding: 12px;
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
  }

  .protocol-label {
    display: flex;
    gap: 4px;
  }

  label {
    display: flex;
    justify-content: end;
    margin: 0.5em 0;
    width: 100%;
    align-items: center;
  }

  label span {
    margin: 0 0.5em;
    font-size: small;
    font-style: italic;
  }

  .drag-drop-area {
    margin-top: 0.5em;
    border: 2px dashed #ccc;
    padding: 1em;
    text-align: center;
  }

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
    background: linear-gradient(0deg, hsl(0, 0%, 70%) 0%, hsl(0, 0%, 85%) 100%) !important;
    color: black;
  }
</style>
