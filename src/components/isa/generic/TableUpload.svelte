<script lang="ts">
  // import { createEventDispatcher } from "svelte";
  import { DataFrame } from "dataframe-js";
  import OntologySvelect from "./OntologySvelect.svelte";
  // import { stat } from "fs";

  let { approve } = $props();

  function handleFileDrop(event) {
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
    dataframe.listColumns().forEach((element) => {
      column_mapping[element] = {
        type: "ignore",
        value: null,
      };
    });
  }

  let column_mapping: any = $state({});

  //   const dispatch = createEventDispatcher();
  //   function approve() {
  //     dispatch("approve", { dataframe, column_mapping });
  //   }

  function validate(mapping: any) {
    let hasInput = false,
      hasOutput = false,
      validCharacteristics = true,
      validFactors = true;
    Object.keys(mapping).forEach((key) => {
      if (mapping[key].type === "characteristic" && mapping[key].value === null) {
        validCharacteristics = false;
      }
      if (mapping[key].type === "factor" && mapping[key].value === null) {
        validFactors = false;
      }
      if (mapping[key].type === "input") {
        hasInput = true;
      }
      if (mapping[key].type === "output") {
        hasOutput = true;
      }
    });
    if (!hasInput) {
      return false;
    }
    if (!hasOutput) {
      return false;
    }
    if (!validCharacteristics) {
      return false;
    }
    if (!validFactors) {
      return false;
    }
    return true;
  }

  let isValid = $derived(validate(column_mapping));
</script>

<div>
  <p>Please upload the list of materials by clicking the upload area below or by dragging and dropping the file onto the upload area.</p>
  <div class="drag-drop-area" role="button" tabindex="0" ondrop={handleFileDrop} ondragover={(event) => event.preventDefault()}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <p onclick={handleFileSelection}>Drag and drop your filled sample file here</p>
  </div>
  <label>
    <span>Has Header</span>
    <input type="checkbox" bind:checked={hasHeader} />
  </label>
</div>

{#if dataframe}
  <div class="table-responsive">
    <table>
      <thead>
        <tr>
          <th>Column</th>
          <th>Example Value</th>
          <th>Column Mapping</th>
        </tr>
      </thead>
      <tbody>
        {#each dataframe.listColumns() as column}
          <tr>
            <td>{column}</td>
            <td>{dataframe.getRow(0).get(column)}</td>
            <td>
              {#if column_mapping[column].type === "ignore"}
                <span>Ignore</span>
              {:else if column_mapping[column].type === "input"}
                <span>Input</span>
              {:else if column_mapping[column].type === "output"}
                <span>Output</span>
              {:else}
                {column_mapping[column].type.charAt(0).toUpperCase() + column_mapping[column].type.slice(1)}[{column_mapping[column].value?.label}]
              {/if}
            </td>
          </tr>
          {#if true}
            <tr>
              <td colspan="3">
                <div class="flex-col">
                  <div class="flex-row">
                    <span>Column Type</span>
                    <label class="radio-option">
                      <input type="radio" name={"mapping-" + column} checked onchange={() => (column_mapping[column] = { type: "ignore", value: null })} />
                      <span class={column_mapping[column].type === "ignore" ? "checked" : ""}>Ignore</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" name={"mapping-" + column} onchange={() => (column_mapping[column] = { type: "input", value: null })} />
                      <span class={column_mapping[column].type === "input" ? "checked" : ""}>Input</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" name={"mapping-" + column} onchange={() => (column_mapping[column] = { type: "output", value: null })} />
                      <span class={column_mapping[column].type === "output" ? "checked" : ""}>Output</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" name={"mapping-" + column} onchange={() => (column_mapping[column].type = "characteristic")} />
                      <span class={column_mapping[column].type === "characteristic" ? "checked" : ""}>Characteristic</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" name={"mapping-" + column} onchange={() => (column_mapping[column].type = "factor")} />
                      <span class={column_mapping[column].type === "factor" ? "checked" : ""}>Factor</span>
                    </label>
                  </div>
                  <div class="flex-row">
                    {#if column_mapping[column].type === "characteristic" || column_mapping[column].type === "factor"}
                      <span>Column Meaning</span>
                      <OntologySvelect bind:searchResult={column_mapping[column].value} placeholder="e.g. Organism"></OntologySvelect>
                      <!-- <Svelecte style="border: 1px solid grey;" creatable createTransform={createHandler} bind:readSelection={column_mapping[column].value} placeholder="e.g. Organism" fetch={handleFetch} renderer={ontoRenderer} /> -->
                    {/if}
                  </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
  {#if isValid}
    <button disabled={!isValid} class="btn btn-primary" onclick={() => approve({ dataframe, column_mapping })}>Approve</button>
  {:else}
    <div style="color: red;">
      <p>The mapping is not valid. Please check the mapping.</p>
      <ul>
        <li>One Input Column</li>
        <li>One Output Column</li>
        <li>All Attribute Columns have a value</li>
        <li>All Variable Columns have a value</li>
      </ul>
    </div>
  {/if}
{/if}

<style>
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

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead {
    background-color: #e8e8e8;
  }

  tbody tr:nth-child(odd) {
    border-top: 1px solid rgb(150, 150, 150);
    background-color: #f2f2f2;
  }

  /* tbody tr:hover {
        background-color: #e6e6e6;
    } */
  td,
  th {
    padding: 10px;
    text-align: left;
  }

  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
  }
  .flex-col {
    display: flex;
    flex-direction: column;
    align-items: left;
    gap: 1em;
  }

  label.radio-option {
    display: flex;
    align-items: left;
    gap: 0.5em;
  }
  label.radio-option input {
    margin: 0;
    display: none;
  }
  label.radio-option span {
    background: linear-gradient(0deg, hsl(0, 0%, 70%) 0%, hsl(0, 0%, 85%) 100%);
    color: black;
    border: 0;
    border-radius: 5px;
    padding: 3px 6px;
    cursor: pointer;
    font-size: 0.9em;
    width: 7rem;
  }

  label.radio-option span:hover {
    background: linear-gradient(0deg, hsl(0, 0%, 60%) 0%, hsl(0, 0%, 80%) 100%);
  }

  .checked {
    background: linear-gradient(0deg, hsl(145, 83%, 28%) 0%, hsl(145, 83%, 38%) 100%) !important;
    color: white !important;
    border: 0;
    border-radius: 5px;
    padding: 3px 6px;
    cursor: pointer;
    font-size: 0.9em;
  }

  .checked:hover {
    background: linear-gradient(0deg, hsl(145, 83%, 20%) 0%, hsl(145, 83%, 30%) 100%) !important;
  }
</style>
