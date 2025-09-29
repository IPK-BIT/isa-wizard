<script lang="ts">
    import { AppState, config, updateAppState } from "@/lib/appstate.svelte";
    import { isaObj } from "@/stores/isa";
    import Schema from "@/lib/schemas";

    function openWizard(){
        $isaObj = Schema.getPrefilledInvestigation(config.prefill || []);
        updateAppState(AppState.Wizard);
    }

</script>

<div class="screen">
    <div class="init">
        <div class="logo">
            <img src="/src/assets/logo.png" alt="ISA Wizard"/>
            <h1>ISA Wizard</h1>
        </div>
        <div class="controls">
            <button class="btn" onclick={openWizard}>Open Questionnaire</button>
            <button class="btn" onclick={() => updateAppState(AppState.Form)}>Open Expert Mode</button>
            <button class="btn" onclick={() => updateAppState(AppState.Review)}>Open Review Mode</button>
        </div>
    </div>
</div>

<style>
    div.screen{
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    div.init {
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        border-radius: 10px;
    }

    div.logo {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
    }

    div.logo img {
        width: 160px;
    }

    div.logo h1 {
        font-size: xx-large;
        font-weight: 500;
        color: black;
    }

    div.controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    div.controls button {
        width: 20rem;
        height: 3rem;
        font-size: large;
    }
</style>