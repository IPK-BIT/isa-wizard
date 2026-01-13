<script>
    import Schemas from "@/lib/schemas";
    import { isaObj } from "@/stores/isa";
    import { value } from "@nfdi4plants/arctrl/fable_modules/fable-library.4.5.0/Option";
    import set from "lodash.set";
    import Svelecte from "svelecte";
    import { onMount } from "svelte";
    import OntologyAnnotation from "../generic/OntologyAnnotation.svelte";
    import String from "../generic/String.svelte";


    export let label = '';
    export let isaLevel = null;
    export let attr;
    let parameters;
    export { parameters as value };
    export let showLabel = true;
    export let componentConfig = {};

    let selectedParameter;

    let parameterValues = {};
    let parameterUnits = {};

    async function handleFetch(query) {
        const response = await fetch('https://swate-alpha.nfdi4plants.org/api/IOntologyAPIv3/searchTerm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{
                query: query,
                ontology: null,
                limit: 10,
                searchMode: null,
                parentTermId: null                
            }])
        });
        const data = await response.json();
        return data.map(option => {
            return {
                value: option.Accession,
                label: option.Name,
                ontology: option.FK_Ontology
            }
        });        
    }

    function remove(param) {
        parameters = parameters.filter(parameter => {
            return parameter.parameterName.annotationValue !== param.parameterName.annotationValue;
        });
        parameterValues[param.parameterName.annotationValue] = undefined;
        parameterUnits[param.parameterName.annotationValue] = undefined;
    }

    function update() {
        console.log('update');
        parameters.forEach(parameter => {
            parameter.comments.forEach(comment => {
                if (comment.name === 'value') {
                    comment.value = parameterValues[parameter.parameterName.annotationValue] ?? '';
                }
                if (comment.name === 'unit') {
                    comment.value = parameterUnits[parameter.parameterName.annotationValue] ?? '';
                }
            });
        });
        parameters = parameters;
    }

    function init() {
        parameters.forEach(parameter => {
            parameter.comments.forEach(comment => {
                if (comment.name === 'value') {
                    parameterValues[parameter.parameterName.annotationValue] = comment.value;
                }
                if (comment.name === 'unit') {
                    if (comment.value==="") {
                        parameterUnits[parameter.parameterName.annotationValue] = Schemas.getObjectFromSchema('ontology_annotation');
                    } else {
                        parameterUnits[parameter.parameterName.annotationValue] = comment.value;
                    }                    
                }
            });
        });
    }

    onMount(()=>{
        init()
    })

    function onChange() {
        let parameter = Schemas.getObjectFromSchema('protocol_parameter');
        parameter.parameterName = Schemas.getObjectFromSchema('ontology_annotation');
        parameter.parameterName.annotationValue = selectedParameter.label;
        parameter.parameterName.termSource = selectedParameter.ontology;
        parameter.parameterName.termAccession = selectedParameter.value;
        let value_comment = Schemas.getComment('value', '');
        let unit_comment = Schemas.getComment('unit', '');
        parameter.comments = [...parameter.comments, value_comment, unit_comment];
        parameters = [...parameters, parameter];
        parameterUnits[selectedParameter.label] = Schemas.getObjectFromSchema('ontology_annotation');
    }

    function ontoRenderer(item, _isSelection, _inputValue) {
        return _isSelection
            ? `${item.label} (${item.value})`
            : `<div style="display: flex; justify-content: space-between;"><span>${item.label}</span><span>${item.value}</span></div>`;
    }

    function createHandler(elem) {
        console.log(elem);
        return {
            value: '',
            label: elem,
            ontology: '',
            $created: true
        }
    }
</script>

<section style="border: 0px solid black;">
    <div class="attr pure-g v-center align-top">
        <div class="pure-u-5-24">
            {#if showLabel}
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label>{label}</label>
            {/if}
        </div>
        <div class="pure-u-19-24 v-center container border">
            <Svelecte creatable createTransform={createHandler} bind:readSelection={selectedParameter} fetch={handleFetch} on:change={onChange} renderer={ontoRenderer} placeholder="Start writing parameters of your growth protocol"/>
            {#if parameters && parameters.length > 0}
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th>Parameter Name</th>
                        <th>Parameter Value</th>
                        <th>Parameter Unit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each parameters as parameter}
                    <tr class="align-center">
                        <td><span>{parameter.parameterName.annotationValue}</span></td>
                        <td>
                            <!-- <input bind:value={parameterValues[parameter.parameterName.annotationValue]} on:change={update}/> -->
                            <String attr="" bind:value={parameterValues[parameter.parameterName.annotationValue]} showLabel={false} on:change={update} />
                        </td>
                        <td>
                            {#if parameterUnits[parameter.parameterName.annotationValue]}
                            <!-- <input bind:value={parameterUnits[parameter.parameterName.annotationValue].annotationValue} on:change={update}/> -->
                             <OntologyAnnotation showLabel={false} bind:value={parameterUnits[parameter.parameterName.annotationValue]} attr="unit" label="Parameter Unit" on:change={update} />
                            {/if}
                        </td>
                        <td>
                            <div style="display: flex; justify-content: end;">
                                {#if !(!parameter.comments.find(c=>c.name==='deletable')?.value === false)}
                                <button class="btn btn-secondary" on:click={()=>remove(parameter)}>Remove</button>
                                {:else}
                                <span style="font-size: small;"><i>Predefined</i></span>
                                {/if}
                            </div>
                        </td>
                    </tr>
                    {/each}
                </tbody>
            </table>
            {/if}
        </div>
    </div>
</section>

<style>
    .align-top {
        display: flex;
        align-items: flex-start;
    }

    td span {
        padding: 5px;
    }

    td input {
        padding: 0 5px;
        /* width: 100%; */
    }

    td button {
        padding: 5px;
    }

    tr {
        border: 1px solid #aaa;
    }

    tr:nth-child(even) {
        background-color: #f6f6f6;
    }

    table {
        border-collapse: collapse;
        margin-top: 5px;
    }

    tr:hover {
        background-color: #f1f1f1;
    }
    
    th,
    td {
        padding: 8px;
    }

    th {
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 5px;
        text-align: left;
        background-color: #4caf50;
        color: white;
    }

    .border {
        border: 1px solid black;
        padding: 1vh;
    }
</style>
