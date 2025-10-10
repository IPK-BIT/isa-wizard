<script>
    import { simpleGuiBreadcrumb, simpleGuiLevel } from "@/stores/wizard";
    import Breadcrumb from "./Breadcrumb.svelte";
    import { isaObj } from "@/stores/isa";

    let protocol;
    export { protocol as value };
    export let jsonPath;

    let study = isaObj.keyed($simpleGuiLevel.jsonPath.split('.')[0]);


    function openProcess(idx) {
        $simpleGuiLevel = {
            type: 'Process',
            jsonPath: `${$simpleGuiLevel.jsonPath.split('.')[0]}.processSequence[${idx}]`
        }

        $simpleGuiBreadcrumb = [
            { name: $isaObj.title ? $isaObj.title : 'Untitled Investigation', fn: () => $simpleGuiLevel = { type: 'Investigation', jsonPath: '' } },
            { name: $study.title ? $study.title : 'Untitled Study', fn: () => $simpleGuiLevel = { type: 'Study', jsonPath: `${$simpleGuiLevel.jsonPath.split('.')[0]}` } },
            { name: `${protocol.name} Protocol`, fn: () => $simpleGuiLevel = { type: 'Protocol', jsonPath: jsonPath } },
            { name: `${$study.processSequence[idx].name} Process`, fn: () => {} }
        ];
    }
</script>

<h3>Protocol</h3>
<Breadcrumb/>

<table id="protocol">
    <tr>
        <td>Name</td>
        <td>{protocol.name}</td>
    </tr>
    <tr>
        <td>URI</td>
        <td>
            <a href={protocol.uri} target="_blank" rel="noopener noreferrer">
                {protocol.uri}
            </a>
        </td>
    </tr>
    <tr>
        <td>Description</td>
        <td>{protocol.description}</td>
    </tr>
    <tr>
        <td>Type</td>
        <td>
            {#if protocol.protocolType}
            <table class="subtable">
                <tr>
                    <th>Type Name</th>
                    <th>Term Source</th>
                    <th>Term Accession</th>
                </tr>
                <tr>
                    <td>{protocol.protocolType.annotationValue}</td>
                    <td>{protocol.protocolType.termSource}</td>
                    <td>{protocol.protocolType.termAccession}</td>
                </tr>
            </table>
            {:else}
            <span>Not specified</span>
            {/if}
        </td>
    </tr>
    <tr>
        <td>Version</td>
        <td>{protocol.version}</td>
    </tr>
    <tr>
        <td>Parameters</td>
        <td>
            <table class="subtable">
                <tr>
                    <th>Parameter Name</th>
                    <th>Term Source</th>
                    <th>Term Accession</th>
                </tr>
                {#each protocol.parameters as parameter}
                    <tr>
                        <td>{parameter.parameterName.annotationValue}</td>
                        <td>{parameter.parameterName.termSource}</td>
                        <td>{parameter.parameterName.termAccession}</td>
                    </tr>
                {/each}
            </table>
        </td>
    </tr>
    <tr>
        <td>Processes</td>
        <td>
            <table class="subtable">
                <tr>
                    <th>Process Name</th>
                    <th>Parameter Values</th>
                </tr>
                {#each $study.processSequence as process, idx}
                {#if process.executesProtocol.name === protocol.name}
                <tr>
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <td><a class="link" on:click={()=>openProcess(idx)}>{process.name}</a></td>
                    <td>
                        <table class="subtable">
                        {#if process.parameterValues.length === 0}
                            <tr>
                                <td colspan="3">No parameter values were defined for this process.</td>
                            </tr>
                        {:else}
                        {#each process.parameterValues as parameterValue}
                            <tr>
                                <td>{parameterValue.category.parameterName.annotationValue}</td>
                                <td>{parameterValue.value}</td>
                                <td>{parameterValue.unit.annotationValue}</td>
                            </tr>
                        {/each}
                        {/if}
                        </table>
                    </td>
                </tr>
                {/if}
                {/each}
            </table>
        </td>
    </tr>
</table>

<style>    
    table#protocol {
        width: 100%;
        border-collapse: collapse;
        border: 0px solid rgb(160,160,160);
    }

    table#protocol > tr > td {
        border-top: 1px solid rgb(180,180,180);
        padding: 12px 10px;
        vertical-align: top;
    }

    table#protocol > tr:nth-child(1) > td {
        border: 0;
    }

    table#protocol > tr > td:nth-child(1) {
        font-weight: 500;
        width: 200px;
    }

    table.subtable {
        border-collapse: collapse;
    }

    table.subtable > tr > td {
        padding: 5px 40px 5px 5px;
        border-top: 1px solid rgb(200,200,200);
    }

    table.subtable tr th {
        padding: 5px 40px 5px 5px;
        font-weight: 500;
        text-align: left;
    }

    .link {
        color: hsl(145, 83%, 28%);
        cursor: pointer;
    }
</style>