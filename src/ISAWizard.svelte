<script lang="ts">
	import errorImage from './assets/error.png';
	import { onMount } from 'svelte';
	import { ConfigLoader } from './lib/config.svelte';
	import type { WizardConfig, WizardFinishData, FormResponse } from './lib/types/Config';
	import type { FinishCallback } from './lib/types/Events';
	import Header from './components/layout/Header.svelte';
	import ProgressBar from './components/layout/ProgressBar.svelte';
	import Questionnaire from './components/questionnaire/Questionnaire.svelte';

	import { isaObj, isaStr } from './stores/isa';
	import Schema from './lib/schemas';
	import { getAppstate, updateAppstate } from './lib/appstate.svelte';
	import Gui from './components/gui/Gui.svelte';
	import Tree from './components/layout/Tree.svelte';
	import InitView from './components/layout/InitView.svelte';
	import type { ISAInvestigationSchema } from './lib/types/isa.generated';

	onMount(() => {
		$isaObj = Schema.getObjectFromSchema('investigation') as ISAInvestigationSchema;
	});

	// Props
	let {
		config = undefined,
		configUrl = undefined,
		onFinish = undefined
	}: {
		config?: WizardConfig;
		configUrl?: string;
		onFinish?: FinishCallback;
	} = $props();

	// State
	let wizardConfig: WizardConfig | null = $state(null);
	let currentStepIndex: number = $state(0);
	let responses: FormResponse = $state({});
	let loading: boolean = $state(true);
	let error: string | null = $state(null);
	let submitting: boolean = $state(false);
	let show: boolean = $state(false);

	// Lifecycle
	onMount(async () => {
		await loadConfig();
		return;
	});

	// Load configuration
	async function loadConfig() {
		loading = true;
		error = null;

		try {
			if (config) {
				wizardConfig = config;
			} else if (configUrl) {
				wizardConfig = await ConfigLoader.load(configUrl);
			} else {
				throw new Error('Either config or configUrl must be provided');
			}

			// Initialize responses object with empty values for all fields
			if (wizardConfig) {
				updateAppstate({
					template: wizardConfig.rootTemplate,
					mode: wizardConfig.general.initialView
				});
			}

			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load configuration';
			loading = false;
		}
	}

	// Form submission
	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;
		try {
			const finishData: WizardFinishData = {
				responses,
				timestamp: Date.now()
			};

			// Call onFinish callback if provided
			if (onFinish) {
				await onFinish(finishData);
			}
		} catch (err) {
			console.error('Error during form submission:', err);
		} finally {
			submitting = false;
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-center p-8">
		<div class="loading loading-spinner"></div>
		<span class="ml-2">Loading configuration...</span>
	</div>
{:else if error}
	<div class="card mx-auto mt-10 card-side w-lg bg-error p-4 text-error-content">
		<figure>
			<img class="w-32" src={errorImage} alt="Movie" />
		</figure>
		<div class="card-body">
			<h2 class="card-title">Error</h2>
			<p>{error}</p>
		</div>
	</div>
{:else if wizardConfig}
	<div>
		{#if wizardConfig.general.layoutMode === 'standalone' && getAppstate().mode != 'init'}
			<Header config={wizardConfig.general} />
		{/if}

		<main
			class="p-0 {wizardConfig.general.layoutMode === 'standalone'
				? 'grid grid-cols-[1fr_3fr_1fr] grid-rows-[0.25rem_auto] gap-0'
				: ''}"
		>
			{#if wizardConfig.general.layoutMode === 'standalone'}
				<div class="col-start-1 row-start-2 self-stretch py-5 pr-2.5 pl-2.75">
					{#if getAppstate().mode === 'wizard' && wizardConfig.general.showQuestionnaireProgressBar}
						<ProgressBar totalSteps={wizardConfig.templates[getAppstate().template].steps.length} />
					{:else if getAppstate().mode === 'gui'}
						<Tree />
					{/if}
				</div>
			{/if}
			<div class="col-start-2 row-start-2 mt-5 overflow-y-auto px-2.5 py-0 pb-5">
				{#if getAppstate().mode === 'wizard'}
					<div class="card bg-base-100 p-4 shadow-md">
						<Questionnaire
							config={wizardConfig.templates[getAppstate().template]}
							onFinish={handleSubmit}
						/>
					</div>
				{:else if getAppstate().mode === 'init'}
					<InitView />
				{:else}
					<Gui config={wizardConfig} />
				{/if}
			</div>
			{#if wizardConfig.general.layoutMode === 'standalone'}
				<div class="col-start-3 row-start-2 self-stretch border-l-0 py-5 pr-2.75 pl-2.5">
					{#if wizardConfig.general.showConsole && getAppstate().mode != 'init'}
						<div class="card bg-base-100 p-4 shadow-md">
							<button class="btn mb-2 btn-outline btn-sm" onclick={() => (show = !show)}>
								{show ? 'Hide ISA' : 'Show ISA'}
							</button>
							{#if show}
								<textarea
									bind:value={$isaStr}
									class="block min-h-125 w-full resize-y rounded-md border border-base-300 bg-base-100 p-2 font-mono text-sm text-base-content outline-none focus:border-warning"
								></textarea>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}
