<script lang="ts">
	import spdx from '../../../assets/spdx.ico';
	import Svelecte from 'svelecte';
	import { onMount } from 'svelte';

	let {
		label = '',
		attr,
		explanation = '',
		value: license = $bindable(),
		showLabel = true
	} = $props();

	onMount(() => {
		if (!license) {
			license = '';
		}
	});

	const displayLabel = $derived(label || attr);
	let searchResult = $derived(license === '' ? null : license);

	async function handleFetch(response: { licenses: Array<{ name: string; licenseId: string }> }) {
		return response.licenses.map((license) => {
			return {
				text: license.name,
				value: license.licenseId
			};
		});
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		{#if license}
			<div class="disabled input flex w-full items-center justify-between">
				<div class="flex items-center space-x-2">
					<span>{license}</span>
					<a
						class="btn btn-circle btn-xs"
						href={`https://spdx.org/licenses/${license}`}
						target="_blank"
					>
						<img class="w-3" src={spdx} alt="SPDX License" />
					</a>
				</div>
				<button
					class="btn btn-outline btn-sm btn-warning"
					onclick={() => {
						license = '';
					}}>Clear</button
				>
			</div>
		{:else}
			<Svelecte
				inputId={'svelecte-' + attr}
				bind:value={searchResult}
				fetch="https://raw.githubusercontent.com/spdx/license-list-data/main/json/licenses.json"
				fetchCallback={handleFetch}
				onChange={() => {
					if (searchResult) license = searchResult;
				}}
			/>
		{/if}
		<p class="label">{explanation}</p>
	</fieldset>
</section>
