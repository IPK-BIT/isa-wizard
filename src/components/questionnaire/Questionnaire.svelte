<script lang="ts">
	import { getAppstate, updateAppstate } from '../../lib/appstate.svelte';
	import { componentTypes, fieldTypes } from '../../lib/config/mapping';
	import { isaObj } from '../../stores/isa';
	import Wrapper from './Wrapper.svelte';

	let { config, onFinish = undefined } = $props();

	function next() {
		if (getAppstate().currentStepIndex < config.steps.length - 1) {
			updateAppstate({ currentStepIndex: getAppstate().currentStepIndex + 1 });
		}
	}

	function prev() {
		if (getAppstate().currentStepIndex > 0) {
			updateAppstate({ currentStepIndex: getAppstate().currentStepIndex - 1 });
		}
	}

	async function closeWizard() {
		updateAppstate({ mode: 'gui', isaLvl: '' });
	}
</script>

<!-- <pre>{JSON.stringify(config, null, 2)}</pre> -->

<section>
	<h2 class="text-xl font-bold">
		Step {getAppstate().currentStepIndex + 1} of {config.steps.length}
	</h2>
	<p class="text-lg font-semibold">{config.steps[getAppstate().currentStepIndex].title}</p>

	<div>
		<div>
			{#key getAppstate().currentStepIndex}
				{#if config.steps[getAppstate().currentStepIndex].texts}
					<div class="py-2">
						{#each config.steps[getAppstate().currentStepIndex].texts as text}
							<p class="text-sm italic">{text}</p>
						{/each}
					</div>
				{/if}

				{#if config.steps[getAppstate().currentStepIndex].fields}
					<div class="py-2">
						{#each config.steps[getAppstate().currentStepIndex].fields as field}
							{#if fieldTypes[field.type as keyof typeof fieldTypes]}
								<Wrapper
									label={field.label}
									attr={field.isaMapping.jsonPath}
									attr2={field.isaMapping.commentName}
									explanation={field.explanation}
									type={field.type}
								/>
							{/if}
						{/each}
					</div>
				{/if}

				{#if config.steps[getAppstate().currentStepIndex].component}
					{#if componentTypes[config.steps[getAppstate().currentStepIndex].component.type as keyof typeof componentTypes]}
						<Wrapper
							type={config.steps[getAppstate().currentStepIndex].component.type}
							attr={config.steps[getAppstate().currentStepIndex].component.isaMapping.jsonPath}
							label={config.steps[getAppstate().currentStepIndex].component.label}
							explanation={config.steps[getAppstate().currentStepIndex].component.explanation}
						/>
					{/if}
				{/if}
			{/key}
		</div>
	</div>

	<div class="mt-4 flow-root">
		{#if getAppstate().currentStepIndex > 0}
			<button class="large btn btn-secondary" onclick={prev}>Previous</button>
		{/if}

		{#if getAppstate().currentStepIndex < config.steps.length - 1}
			<button class="large btn float-right btn-primary" onclick={next}>Next</button>
		{:else}
			<button class="large btn float-right btn-primary" type="button" onclick={closeWizard}
				>Finish</button
			>
		{/if}
	</div>
</section>
