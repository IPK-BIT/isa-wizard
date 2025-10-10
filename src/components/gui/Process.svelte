<script>
    import { simpleGuiBreadcrumb, simpleGuiLevel } from "@/stores/wizard";
    import Breadcrumb from "./Breadcrumb.svelte";
    import Pagination from "./Pagination.svelte";
    import { isaObj } from "@/stores/isa";

    let process;
    export { process as value };
    export let jsonPath;

    $: updateSequence(process)

    let previousProcess;
    let nextProcess;

    let study;

    function updateSequence(p) {
    if (process.previousProcess['@id']) {
            previousProcess = isaObj.keyed(`${$simpleGuiLevel.jsonPath.split('.')[0]}.processSequence[${parseInt($simpleGuiLevel.jsonPath.split('.')[1].split('[')[1].split(']')[0]) - 1}]`)
        }
        if (process.nextProcess['@id']) {
            nextProcess = isaObj.keyed(`${$simpleGuiLevel.jsonPath.split('.')[0]}.processSequence[${parseInt($simpleGuiLevel.jsonPath.split('.')[1].split('[')[1].split(']')[0]) + 1}]`)
        }
        study = isaObj.keyed($simpleGuiLevel.jsonPath.split('.')[0]);
    }    

    let page=0;
    let pageSize=10;

    function openProcess(process) {        
        $simpleGuiBreadcrumb.pop();
        $simpleGuiBreadcrumb.pop();
        for (let i=0; i<$study.protocols.length; i++) {
            if ($study.protocols[i]['name'] === process.executesProtocol['name']) {
                $simpleGuiBreadcrumb = [
                    ...$simpleGuiBreadcrumb,
                    { name: `${$study.protocols[i].name} Protocol`, fn: () => $simpleGuiLevel = { type: 'Protocol', jsonPath: `${$simpleGuiLevel.jsonPath.split('.')[0]}.protocols[${i}]` } },
                    { name: `${process.name} Process`, fn: () => {} }
                ];
                break;
            }
        }

        for (let i=0; i<$study.processSequence.length; i++) {
            if ($study.processSequence[i]['@id'] === process['@id']) {
                $simpleGuiLevel = {
                    type: 'Process',
                    jsonPath: `${$simpleGuiLevel.jsonPath.split('.')[0]}.processSequence[${i}]`
                };
                break;
            }
        }
    }
</script>

<h3>Process</h3>
<Breadcrumb/>

<table id="process">
    <tr>
        <td>Name</td>
        <td>{process.name}</td>
    </tr>
    <tr>
        <td>Performer</td>
        <td>{process.performer}</td>
    </tr>
    <tr>
        <td>Date</td>
        <td>{process.date}</td>
    </tr>
    <tr>
        <td>Previous Process</td>
        <td>
        {#if process.previousProcess['@id']}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="link" on:click={()=>openProcess($previousProcess)}>{$previousProcess.name}</a>
        {:else}
            <span>No previous process.</span>
        {/if}
        </td>
    </tr>
    <tr>
        <td>Next Process</td>
        <td>
        {#if process.nextProcess['@id']}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="link" on:click={()=>openProcess($nextProcess)}>{$nextProcess.name}</a>
        {:else}
            <span>No next process.</span>
        {/if}
        </td>
    </tr>
    <tr>
        <td>Details</td>
        <td>
            <table class="subtable">
                <tr>
                    <th>Input</th>
                    <th>Protocol</th>
                    {#each process.parameterValues as parameterValue}
                        <th>{parameterValue.category.parameterName.annotationValue}</th>                        
                    {/each}                    
                    <th>Output</th>
                </tr>
                {#each process.inputs as input, idx}
                {#if idx >= page * pageSize && idx < (page + 1) * pageSize}
                    <tr>
                        <td>{input.name}</td>
                        <td>{process.executesProtocol.name}</td>
                        {#each process.parameterValues as parameterValue}
                            <td>{parameterValue.value} {parameterValue.unit.annotationValue}</td>
                        {/each}
                        <td>{process.outputs[idx].name}</td>
                    </tr>
                {/if}
                {/each}
            </table>
                <Pagination
                    totalCount={process.inputs.length}
                    bind:pageSize={pageSize}
                    bind:currentPage={page}
                />
        </td>
    </tr>
</table>

<style>
    table#process {
        width: 100%;
        border-collapse: collapse;
        border: 0px solid rgb(160,160,160);
    }

    table#process > tr > td {
        border-top: 1px solid rgb(180,180,180);
        padding: 12px 10px;
        vertical-align: top;
    }

    table#process > tr:nth-child(1) > td {
        border: 0;
    }

    table#process > tr > td:nth-child(1) {
        font-weight: 500;
        width: 200px;
    }

    table.subtable {
        border-collapse: collapse;
        overflow: auto;
        display: block;
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