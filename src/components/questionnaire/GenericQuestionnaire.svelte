<script lang="ts">
    import { config } from "@/lib/appstate.svelte";
    import Schema from "@/lib/schemas";
    import FieldWrapper from "./FieldWrapper.svelte";
    import Textarea from "../isa/generic/Textarea.svelte";
    import String from "../isa/generic/String.svelte";
    import Date from "../isa/generic/Date.svelte";
    import { isaObj } from "@/stores/isa";
    import License from "../isa/generic/License.svelte";
    import CommentWrapper from "./CommentWrapper.svelte";
    import { setQuestionnaireCurrentStep } from "@/lib/appstate.svelte";
    import { get } from "svelte/store";
    import ComponentWrapper from "./ComponentWrapper.svelte";
    import People from "../isa/generic/People.svelte";
    import type { Hook } from "@/lib/types";
  import Protocol from "../isa/generic/Protocol.svelte";
  import StudyProcesses from "../isa/generic/StudyProcesses.svelte";
  import AssayProcesses from "../isa/generic/AssayProcesses.svelte";
  import { onMount } from "svelte";
  import Publications from "../isa/generic/Publications.svelte";

    const fieldTypes: Record<string, any> = {
        'text': String,
        'textarea': Textarea,
        'date': Date,
        'license': License,
    }

    const componentTypes: Record<string, any> = {
        'people': People,
        'protocol': Protocol,
        'StudyProcesses': StudyProcesses,
        'AssayProcesses': AssayProcesses,
        'Publications': Publications

    }

    function executeHook(idx: number) {
        if (steps[idx] && steps[idx].hooks && Array.isArray(steps[idx].hooks)) {
            steps[idx].hooks.forEach((hook: Hook) => {
                if (isaObj.keyed) {
                    let studies = isaObj.keyed(hook.state.mapping);
                    if (hook.state.count && get(studies).length < hook.state.count) {
                        let toAdd = hook.state.count - get(studies).length;
                        for (let i=0; i<Math.max(toAdd, 0); i++) {
                            studies.update((n: Array<any>) => {
                                n.push(Schema.getObjectFromSchema(hook.type));
                                return n;
                            });
                        }
                    }
                }
            });
        }
    }

    let currentStep = 0;
    let steps = config.steps || [];

    function prev() {
        if (currentStep > 0) {
            currentStep -= 1;
            setQuestionnaireCurrentStep(currentStep);
        }
    }

    function next() {
        if (currentStep < steps.length - 1) {
            currentStep += 1;
            setQuestionnaireCurrentStep(currentStep);
            executeHook(currentStep);
        }
    }

    function handleKeypress(event: KeyboardEvent) {
        if(event.key === "ArrowRight"){
            next();
        }else if (event.key === "ArrowLeft"){
            prev();
        }
    }

    onMount(() => {
        window.addEventListener('keydown', handleKeypress);
        return () => window.removeEventListener('keydown', handleKeypress);
    })
</script>

<section>

    <h2>Step {currentStep+1} of {steps.length}</h2>
    <p class="question">{steps[currentStep].title}</p>
    
    <div class="input-wrapper">
        <div role="button" tabindex="0" aria-pressed="false">
            {#key currentStep}
                {#if steps[currentStep].text}
                    {#each steps[currentStep].text as paragraph}
                    <p>{paragraph}</p>
                    {/each}
                {/if}

                {#if steps[currentStep].fields}
                    {#each steps[currentStep].fields as field}
                    {#if field.isaMapping.commentName}
                        <CommentWrapper component={fieldTypes[field.type]} jsonPath={field.isaMapping.jsonPath} field={field} />
                    {:else}
                        <FieldWrapper component={fieldTypes[field.type]} jsonPath={field.isaMapping.jsonPath} field={field} />
                    {/if}
                    {/each}
                {/if}
            
                {#if steps[currentStep].component}
                    <ComponentWrapper 
                        component={componentTypes[steps[currentStep].component]} 
                        jsonPath={steps[currentStep].jsonPath} 
                        componentConfig={steps[currentStep].componentConfig} 
                    />
                {/if}
            {/key}
        </div>
    </div>


    <div class="controls">
        {#if currentStep > 0}
        <button class="btn large" onclick={prev}>Previous</button>
        {/if}

        {#if currentStep < steps.length - 1}
        <button class="btn large float-right" onclick={next}>Next</button>
        {:else}
        <button class="btn large float-right">Finish</button>
        {/if}
    </div>
</section>

<style>
    div.controls {
        margin-top: 1rem;
        display: flow-root;
    }

    button.float-right {
        float: right;
    }

    div.input-wrapper {
        padding: 0;
        border: 0px solid rgb(200, 200, 200);
    }

    h2 {
        margin: 0;
        font-weight: 700;
        font-size: 1.3rem;
    }

    p.question {
        font-weight: 500;
        font-size: 115%;
        color: rgb(30, 30, 30);
        margin-bottom: .5rem;
    }
</style>