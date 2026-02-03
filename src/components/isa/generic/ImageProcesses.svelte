<script lang="ts">
  import Schemas from "@/lib/schemas";
  import type { DataFile, Protocol, Sample } from "@/lib/schemas/types_isa";
  import { isaObj } from "@/stores/isa";
  import { onMount } from "svelte";

  interface ImageDataBRAPI {
    imageURL: string;
    observationUnitDbId: string;
  }

  let { componentConfig = {}, value = $bindable(), allImages, reset } = $props();
  let page = $state(0),
    pageSize = $state(5);

  onMount(() => {
    // image protocol somehow needs to be loaded before calling load table function or with derived rune. In the function itself, this statement would return undefined
    let imageProtocol = $isaObj?.studies?.at(-1)?.protocols?.find((p) => p.name === "Imaging"); // Loads the last study and find the Imaging protocol
    if (imageProtocol) {
      loadTable(imageProtocol);
    }
  });

  /**
   * Loads all process sequences and connects inputs (ObservationUnitDbId) with outputs (ImageURL)
   * Works only with Images from a BRAPI Server
   */
  function loadTable(protocol: Protocol) {
    let process = Schemas.getObjectFromSchema("process");
    process["name"] = "Imaging"; // Fixed Protocol Name
    process["executesProtocol"] = protocol;

    allImages.forEach((img: ImageDataBRAPI) => {
      const sampleName = img.observationUnitDbId;
      const imageURL = img.imageURL;

      let sample = Schemas.getObjectFromSchema("sample");
      let data = Schemas.getObjectFromSchema("data");
      if (!value.materials.samples.find((s: Sample) => s.name == sample.name) && sample.name) {
        value.materials.samples = [...value.materials.samples, sample];
      }

      if (!value.dataFiles.find((d: DataFile) => d.name == data.name) && data.name) {
        value.dataFiles = [...value.dataFiles, data];
      }

      sample["name"] = sampleName;
      data["name"] = imageURL;
      data["type"] = "Image File";

      if (sample.name) {
        process["inputs"] = [...process["inputs"], sample];
      }

      if (data.name) {
        process["outputs"] = [...process["outputs"], data];
      }
    });
    value.processSequence = [...value.processSequence, process];
  }

  function resetProcess() {
    value.processSequence = [];
    value.materials.samples = [];
    value.dataFiles = [];
    reset();
  }
</script>

{#if value.processSequence.length > 0}
  <div class="justify-end">
    <button class="btn btn-secondary" onclick={resetProcess}>Reset</button>
  </div>
  <div class="table-responsive">
    <table>
      <thead>
        <tr>
          <th>Sample Name</th>
          {#if value.processSequence[0].inputs.length > 0}
            {#each value.processSequence[0].inputs[0].characteristics as characteristic}
              <th>{characteristic.category.characteristicType.annotationValue}</th>
            {/each}
          {/if}
          <th>Data File</th>
        </tr>
      </thead>
      <tbody>
        {#each value.processSequence[0].inputs as input, idx}
          {#if idx >= page * pageSize && idx < (page + 1) * pageSize}
            <tr>
              <td>{input.name}</td>
              {#each input.characteristics as characteristic}
                <td>{characteristic.value}</td>
              {/each}
              {#if value.processSequence[0].outputs[idx]}
                <td>{value.processSequence[0].outputs[idx].name}</td>
              {:else}
                <td>{" "}</td>
              {/if}
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
  <div class="pagination">
    <button onclick={() => (page = 0)} disabled={page == 0}>First</button>
    <button onclick={() => page--} disabled={page == 0}>Previous</button>
    <select bind:value={pageSize}>
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
    <button onclick={() => page++} disabled={page >= Math.ceil(value.processSequence[0].inputs.length / pageSize) - 1}>Next</button>
    <button onclick={() => (page = Math.ceil(value.processSequence[0].inputs.length / pageSize) - 1)} disabled={page >= Math.ceil(value.processSequence[0].inputs.length / pageSize) - 1}>Last</button>
    <span>Page {page + 1} of {Math.ceil(value.processSequence[0].inputs.length / pageSize)}</span>
  </div>
{:else}
  <p>loading...</p>
{/if}

<style>
  .table-responsive {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #4caf50;
    color: white;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .pagination button,
  .pagination select {
    padding: 0.5rem 1rem;
    border: 1px solid black;
    border-radius: 5px;
    cursor: pointer;
    font-size: medium;
    transition: background-color 0.3s ease;
  }

  .pagination button:hover,
  .pagination select:hover {
    background-color: hsl(var(--neutral-h), var(--neutral-s), calc(var(--neutral-l) - 10%));
  }

  .pagination button[disabled] {
    border: 1px solid #ccc;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination button[disabled]:hover {
    background-color: var(--neutral);
  }

  .pagination select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .pagination span {
    font-size: medium;
    font-style: italic;
    color: #333;
  }

  .justify-end {
    display: flex;
    justify-content: flex-end;
    padding: 5px 0;
  }
</style>
