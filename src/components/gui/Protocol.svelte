<script lang="ts">
  import { wizardStore } from "@/stores/WizardStore.svelte";
  import Breadcrumb from "./Breadcrumb.svelte";
  import { isaObj } from "@/stores/isa";
  import type { Process, Protocol } from "@/lib/schemas/types_isa";
  import { isOntologyValue } from "@/utils/typeguards";

  let { value: protocol, jsonPath }: { value: Protocol; jsonPath: string } = $props();

  let study = $derived.by(() => {
    if (isaObj.keyed) {
      return isaObj.keyed(wizardStore.simpleGuiLevel.jsonPath.split(".")[0]);
    } else {
      return null;
    }
  });

  function openProcess(idx: number) {
    wizardStore.simpleGuiLevel = {
      type: "Process",
      jsonPath: `${wizardStore.simpleGuiLevel.jsonPath.split(".")[0]}.processSequence[${idx}]`,
    };

    wizardStore.simpleGuiBreadcrumb = [
      {
        name: $isaObj.title ? $isaObj.title : "Untitled Investigation",
        fn: () => {
          wizardStore.simpleGuiLevel = { type: "Investigation", jsonPath: "" };
        },
      },
      {
        name: $study.title ? $study.title : "Untitled Study",
        fn: () => {
          wizardStore.simpleGuiLevel = { type: "Study", jsonPath: `${wizardStore.simpleGuiLevel.jsonPath.split(".")[0]}` };
        },
      },
      {
        name: `${protocol.name} Protocol`,
        fn: () => {
          wizardStore.simpleGuiLevel = { type: "Protocol", jsonPath: jsonPath };
        },
      },
      { name: `${$study.processSequence[idx].name} Process`, fn: () => {} },
    ];
  }
</script>

<h3>Protocol</h3>
<Breadcrumb />

<table id="protocol">
  <tbody>
    <tr>
      <td><strong>Name</strong></td>
      <td>{protocol.name ?? "-"}</td>
    </tr>
    <tr>
      <td><strong>URI</strong></td>
      <td>
        <a href={protocol.uri} target="_blank" rel="noopener noreferrer">
          {protocol.uri ?? "-"}
        </a>
      </td>
    </tr>
    <tr>
      <td><strong>Description</strong></td>
      <td>{protocol.description ?? "-"}</td>
    </tr>
    <tr>
      <td><strong>Type</strong></td>
      <td>
        {#if protocol.protocolType}
          <table class="subtable">
            <tbody>
              <tr>
                <th><strong>Type Name</strong></th>
                <th><strong>Term Source</strong></th>
                <th><strong>Term Accession</strong></th>
              </tr>
              <tr>
                <td>{protocol?.protocolType?.annotationValue ?? "-"}</td>
                <td>{protocol?.protocolType?.termSource ?? "-"}</td>
                <td>{protocol?.protocolType?.termAccession ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        {:else}
          <span>Not specified</span>
        {/if}
      </td>
    </tr>
    <tr>
      <td><strong>Version</strong></td>
      <td>{protocol.version}</td>
    </tr>
    <tr>
      <td><strong>Parameters</strong></td>
      <td>
        <table class="subtable">
          <tbody>
            <tr>
              <th><strong>Parameter Name</strong></th>
              <th><strong>Term Source</strong></th>
              <th><strong>Term Accession</strong></th>
            </tr>
            {#each protocol.parameters as parameter}
              <tr>
                <td>{parameter?.parameterName?.annotationValue ?? "-"}</td>
                <td>{parameter?.parameterName?.termSource ?? "-"}</td>
                <td>{parameter?.parameterName?.termAccession ?? "-"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td><strong>Processes</strong></td>
      <td>
        <table class="subtable">
          <tbody>
            <tr>
              <th><strong>Process Name</strong></th>
              <th><strong>Parameter Values</strong></th>
            </tr>
            {#each $study.processSequence as p, idx}
              {@const process: Process = p}
              {#if process?.executesProtocol?.name === protocol.name}
                <tr>
                  <td>
                    <button class="link" onclick={() => openProcess(idx)}>{process.name}</button>
                  </td>
                  <td>
                    <table class="subtable">
                      <tbody>
                        {#if process?.parameterValues?.length === 0}
                          <tr>
                            <td colspan="3">No parameter values were defined for this process.</td>
                          </tr>
                        {:else}
                          {#each process.parameterValues as parameterValue}
                            <tr>
                              <td>{parameterValue?.category?.parameterName?.annotationValue ?? "-"}</td>
                              {#if isOntologyValue(parameterValue)}
                                <td>{parameterValue?.value?.annotationValue ?? "-"}</td>
                                <td>{"[Value is ontology]"}</td>
                              {:else}
                                <td>{parameterValue?.value ?? "-"}</td>
                                <td>{parameterValue?.unit?.annotationValue ?? "-"}</td>
                              {/if}
                            </tr>
                          {/each}
                        {/if}
                      </tbody>
                    </table>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>

<style>
  table#protocol {
    width: 100%;
    border-collapse: collapse;
    border: 0px solid rgb(160, 160, 160);
  }

  table#protocol > tbody > tr > td {
    border-top: 1px solid rgb(180, 180, 180);
    padding: 12px 10px;
    vertical-align: top;
  }

  table#protocol > tbody > tr:nth-child(1) > td {
    border: 0;
  }

  table#protocol > tbody > tr > td:nth-child(1) {
    font-weight: 500;
    width: 200px;
  }

  table.subtable {
    border-collapse: collapse;
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
