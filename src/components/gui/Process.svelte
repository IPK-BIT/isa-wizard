<script lang="ts">
  import { wizardStore } from "@/stores/WizardStore.svelte";
  import Breadcrumb from "./Breadcrumb.svelte";
  import { isaObj } from "@/stores/isa";
  import Pagination from "./Pagination.svelte";

  let { value: process, jsonPath = "" } = $props();

  let previousProcess = $derived(process?.previousProcess ?? null);
  let nextProcess = $derived(process?.nextProcess ?? null);
  let study = $derived($isaObj?.studies?.length === 1 ? $isaObj.studies[0] : null); // The prev/next Process logic should work as long as only one study is existing. Otherwise the correct study needs to be identified.
  let processSequence = $derived(study?.processSequence ?? []);

  //   $inspect("1", process);
  //   $inspect("2", study);
  //   $inspect("3", processSequence);
  //   $inspect("4", wizardStore.simpleGuiLevel);

  let page = $state(0);
  let pageSize = $state(10);

  /**
   * Try to find the process with the [@id] attribute and changes the guiLevel and guiBreadcrumb
   * Heavily depends on the names from the processes and protocols so it could break if a protocol has no name.
   * @param process
   */
  function openProcess(process) {
    try {
      let processIdx = processSequence.findIndex((p) => p["@id"] === process["@id"]);

      wizardStore.simpleGuiLevel = {
        type: "Process",
        jsonPath: `studies[0].processSequence[${processIdx}]`,
      };

      let protocolName = processSequence[processIdx].executesProtocol.name;
      let protocolIdx = study.protocols.findIndex((p) => p.name === protocolName);

      wizardStore.simpleGuiBreadcrumb = [
        {
          name: $isaObj.title ? $isaObj.title : "Untitled Investigation",
          fn: () => {
            wizardStore.simpleGuiLevel = { type: "Investigation", jsonPath: "" };
          },
        },
        {
          name: study.title ? study.title : "Untitled Study",
          fn: () => {
            wizardStore.simpleGuiLevel = { type: "Study", jsonPath: `${wizardStore.simpleGuiLevel.jsonPath.split(".")[0]}` };
          },
        },
        {
          name: `${protocolName} Protocol`,
          fn: () => {
            wizardStore.simpleGuiLevel = { type: "Protocol", jsonPath: `studies[0].protocols[${protocolIdx}]` };
          },
        },
        { name: `${study.processSequence[processIdx].name} Process`, fn: () => {} },
      ];
    } catch (error) {
      console.error(`Error: Something went wrong with opening Process ${process}`, error);
    }
  }
</script>

<h3>Process</h3>
<Breadcrumb />

<table id="process">
  <tbody>
    <tr>
      <td><strong>Name</strong></td>
      <td>{process.name}</td>
    </tr>
    <tr>
      <td><strong>Performer</strong></td>
      <td>{process.performer}</td>
    </tr>
    <tr>
      <td><strong>Date</strong></td>
      <td>{process.date}</td>
    </tr>
    <tr>
      <td><strong>Previous Process</strong></td>
      <td>
        {#if process?.previousProcess?.["@id"]}
          <button
            class="link"
            onclick={() => {
              if (study) openProcess(previousProcess);
            }}
          >
            {previousProcess?.name ?? process.previousProcess["@id"]}
          </button>
        {:else}
          <span>No previous process.</span>
        {/if}
      </td>
    </tr>
    <tr>
      <td><strong>Next Process</strong></td>
      <td>
        {#if process?.nextProcess?.["@id"]}
          <button
            class="link"
            onclick={() => {
              if (study) openProcess(nextProcess);
            }}
          >
            {nextProcess?.name ?? process.nextProcess["@id"]}
          </button>
        {:else}
          <span>No next process.</span>
        {/if}
      </td>
    </tr>
    <tr>
      <td><strong>Details</strong></td>
      <td>
        <table class="subtable">
          <tbody>
            <tr>
              <th><strong>Input</strong></th>
              <th><strong>Protocol</strong></th>
              {#each process.parameterValues as parameterValue}
                <th><strong> {parameterValue?.category?.parameterName?.annotationValue ?? "-"}</strong></th>
              {/each}
              <th><strong>Output</strong></th>
            </tr>
            {#each process.inputs as input, idx}
              {#if idx >= page * pageSize && idx < (page + 1) * pageSize}
                <tr>
                  <td>{input.name}</td>
                  <td>{process.executesProtocol.name}</td>
                  {#each process.parameterValues as parameterValue}
                    {#if parameterValue?.category?.comments?.find((c) => c.name === "valueIsOntology")?.value === "true"}
                      <td>{parameterValue?.value?.annotationValue ?? "-"}</td>
                    {:else}
                      <td>{parameterValue?.value ?? "-"} {parameterValue?.unit?.annotationValue ?? "-"}</td>
                    {/if}
                  {/each}
                  <td>{process?.outputs[idx]?.name ?? "-"}</td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
        <Pagination totalCount={process.inputs.length} bind:pageSize bind:currentPage={page} />
      </td>
    </tr>
  </tbody>
</table>

<style>
  table#process {
    width: 100%;
    border-collapse: collapse;
    border: 0px solid rgb(160, 160, 160);
  }

  table#process > tbody > tr > td {
    border-top: 1px solid rgb(180, 180, 180);
    padding: 12px 10px;
    vertical-align: top;
  }

  table#process > tbody > tr:nth-child(1) > td {
    border: 0;
  }

  table#process > tbody > tr > td:nth-child(1) {
    font-weight: 500;
    width: 200px;
  }

  table.subtable {
    border-collapse: collapse;
    overflow: auto;
    display: block;
  }

  table.subtable > tbody > tr > td {
    padding: 5px 40px 5px 5px;
    border-top: 1px solid rgb(200, 200, 200);
  }

  table.subtable tr th {
    padding: 5px 40px 5px 5px;
    font-weight: 500;
    text-align: left;
  }

  .link {
    color: hsl(145, 83%, 28%);
    cursor: pointer;
    background-color: transparent;
    border: none;
    font-size: medium;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>
