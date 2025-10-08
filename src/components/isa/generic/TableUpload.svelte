<script lang="ts">
  import { DataFrame } from "dataframe-js";
  import TableAnnotation from "./TableAnnotation.svelte";

  let { approve } = $props();

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
        <TableAnnotation {dataframe} bind:column_mapping approve={() => approve({dataframe, column_mapping})} />
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
</style>
