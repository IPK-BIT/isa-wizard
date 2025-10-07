<script lang="ts">
    import Schemas from "@/lib/schemas";
    import TableUpload from "../generic/TableUpload.svelte";
    import { isaObj } from "@/stores/isa";
    // import { cons } from "@nfdi4plants/arctrl/fable_modules/fable-library.4.5.0/List";

    // export let componentConfig;
    // export let jsonPath;
     // export let value;

    let {componentConfig, value=$bindable() } = $props();

    function loadTable(e) {
        console.log("Table loaded", e);
        let column_mapping = e.column_mapping;
        let dataframe = e.dataframe;

        let rowProcesses = [];
        // @ts-ignore
        $isaObj.studies[0].protocols.forEach((protocol, i) => {
            let isFirst = i == 0, 
                // @ts-ignore
                isLast = i == $isaObj.studies[0].protocols.length - 1;
            let process = Schemas.getObjectFromSchema("process");
            process['@id'] = '#Process_' + protocol.name.replace(/\s+/g, '_');
            process.name = protocol.name;
            process.executesProtocol = protocol;

            if (!isFirst) {
                process.previousProcess = {'@id': rowProcesses[rowProcesses.length - 1]['@id']};
            }
            if (!isLast) {
                // @ts-ignore Name of the next process is not available yet, but can be derived from the next protocol name
                process.nextProcess = {'@id': '#Process_' + $isaObj.studies[0].protocols[i + 1].name.replace(/\s+/g, '_')};
            }

            process.inputs = [];
            process.outputs = [];

            let inputColumn = dataframe.listColumns().find(c => column_mapping[c].type == 'input');
            let characteristicColumns = dataframe.listColumns().filter(c => column_mapping[c].type == 'characteristic');
            let outputColumn = dataframe.listColumns().find(c => column_mapping[c].type == 'output');
            let factorColumns = dataframe.listColumns().filter(c => column_mapping[c].type == 'factor');
            

            for (let row of dataframe) {
                let source = Schemas.getObjectFromSchema("source");
                let sample = Schemas.getObjectFromSchema("sample");

                if (isFirst) {
                    source['@id'] = '#Source_' + row.get(inputColumn).replace(/\s+/g, '_');
                    source.name = row.get(inputColumn);

                    characteristicColumns.forEach(c => {
                         console.log("Characteristic column", $state.snapshot(column_mapping[c]), $state.snapshot(row.get(c)));
                        let characteristic = Schemas.createCharacteristicObject(column_mapping[c].value.label, row.get(c));
                        characteristic.category.characteristicType.termSource = column_mapping[c].value.ontology_name;
                        characteristic.category.characteristicType.termAccession = column_mapping[c].value.short_form;
                        source.characteristics = [...source.characteristics, characteristic];
                    });

                    // @ts-ignore
                    if (!$isaObj.studies[0].materials.sources.find(s => s['@id'] === source['@id'])) {
                        // @ts-ignore
                        $isaObj.studies[0].materials.sources = [...$isaObj.studies[0].materials.sources, source];
                    }
                } else {
                    // @ts-ignore
                    source['@id'] = '#Source_' + row.get(inputColumn).replace(/\s+/g, '_') + "-" + $isaObj.studies[0].protocols[i-1].name.replace(/\s+/g, '_');
                    // @ts-ignore
                    source.name = row.get(inputColumn) + "-" + $isaObj.studies[0].protocols[i-1].name;
                }
                if (isLast) {
                    sample['@id'] = '#Sample_' + row.get(outputColumn).replace(/\s+/g, '_');
                    sample.name = row.get(outputColumn);

                    factorColumns.forEach(c => {
                        console.log("Factor column", $state.snapshot(column_mapping[c]), $state.snapshot(row.get(c)));
                        let factorValue = Schemas.getObjectFromSchema("factor_value");
                        factorValue.category = Schemas.getObjectFromSchema("factor");
                        factorValue.category.factorName = column_mapping[c].value.label;
                        factorValue.category.factorType = Schemas.getObjectFromSchema("ontology_annotation");
                        factorValue.category.factorType.annotationValue = column_mapping[c].value.label;
                        factorValue.category.factorType.termSource = column_mapping[c].value.ontology_name;
                        factorValue.category.factorType.termAccession = column_mapping[c].value.short_form;
                        factorValue.value = row.get(c);
                        sample.factorValues = [...sample.factorValues, factorValue];
                    })

                    // @ts-ignore
                    if (!$isaObj.studies[0].materials.samples.find(s => s['@id'] === sample['@id'])) {
                        // @ts-ignore
                        $isaObj.studies[0].materials.samples = [...$isaObj.studies[0].materials.samples, sample];
                    }
                } else {
                    // @ts-ignore
                    sample['@id'] = '#Sample_' + row.get(inputColumn).replace(/\s+/g, '_') + "-" + $isaObj.studies[0].protocols[i].name.replace(/\s+/g, '_');
                    // @ts-ignore
                    sample.name = row.get(inputColumn) + "-" + $isaObj.studies[0].protocols[i].name;
                }
                process.inputs = [...process.inputs, source];
                process.outputs = [...process.outputs, sample];

                // console.log("Process", source, sample);
            }

            for (let parameter of protocol.parameters) {
                let parameteValue = Schemas.getObjectFromSchema('process_parameter_value');
                parameteValue.category = parameter;
                parameteValue.value = parameter.comments.find(c => c.name == 'value').value;
                parameteValue.unit = parameter.comments.find(c => c.name == 'unit').value;
                process.parameterValues = [...process.parameterValues, parameteValue];
            }


            rowProcesses.push(process);
        });

        console.log("Row processes", rowProcesses);
        // @ts-ignore
        $isaObj.studies[0].processSequence = [...$isaObj.studies[0].processSequence, ...rowProcesses];
    }

    function resetProcess() {
        value.processSequence = [];
        value.materials.sources = [];
        value.materials.samples = [];
    }

    let df;

    let page = $state(0),
        pageSize = $state(5);

</script>

{#if !(value.processSequence.length>0)}
    <TableUpload
        approve={(event) => loadTable(event)}
    />
{:else}
    <div class="justify-end">
        <button class="btn btn-secondary" onclick={resetProcess}>Reset</button>
    </div>
    <div class="table-responsive">
        <table>
            <thead>
                <tr>
                    {#each value.processSequence as process}
                        {#if Object.keys(process.previousProcess).length===0}
                        <th>Source Name</th>
                        {:else}
                        <th>{process.executesProtocol.name} Input</th>
                        {/if}
                        {#if process.inputs.length > 0}
                        {#each process.inputs[0].characteristics as characteristic}
                            <th>{characteristic.category.characteristicType.annotationValue} {characteristic.category.characteristicType.termAccession?'('+characteristic.category.characteristicType.termAccession+')':''}</th>
                        {/each}
                        {/if}
                        {#if Object.keys(process.nextProcess).length===0}
                        <th>Sample Name</th>
                        {#if process.outputs.length > 0}
                        {#each process.outputs[0].factorValues as factorValue}
                            <th>{factorValue.category.factorType.annotationValue} {factorValue.category.factorType.termAccession?'('+factorValue.category.factorType.termAccession+')':''}</th>
                        {/each}
                        {/if}
                        {/if}
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each value.processSequence[0].inputs as input, idx}
                    {#if idx >= page * pageSize && idx < (page + 1) * pageSize}
                    <tr>
                        {#each value.processSequence as process}
                            <td>{process.inputs[idx].name}</td>
                            {#each process.inputs[idx].characteristics as characteristic}
                                <td>{characteristic.value}</td>
                            {/each}
                            {#if Object.keys(process.nextProcess).length===0}
                            {#if process.outputs[idx]}
                            <td>{process.outputs[idx].name}</td>
                            {#each process.outputs[idx].factorValues as factorValue}
                            <td>{factorValue.value}</td>
                            {/each}
                            {:else}
                            <td>{" "}</td>
                            {/if}
                            {/if}
                        {/each} 
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
        <button onclick={() => (page = Math.ceil(value.processSequence[0].inputs.length / pageSize) - 1)} disabled={page >= Math.ceil(value.processSequence[0].inputs.length / pageSize) - 1} >Last</button>
        <span>Page {page + 1} of {Math.ceil(value.processSequence[0].inputs.length / pageSize)}</span>
    </div>
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
        background-color: hsl(
            var(--neutral-h),
            var(--neutral-s),
            calc(var(--neutral-l) - 10%)
        );
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
