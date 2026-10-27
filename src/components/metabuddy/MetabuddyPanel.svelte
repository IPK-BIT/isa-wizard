<script lang="ts">
	import { getAppstate } from '$lib/appstate.svelte';
	import { getConfig } from '$lib/config.svelte';
	import type { WizardConfig } from '$lib/types/Config';
	import AskPanel from './AskPanel.svelte';
	import ValidatePanel from './ValidatePanel.svelte';

	const features = $derived((getConfig() as WizardConfig).integrations?.metabuddy?.features);
</script>

{#if features}
	<div class="flex flex-col gap-4">
		{#if features.ask && getAppstate().mode === 'wizard'}
			<AskPanel />
		{/if}
		{#if features.validate && getAppstate().mode === 'gui'}
			<ValidatePanel />
		{/if}
	</div>
{/if}
