<script>
    
import get from 'lodash.get';
import set from 'lodash.set';

import { setContext, onMount, afterUpdate, tick, createEventDispatcher } from 'svelte';

setContext('isaLevel', 'investigation');
const dispatch = createEventDispatcher();


//import { questionnaire } from '@/stores/questionnaire';
import { wizard } from '@/stores/wizard';
import { config } from '@/stores/config';
import { isaObj } from '@/stores/isa';
import { hooksExecuted } from '@/stores/hooksExecuted';

import Schemas from '@/lib/schemas.js';


import Date from '@/components/isa/generic/Date.svelte';
import People from '@/components/isa/generic/People.svelte';
import Studies from '@/components/isa/study/Studies.svelte';
import String from '@/components/isa/generic/String.svelte';
import Textarea from '@/components/isa/generic/Textarea.svelte';
import ResearchOrganizationRegistryPicker from '../isa/generic/ResearchOrganizationRegistryPicker.svelte';
import Publications from '../isa/generic/Publications.svelte';

//import MultipleChoice from '@/components/questionnaire/MultipleChoice.svelte';

import Materials from '@/components/isa/generic/materials/Materials.svelte';
import StudyTemplateGenerator from '@/components/StudyTemplateGenerator.svelte';
import ProtocolParametersSelect from '../isa/study/ProtocolParametersSelect.svelte';
import FactorsSelect from '../isa/study/FactorsSelect.svelte';
import Uploader from '../isa/generic/Uploader.svelte';
import LicensePicker from '../isa/generic/LicensePicker.svelte';
import Location from '../isa/generic/Location.svelte';

import FieldWrapperJsonPathNative from './wrappers/FieldWrapperJsonPathNative.svelte';
import FieldWrapperJsonPathComment from './wrappers/FieldWrapperJsonPathComment.svelte';
import ComponentWrapperJsonPath from './wrappers/ComponentWrapperJsonPath.svelte';
import StudyProcesses from '../isa/study/StudyProcesses.svelte';
import Parameters from '../isa/study/Parameters.svelte';
    import ProtocolComponents from '../isa/study/ProtocolComponents.svelte';
    import OntologyAnnotation from '../isa/generic/OntologyAnnotation.svelte';
    import OntologyPicker from '../isa/generic/OntologyPicker.svelte';
    import AssayProcesses from '../isa/assay/AssayProcesses.svelte';
    import TextSelect from '../isa/generic/TextSelect.svelte';

const fieldTypes = {
    'text': String,
    'textarea': Textarea,
    'date': Date,
    'ror': ResearchOrganizationRegistryPicker,
    'license': LicensePicker,
    'location': Location,
    'parameters': Parameters,
    'components': ProtocolComponents,
    'ontology_annotation': OntologyAnnotation,
    'text-select': TextSelect,
}

const components = {
    'Publications': Publications,
    'StudyTemplateGenerator': StudyTemplateGenerator,
    'Materials': Materials,
    'ProtocolParametersSelect': ProtocolParametersSelect,
    'FactorsSelect': FactorsSelect,
    'Uploader': Uploader,
    'People': People,
    'StudyProcesses': StudyProcesses,
    'AssayProcesses': AssayProcesses,
    'OntologyPicker': OntologyPicker,
}

let steps = config.steps;

$wizard.steps = steps.length;

let currentStep = 0;



const hooks = {
    'addStudy': addStudy,
    'addProtocol': addProtocol,
    'addAssay': addAssay,
}

function addStudy() {
    let emptyStudy = Schemas.getMiappeStudy();
    $isaObj['studies'] = [ ...$isaObj['studies'], emptyStudy];
}

function addAssay() {
    let emptyAssay = Schemas.getObjectFromSchema('assay');
    $isaObj['studies'][0]['assays'] = [ ...$isaObj['studies'][0]['assays'], emptyAssay];
}

async function addProtocol(params) {
    if (!params) {
        alert('Error: Using the addProtocol hook without parameters is not allowed. Please correct the steps configuration!');
        return false;
    }
    let emptyProtocol = Schemas.getObjectFromSchema('protocol');
    emptyProtocol.protocolType = Schemas.getObjectFromSchema('ontology_annotation');
    
    emptyProtocol.name = params?.protocolName? params.protocolName : '';
    emptyProtocol.description = params?.protocolDescription? params.protocolDescription : '';
    emptyProtocol.version = params?.protocolVersion? params.protocolVersion : '';
    emptyProtocol.protocolType= params?.protocolType?? params.protocolType;
    
    if (params.protocolParameters !== undefined) {
        for (let parameterName of params.protocolParameters) {
            let emptyParameter = Schemas.getObjectFromSchema('protocol_parameter');
            emptyParameter.parameterName = parameterName;
            
            let comment = Schemas.getObjectFromSchema('comment');
            comment.name = 'value';
            comment.value = '';
            emptyParameter.comments = [comment];
            
            let commentDeleteable = Schemas.getObjectFromSchema('comment');
            commentDeleteable.name = 'deletable';
            commentDeleteable.value = 'false';
            emptyParameter.comments = [...emptyParameter.comments, commentDeleteable];

            let commentUnit = Schemas.getObjectFromSchema('comment');
            commentUnit.name = 'unit';
            commentUnit.value = Schemas.getObjectFromSchema('ontology_annotation');
            commentUnit.value.annotationValue = '';
            emptyParameter.comments = [...emptyParameter.comments, commentUnit];
            
            emptyProtocol.parameters = [...emptyProtocol.parameters, emptyParameter];
        }
    }
    
    $isaObj['studies'][0]['protocols'] = [ ...$isaObj['studies'][0]['protocols'], emptyProtocol];
    $isaObj = $isaObj;
}


async function initFirstStep() {
    executeStepHooks(0);
}

async function prev() {
    currentStep = currentStep - 1;
    $wizard.currentStep = currentStep;
}

async function next() {
    currentStep = currentStep + 1;
    $wizard.currentStep = currentStep;
    executeStepHooks(currentStep);
}

function executeStepHooks(step) {
    if (steps[step] && steps[step].hooks !== undefined && Array.isArray(steps[step].hooks)) {
        for (let hook of steps[step].hooks) {
            const hookId = hook.type+'_'+step;
            if (!$hooksExecuted.includes(hookId)) {
                hooks[hook.type](hook?.parameters);
                $hooksExecuted = [...$hooksExecuted, hookId];
                console.log('execute hook: ', steps[step].hook);
            }
        }
    }
}


function handleKeypress() {
    
}


const forceUpdate = async (_) => {};
let doRerender = 0;

onMount(() => {
    initFirstStep();
});
    
    
</script>

<section>

    {#if Object.keys($isaObj).length > 0}
    
    {#await forceUpdate(doRerender) then _}
    
    <h2 style="margin:0; font-weight: 700; font-size: 1.3em;">Step {currentStep+1} of {steps.length}</h2>
    
    <p id="question">{steps[currentStep].title}</p>
    
    <div class="input-wrapper">
        
        <div on:keypress={handleKeypress} role="button" tabindex="0" aria-pressed="false">
            
            {#key currentStep}
            
                {#if steps[currentStep].text}
                    {#each steps[currentStep].text as paragraph}
                        <p>{paragraph}</p>
                    {/each}
                {/if}
                
                {#if steps[currentStep].fields}
                    {#each steps[currentStep].fields as field, i}
                        {#if field.isaMapping.jsonPath && !field.isaMapping.commentName}
                            <FieldWrapperJsonPathNative
                                component={fieldTypes[field.type]} 
                                jsonPath={field.isaMapping.jsonPath} 
                                field={field}
                            />
                        {:else if field.isaMapping.jsonPath && field.isaMapping.commentName}
                            <FieldWrapperJsonPathComment 
                                component={fieldTypes[field.type]} 
                                jsonPath={field.isaMapping.jsonPath} 
                                field={field}
                            />
                        {/if}
                    {/each}
                {/if}
                
                {#if steps[currentStep].component}
                <ComponentWrapperJsonPath
                    component={components[steps[currentStep].component]}
                    jsonPath={steps[currentStep].jsonPath}
                    componentConfig={steps[currentStep].componentConfig}
                />
                {/if}
            
            {/key}
            
        </div>
        
    </div>
    
    <div style="margin-top: 45px; display: flow-root;">
        {#if currentStep > 0}
        <button class="btn large" on:click={() => prev()}>Previous</button>
        {/if}
        
        {#if currentStep < (steps.length-1)}
        <button class="btn large float-right" on:click={() => next()}>Next</button>
        {:else}
        <button class="btn large float-right" on:click={() => dispatch('closeWizard')}>Close wizard</button>
        {/if}
        
    </div>
    
    {/await}
    
    {/if}
</section>

<style>
#question {
    font-weight: 500;
    font-size: 115%;
    color: rgb(30,30,30);
    margin-bottom: 40px;
}

.input-wrapper {
    /*background: rgb(240,240,240);*/
    padding: 0px;
    border: 0px solid rgb(200,200,200);
}

:global(input[type="text"]) {
    /*width: 80%;*/
}

.float-right {
    float: right;
}
</style>