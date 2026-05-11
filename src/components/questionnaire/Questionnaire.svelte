<script lang="ts">
	import { componentTypes, fieldTypes } from '../../lib/config/mapping';
	import { isaObj } from '../../stores/isa';
	import Wrapper from './Wrapper.svelte';

	let { currentStepIndex = $bindable(), config, onFinish = undefined } = $props();

	function next() {
		if (currentStepIndex < config.steps.length - 1) {
			currentStepIndex += 1;
		}
	}

	function prev() {
		if (currentStepIndex > 0) {
			currentStepIndex -= 1;
		}
	}

	async function closeWizard() {
		if (onFinish) {
			await onFinish();
		}
	}
</script>

<section>
	<h2 class="text-xl font-bold">Step {currentStepIndex + 1} of {config.steps.length}</h2>
	<p class="text-lg font-semibold">{config.steps[currentStepIndex].title}</p>

	<div>
		<div>
			{#key currentStepIndex}
				{#if config.steps[currentStepIndex].texts}
					<div class="py-2">
						{#each config.steps[currentStepIndex].texts as text}
							<p class="text-sm italic">{text}</p>
						{/each}
					</div>
				{/if}

				{#if config.steps[currentStepIndex].fields}
					<div class="py-2">
						{#each config.steps[currentStepIndex].fields as field}
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

				{#if config.steps[currentStepIndex].component}
					{#if componentTypes[config.steps[currentStepIndex].component.type as keyof typeof componentTypes]}
						<Wrapper
							type={config.steps[currentStepIndex].component.type}
							attr={config.steps[currentStepIndex].component.isaMapping.jsonPath}
							label={config.steps[currentStepIndex].component.label}
							explanation={config.steps[currentStepIndex].component.explanation}
						/>
					{/if}
				{/if}
			{/key}
		</div>
	</div>

	<div class="mt-4 flow-root">
		{#if currentStepIndex > 0}
			<button class="large btn btn-secondary" onclick={prev}>Previous</button>
		{/if}

		{#if currentStepIndex < config.steps.length - 1}
			<button class="large btn float-right btn-primary" onclick={next}>Next</button>
		{:else}
			<button class="large btn float-right btn-primary" type="button" onclick={closeWizard}
				>Finish</button
			>
		{/if}
	</div>
</section>
