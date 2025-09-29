<script lang="ts">
    import { questionnaireState } from "@/lib/appstate.svelte";
</script>

<div class="bbox">
    <p style="margin: 0 0 5px 0;">Your progress:</p>
    <div id="progress-bar">
        <div id="progress" style:width={((questionnaireState.currentStep / questionnaireState.steps)*100)+'%'}></div>
        <div id="progress-percent">{Math.floor((questionnaireState.currentStep / questionnaireState.steps)*100)}%</div>
    </div>
</div>

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
</style>