<script>
export let config;

import { setConfig } from './stores/config';
setConfig(config);

import { simpleGuiBreadcrumb, simpleGuiLevel, wizard } from '@/stores/wizard';

import '@fontsource/roboto';
import '@fontsource/roboto/500.css';

import AppCss from './AppCss.svelte';
import Header from '@/components/Header.svelte';
import InitView from '@/components/InitView.svelte';
import Explanation from '@/components/Explanation.svelte';
import TreeView from '@/components/treeview/TreeView.svelte';

import Investigation from '@/components/form/Investigation.svelte';
import GenericQuestionnaire from '@/components/questionnaire/GenericQuestionnaire.svelte';
import Forms from '@/components/Forms.svelte';

import Gui from './components/gui/Gui.svelte';

import { appstate } from '@/stores/appstate';
import { partialview } from '@/stores/partialview';
import { isaObj, isaStr } from '@/stores/isa.js';
import ManualExplanation from '@/components/ManualExplanation.svelte';
import { init } from '@/stores/gitlab-api.js';
import { onMount } from 'svelte';

onMount(async ()=>{
    init()
});

let showJson = false;

// FIXME: there is same duplicate code in InitView.svelte => needs centralization e.g. via EventBus
import Schemas from './lib/schemas';
    import Entity from './components/form/Entity.svelte';
if (config.general?.initialView === 'questionnaire') {
    if (Object.keys($isaObj).length == 0) {
        let emptyInvestigation = Schemas.getMiappeInvestigation(config.prefill);
        $isaObj = emptyInvestigation;
    }
    
    $appstate = appstate.WIZARD;
}

partialview.subscribe($ => {
    if (typeof($.component) === 'function') {
        $appstate = appstate.LEVEL;
    }
});

function showGui() {
    $appstate = appstate.GUI;
    $simpleGuiLevel = {
        type: 'Investigation',
        jsonPath: ''
    };
    $simpleGuiBreadcrumb = [{
        name: $isaObj.title ? $isaObj.title : 'Untitled Investigation',
        fn: () => $simpleGuiLevel = { type: 'Investigation', jsonPath: '' }
    }];
}

function showStudy(i) {
    $appstate = appstate.GUI;
    $simpleGuiLevel = {
        type: 'Study',
        jsonPath: `${$simpleGuiLevel.jsonPath}.studies[${i}]`
    };
    $simpleGuiBreadcrumb = [{
        name: $isaObj.title ? $isaObj.title : 'Untitled Investigation',
        fn: () => $simpleGuiLevel = { type: 'Investigation', jsonPath: '' }
    }, {
        name: $isaObj.studies[i].title ? $isaObj.studies[i].title : 'Untitled Study',
        fn: () => $simpleGuiLevel = { type: 'Study', jsonPath: `${$simpleGuiLevel.jsonPath}.studies[${i}]` }
    }];
}
    
</script>

<main>
    <AppCss />
    
    
    {#if $appstate == appstate.INIT}
    
    <InitView />
    
    {:else}
    
    <div class="content" class:grid={config.general.layoutMode === 'standalone'}>
        
        {#if config.general.layoutMode === 'standalone'}
        <div class="header">
            <Header />
        </div>
        
        
        <div class="leftcol">
            
            {#if $appstate !== appstate.WIZARD}
            <div class="bbox" style="margin-bottom: 20px;">
                <div style="display: flex; flex-direction: column; gap: .5rem;">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a class="link" on:click|preventDefault={showGui}>{$isaObj.title?$isaObj.title:'Untitled Investigation'}</a>
                    <span>Studies ({$isaObj.studies.length})</span>
                    <ul style="margin:0;">
                        {#each $isaObj.studies as study, idx}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <!-- svelte-ignore a11y-missing-attribute -->
                        <li><a class="link" on:click|preventDefault={()=>showStudy(idx)}>{study.title?study.title:'Untitled Study'}</a></li>
                        {/each}
                    </ul>
                </div>
            </div>
            
            <!-- <TreeView /> -->
            {/if}
            
            {#if $appstate === appstate.WIZARD && config?.general?.showQuestionnaireProgressBar}
            <div class="bbox">
                <p style="margin: 0 0 5px 0;">Your progress:</p>
                <div id="progress-bar">
                    <div id="progress" style:width={(($wizard.currentStep / $wizard.steps)*100)+'%'}></div>
                    <div id="progress-percent">{Math.floor(($wizard.currentStep / $wizard.steps)*100)}%</div>
                </div>
            </div>
            {/if}

            {#if $appstate === appstate.WIZARD && config?.general?.showStepExplanation}
            <div class="bbox" style="margin-top: 20px;">
                <p>Step Explanation:</p>
                <div class="expl">
                    <span>
                        {config.steps[$wizard.currentStep].explanation?'' + config.steps[$wizard.currentStep].explanation : 'No explanation available.'}
                    </span>
                </div>
            </div>
            {/if}


        </div>
        {/if}
        
        <div class="middlecol">

            <div class="bbox">
                
            {#if $appstate === appstate.FORM}
            <!-- <Investigation bind:value={$isaObj} /> -->
             <h2>Under Construction. Use with caution</h2>
             <Entity
                type="investigation_schema.json#"
                bind:value={$isaObj}
                showLabel={false}
                idx={null}
            />
            {:else if $appstate === appstate.WIZARD}
            <GenericQuestionnaire on:closeWizard={() => {$appstate = appstate.GUI;}} />
            {:else if $appstate === appstate.LEVEL}
            <Forms />
            {:else if $appstate === appstate.GUI}
            <Gui />
            {/if}
                
            </div>
            
        </div>
        
        {#if config.general.layoutMode === 'standalone'}
        <div class="rightcol">
            <ManualExplanation />
            <Explanation />
            
            {#if $appstate !== appstate.WIZARD || true==true}
            <div class="bbox" id="json">
                <strong>ISA-JSON (<a href="#" on:click={() => showJson = !showJson}>{showJson ? 'hide' : 'show'}</a>)</strong><br />
                {#if showJson}
                <textarea bind:value={$isaStr} id="json-textarea"></textarea>
                {/if}
                
            </div>
            {/if}
        </div>
        
        {/if}
        
    </div>
    {/if}
        
        
</main>
    
<style>
    
#progress-bar {
    border: 0px solid rgb(160,160,160);
    background: rgb(225,225,225);
    height: 25px;
    position: relative;
}

#progress {
    background: rgb(30, 206, 7);
    height: 100%;
    width: 0%;
}

#progress-percent {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 25px;
    padding: 4px 0 0 0;
    text-align: center;
    font-size: 0.95em;
}

:global(*) {
    box-sizing: border-box;
}

:global(strong) {
    font-weight: 500;
}
main {
    font-family: 'Roboto', sans-serif;
    height: 100vh;
}

div.content {
    
    padding: 0px 0px;
    border: 0px solid blue;
    min-height: 90vh;
    height: 100vh;
}

div.content.grid {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 60px auto;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
}


.header {
    grid-area: 1 / 1 / 1 / 4;
    /* background: rgb(80, 80, 100); */
    /*background: linear-gradient(0deg, hsl(145, 83%, 28%) 0%, hsl(145, 83%, 38%) 100%);*/
    background: white;
    border-bottom: 2px solid rgb(150,150,150);
    box-shadow: 0px 5px 5px rgba(0,0,0,0.2);
}
.leftcol {
    grid-area: 2 / 1 / 2 / 2;
    align-self: stretch;
    padding: 20px 0;
    padding-left: 15px;
    padding-right: 10px;
    /*border-right: 1px solid rgb(190,190,190);*/
    /*box-shadow: 0px 0px 15px rgba(0,0,0,0.1);*/
}
.middlecol {
    grid-area: 2 / 2 / 2 / 3;
    overflow-y: auto;
    padding: 0 10px 20px 10px;
    margin-top: 20px;
    /*background: rgb(220,220,220);*/
}

.expl {
    padding: 10px;
    background: rgb(240,240,240);
    border: 1px solid rgb(200,200,200);
    border-radius: 4px;
    margin-top: 10px;
    text-align: justify;
}

:global(div.bbox) {
    background: white;
    border-radius: 6px;
    padding: 20px;
    box-shadow: 1px 1px 4px rgba(0,0,0,0.25);
    /*border-right: 1px solid rgb(140,140,140);
    border-bottom: 1px solid rgb(140,140,140);*/
}
.rightcol {
    grid-area: 2 / 3 / 2 / 4;
    /*background: rgb(240,240,240);*/
    align-self: stretch;
    padding: 20px 0;
    padding-left: 10px;
    padding-right: 15px;
    border-left: 0px solid rgb(190,190,190);
}
#json {
    padding: 10px;
    background: white;
    /*border: 1px solid rgb(150,150,150);*/
}
#json-textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 500px;
    
    padding: 2px;
    color: rgb(30,30,30);
    overflow-x: scroll;
    white-space: pre;
    border: 1px solid rgb(180,180,180);
    margin-top: 3px;
    font-size: 0.9em;
    font-family: monospace;
}
textarea:focus-visible {
    outline: none;
}
:global(div.attr) {
    padding: 10px 10px;
    margin-bottom: 0px;
    /*border: 1px solid rgb(215,215,215);*/
    box-sizing: border-box;
}
:global(div.attr > h4) {
    margin: 0 0 5px 0;
    color: darkslateblue;
}
:global(label) {
    display: inline-block;
    width: 250px;
}

.link {
    color: hsl(145, 83%, 28%);
    cursor: pointer;
    text-decoration: none;
}

</style>