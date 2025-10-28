<script lang="ts">
  import Gui from "@/components/gui/Gui.svelte";
  import Explanation from "./components/layout/Explanation.svelte";

  let config = $props();

  import Header from "./components/layout/Header.svelte";
  import InitView from "./components/layout/InitView.svelte";
  import ProgressBar from "./components/layout/ProgressBar.svelte";
  import GenericQuestionnaire from "./components/questionnaire/GenericQuestionnaire.svelte";
  import { getAppState, AppState, setConfig, setQuestionnaireSteps, updateAppState } from "./lib/appstate.svelte";
  import Schema from "./lib/schemas";

  setConfig(config);
  setQuestionnaireSteps(config.steps.length);

  import { isaObj, isaStr } from "./stores/isa";

  let show = $state(true);
</script>

{#if getAppState() === AppState.Init}
  <InitView />
{:else}
  {#if config.general.layoutMode === "standalone"}
    <Header />
  {/if}

  <main class="content" class:grid={config.general.layoutMode === "standalone"}>
    {#if config.general.layoutMode === "standalone"}
      <div class="leftcol">
        {#if getAppState() === AppState.Wizard && config.general.showQuestionnaireProgressBar}
          <ProgressBar />
        {:else if getAppState() === AppState.Form}
          <p>Tree</p>
        {/if}
        <Explanation />
      </div>
    {/if}
    <div class="middlecol">
      <div class="bbox">
        {#if getAppState() === AppState.Form}
          <p>Form View</p>
        {:else if getAppState() === AppState.Wizard}
          <GenericQuestionnaire closeWizard={() => updateAppState(AppState.GUI)} />
        {:else if getAppState() === AppState.Review}
          <p>Review</p>
        {:else if getAppState() === AppState.GUI}
          <Gui />
        {/if}
      </div>
    </div>

    {#if config.general.layoutMode === "standalone" && config.general.showConsole}
      <div class="rightcol">
        <div class="json bbox">
          <button onclick={() => (show = !show)}>Show ISA</button>
          {#if show}
            <textarea bind:value={$isaStr}></textarea>
          {/if}
        </div>
      </div>
    {/if}
  </main>
{/if}

<style>
  main.content {
    padding: 0;
  }

  main.content.grid {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-rows: 0.25rem auto;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  div.leftcol {
    grid-area: 2 / 1 / 2 / 2;
    align-self: stretch;
    padding: 20px 0;
    padding-left: 15px;
    padding-right: 10px;
  }
  div.middlecol {
    grid-area: 2 / 2 / 2 / 3;
    overflow-y: auto;
    padding: 0 10px 20px 10px;
    margin-top: 20px;
  }

  div.rightcol {
    grid-area: 2 / 3 / 2 / 4;
    align-self: stretch;
    padding: 20px 0;
    padding-left: 10px;
    padding-right: 15px;
    border-left: 0px solid rgb(190, 190, 190);
  }

  div.json {
    padding: 0.5rem;
    background: white;
  }

  div.json textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 500px;
    padding: 2px;
    color: rgb(30, 30, 30);
    overflow-x: scroll;
    white-space: pre;
    border: 1px solid rgb(180, 180, 180);
    margin-top: 3px;
    font-size: 0.9em;
    font-family: monospace;
  }

  div.json textarea:focus-visible {
    outline: none;
  }
</style>
