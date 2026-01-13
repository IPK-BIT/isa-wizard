<script>
export let value;
export let jsonPath;
export let componentConfig = {};

import { onMount } from 'svelte';

import get from 'lodash.get';
import set from 'lodash.set';

import Schemas from '@/lib/schemas';

import { config } from '@/stores/config';
import { isaObj } from '@/stores/isa';

import { keyBy } from '@/lib/utils';

let parameters = [];
let parameterValues = {};
let parametersPredefined = [];

let selectedParameterNames = [];

console.log(componentConfig);

let parametersAvailable;
if (componentConfig.protocolId) {
    //label = componentConfig.label;
    let allDefaultProtocols = keyBy(config.checklist.defaultProtocols, 'id');
    console.log(allDefaultProtocols);
    parametersAvailable = allDefaultProtocols[componentConfig.protocolId].parameters
} else {
    parametersAvailable = config.checklist.defaultProtocols[0].parameters
}


function addParameter(parameterName) {
    if (!selectedParameterNames.includes(parameterName)) {
        selectedParameterNames = [...selectedParameterNames, parameterName];

        let newParameter = _getParameter(parameterName);
        parameters = [...parameters, newParameter];
        set($isaObj, jsonPath, parameters);
        $isaObj = $isaObj;
    }
}

function removeParameter(parameterName) {
    parameters = parameters.filter(parameter => {
        return parameter.parameterName.annotationValue !== parameterName
    });

    set($isaObj, jsonPath, parameters);
    $isaObj = $isaObj;

    parameters = get($isaObj, jsonPath);
    selectedParameterNames = parameters.map(o => o.parameterName.annotationValue);
}

function _getParameter(parameterName) {
    let parameter = Schemas.getObjectFromSchema('protocol_parameter');
    parameter.parameterName = Schemas.getObjectFromSchema('ontology_annotation');
    parameter.parameterName.annotationValue = parameterName;

    let commentForValue = Schemas.getObjectFromSchema('comment');
    commentForValue.name = 'value';
    commentForValue.value = '';
    parameter.comments = [commentForValue];
    return parameter;
}

function update() {
    parameters.forEach(parameter => {
        parameter.comments.forEach(comment => {
            if (comment.name === 'value') {
                comment.value = parameterValues[parameter.parameterName.annotationValue] ?? '';
            }
        })
    });

    set($isaObj, jsonPath, parameters);
    $isaObj = $isaObj;
}

function init() {
    parameters = get($isaObj, jsonPath);
    selectedParameterNames = parameters.map(o => o.parameterName.annotationValue);

    parametersPredefined = parameters.map(o => {
        let isPredefined = o.comments.find(comment => comment.name === 'deletable' && comment.value === 'false');
        if (isPredefined) {
            return o.parameterName.annotationValue;
        } else {
            return undefined;
        }
    });

    if (parameters.length > 0) {
        let selectedParameterValues = parameters.map(o => [
            o.parameterName.annotationValue,
            o.comments.find((c) => c.name == 'value')['value']
        ]);
        parameterValues = Object.fromEntries(selectedParameterValues);
    }
}

onMount(() => {
    init();
});

</script>

<section>

    {#if parameters.length > 0}
    <div id="selected-parameters">
        <span>You have selected the following constant parameters:<br /></span>
        <table id="parameters-selected">
            <tr>
                <th style="width: 200px;">Parameter</th>
                <th style="width: 300px; text-align: left;">Description</th>
                <th>Value</th>
                <th></th>
            </tr>
        {#each parameters as parameter}
        <tr>
            <td>{parameter.parameterName.annotationValue}</td>
            <td>{parametersAvailable.find(param => param.label == parameter.parameterName.annotationValue).explanation}</td>
            <td><input type="text" style="width: 250px; text-align: center;" bind:value={parameterValues[parameter.parameterName.annotationValue]} on:change={() => update()} /></td>
            <td>
                {#if parametersPredefined.includes(parameter.parameterName.annotationValue)}
                <i>Predefined Parameter</i>
                {:else}
                <button class="btn btn-warning" on:click={() => removeParameter(parameter.parameterName.annotationValue)}>Remove</button>
                {/if}
            </td>
        </tr>
        {/each}
        </table>
    </div>
    {/if}


    {#if parametersAvailable.filter(parameter => !selectedParameterNames.includes(parameter.label) ).length > 0}
    <div style="height: 400px; padding-right: 10px; overflow-y: scroll;">
        <table id="parameters-predefined">
            <tr>
                
                <th style="width: 250px;">Parameter</th>
                <th>Description</th>
                <th></th>
            </tr>
            {#each parametersAvailable as parameter}
            {#if !selectedParameterNames.includes(parameter.label)}
            <tr>
                
                <td>{parameter.label}</td>
                <td>{parameter.explanation}</td>
                <td><button class="btn btn-secondary" on:click={() => addParameter(parameter.label)}>Add</button></td>
            </tr>
            {/if}
            {/each}
        </table>
    </div>
    {/if}

</section>

<style>
#selected-parameters {
    border: 1px solid rgb(100, 100, 100);
    background: rgb(240,240,240);
    padding: 20px;
    margin-bottom: 40px;
}

#selected-parameters span {
    font-weight: 500;
}

table#parameters-predefined {
    border-collapse: collapse;
}

table#parameters-predefined tr td, table#parameters-predefined tr th {
    border: 1px solid rgb(130,130,130);
    padding: 3px 6px 3px 6px;
    font-size: 0.9em;
}

table#parameters-predefined tr th {
    font-weight: 500;
    background: rgb(240,240,240);
}


table#parameters-selected {
    border-collapse: collapse;
    margin-top: 30px;
}

table#parameters-selected tr td, table#parameters-selected tr th {
    border: 0px solid rgb(130,130,130);
    padding: 3px 6px 3px 6px;
    font-size: 0.9em;
}



table#parameters-selected tr th {
    font-weight: 500;
    background: rgb(240,240,240);
    font-size: 1em;
}

table#parameters-selected tr th:nth-child(1) {
    text-align: left;
}

table#parameters-selected tr td:nth-child(1) {
    padding-right: 30px;
}
</style>