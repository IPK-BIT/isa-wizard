<script lang="ts">

import get from 'lodash.get';
import set from 'lodash.set';


import TableLoader from "./TableLoader.svelte";
import { DataFrame } from "dataframe-js";
import Schema from "@/lib/schemas.js";
import { onMount } from "svelte";

import { isaObj } from '@/stores/isa';

let study;
export { study as value };
export let jsonPath;

//FIXME: In Expert mode this is not working as it only checks on component creation, but not if the parameter value is changed later
onMount(()=>{
    let growth_protocol = study.protocols.find(protocol => protocol.name === 'Growth');
    if (study.processSequence.length > 0) {
        let growth_process = study.processSequence.find(process => {
            return process.executesProtocol.name === 'Growth'
        })
        if (growth_process) {
            for (let parameterValue of growth_process.parameterValues) {
                let protocol_parameter = growth_protocol.parameters.find(parameter => parameter.parameterName.annotationValue === parameterValue.category.parameterName.annotationValue)
                if (protocol_parameter) {
                    parameterValue.value = protocol_parameter.comments[0].value;
                }
            }
            growth_process= growth_process;
        }
    }
})

//TODO: Add to config
let template = new Blob(["Art_calc,Jahr_calc,Sortiment_calc,BKR_Nr,BKR_Bezeichnung,Anbaugebiet_Nr,Anbaugebiete,Standort_calc,Bundeslandkuerzel,DATUM,BBCH_VON,BBCH,BBCH_BIS,Termin,Merkmal,MerkmalsBez,StufenNrFak1,StufenNrFak2,Wdh,Sorte,Status,KennNr,Wert"], { type: 'text/csv;charset=utf-8,' });
let mode: 'long'|'wide' = 'long';
let sample_key = 'Sorte,StufenNrFak1,StufenNrFak2,Wdh'
let source_key = 'Sorte';
let dataframe_keys = 'DATUM,BBCH_VON,BBCH,BBCH_BIS,Merkmal,Wert'
let characterisitcs = 'Anbaugebiete,Standort_calc,Jahr_calc,Art_calc';
let previewSize = 5;

function writeStudy(df){
    let groupedDF = df 
        .groupBy(...source_key.split(','))
        .toCollection();

    study.materials.sources = [];
    study.materials.samples = [];
    study.processSequence = [];

    let process = Schema.getObjectFromSchema('process');
    groupedDF.forEach((source_group) => {
        let source = Schema.getSource(
            Object.values(source_group.groupKey)[0], 
            source_group.group.select(...characterisitcs.split(',')).toCollection()[0]
        );
        study.materials.sources = [...study.materials.sources, source];

        source_group.group.groupBy(...sample_key.split(',')).toCollection().forEach((sample_group) => {
            process.inputs = [...process.inputs, source];
            let sample = Schema.getObjectFromSchema('sample');
            sample.name = Object.values(sample_group.groupKey).join('-');
            // sample.derivesFrom = [source];
            study.materials.samples = [...study.materials.samples, sample];
            process.outputs = [...process.outputs, sample];
        });    
    });

    let growth_protocol = study.protocols.find(protocol => protocol.name === 'Growth');

    
    // process.inputs = study.materials.sources;
    process.executesProtocol = growth_protocol;
    process.parameterValues = growth_protocol.parameters.map(parameter => {
        let value = parameter.comments[0].value;
        let process_parameter_value = Schema.getObjectFromSchema('process_parameter_value');
        process_parameter_value.category = parameter;
        process_parameter_value.value = value
        return process_parameter_value;
    });
    // process.outputs = study.materials.samples;

    study.processSequence = [...study.processSequence, process];
}

function writeAssay(df) {
    let phenotyping_protocol = Schema.getObjectFromSchema('protocol');
    phenotyping_protocol.name = 'Phenotyping';
    study.protocols = [study.protocols[0], phenotyping_protocol];
    
    study.assays = [];
    let assay = Schema.getObjectFromSchema('assay');
    assay.materials.samples = study.materials.samples;
    assay.dataFiles = [];

    
    let datafileContent = Schema.getObjectFromSchema('comment');
    datafileContent.name = 'Content';
    datafileContent.value = JSON.stringify(
        df.select(...sample_key.split(','), ...dataframe_keys.split(','))
        .withColumn(
            'Sample Name', 
            row => sample_key.split(',').map(key => row.get(key)).join('-')
        )
        .select('Sample Name', ...dataframe_keys.split(','))
        .toCollection()
    );

    let dataFile = Schema.getObjectFromSchema('data');
    dataFile.name = 'phenotyping-results.csv';
    dataFile.type = 'Raw Data File';
    dataFile.comments = [datafileContent];
    assay.dataFiles = [...assay.dataFiles, dataFile];

    assay.processSequence = [];
    let process = Schema.getObjectFromSchema('process');
    process.inputs = study.materials.samples;
    process.executesProtocol = phenotyping_protocol;
    //create an array of length process.inputs.length with the value dataFile
    process.outputs = Array(process.inputs.length).fill(dataFile);
    assay.processSequence = [...assay.processSequence, process];

    study.assays = [...study.assays, assay];
}

function handleApprove(event) {
    let df = new DataFrame(event.detail.detail.rows, event.detail.detail.columns)
    
    writeStudy(df);
    writeAssay(df);

    set($isaObj, jsonPath, study);
    $isaObj = $isaObj;
}
</script>

<section>
    <div class="attr">
        <TableLoader bind:template on:approve={handleApprove}/>
        {#if study.processSequence.length > 0}
        <h3>Materials</h3>
        <table>
            <thead>
                <th>Source Name</th>
                {#each study.materials.sources[0].characteristics as characteristic}
                <th>{characteristic.category.characteristicType.annotationValue}</th>
                {/each}
                <!-- Uncomment, if the growth protocol parameter values defined previously should be displayed-->
                <!-- 
                    {#each study.protocols[0].parameters as parameter}
                    <th>{parameter.parameterName.annotationValue}</th>
                    {/each} 
                -->
                <th>Sample Name</th>
            </thead>
            <tbody>
                {#each study.processSequence as process}
                {#each process.outputs.slice(0,previewSize) as output, j}
                <tr>
                    <td>{process.inputs[j].name}</td>
                    {#each process.inputs[j].characteristics as characteristic}
                    <td>{characteristic.value}</td>
                    {/each}
                    <!-- Uncomment, if the growth protocol parameter values defined previously should be displayed-->
                    <!-- 
                        {#each process.parameterValues as process_parameter_value}
                        <td>{process_parameter_value.value}</td>
                        {/each} 
                    -->
                    <td>{output.name}</td>
                </tr>
                {/each}
                {/each}
            </tbody>
        </table> 
        {#if study.processSequence[0].outputs.length > previewSize}
        <p class="info-box">
            Only the first {previewSize} of {study.processSequence[0].outputs.length} rows are shown here.
        </p>
        {/if}
        {#if study.assays[0].processSequence.length > 0}
        <h3>Samples</h3>
        <table>
            <thead>
                <th>Sample Name</th>
                <th>Protocol</th>
                <th>Data File</th>
            </thead>
            <tbody>
                {#each study.assays[0].processSequence as process}
                {#each process.inputs.slice(0,previewSize) as input,i}
                <tr>
                    <td>{input.name}</td>
                    <td>{process.executesProtocol.name}</td>
                    <td>{process.outputs[i].name}</td>
                </tr>
                {/each}
                {/each}
            </tbody>
        </table> 
        {#if study.assays[0].processSequence[0].inputs.length > previewSize}
        <p class="info-box">
            Only the first {previewSize} of {study.assays[0].processSequence[0].inputs.length} rows are shown here.
        </p>
        {/if} 
        {/if}
        {/if}
    </div>
</section>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        overflow: auto;
    }
    
    thead {
        background-color: #f2f2f2;
    }
    
    th {
        padding: 10px;
        text-align: left;
        font-weight: bold;
    }
    
    tbody tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    tbody tr:hover {
        background-color: #e9e9e9;
    }
    
    td {
        padding: 10px;
    }
    p.info-box {
        margin-top: 1em;
        background-color: #f2f2f2;
        padding: 1em;
        text-align: center;
    }    
</style>