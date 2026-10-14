<script lang="ts">
	import { getConfig } from '$lib/config.svelte';
	import type { WizardConfig } from '$lib/types/Config';
	import { onMount } from 'svelte';

	let {
		label = 'Source',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	let selectedInvestigation = $state();
	let investigations = $state([]);

	onMount(async () => {
		try {
			let token = localStorage.getItem('fairdom_access_token');
			let config = getConfig() as WizardConfig;
			const invResponse = await fetch(`${config.integrations.fairdom.url}/investigations`, {
				headers: {
					Authorization: `Token ${token}`
				}
			});
			if (invResponse.ok) {
				const data = await invResponse.json();
				console.log(data);
			}
		} catch (e) {
			console.error(e);
		}
	});
</script>
