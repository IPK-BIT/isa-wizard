<script lang="ts">
	import Svelecte from 'svelecte';

	let {
		label = '',
		attr,
		explanation = '',
		value: orcid = $bindable(),
		showLabel = true,
		onChange = undefined
	} = $props();

	const displayLabel = $derived(label || attr);

	function handleChange() {
		if (typeof onChange === 'function') onChange(orcid);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleChange();
	}

	function handleOrcidFetch(data: any) {
		if (data && data['expanded-result'] && data['expanded-result'].length > 0) {
			let results = data['expanded-result'].map((item: any) => {
				return {
					text: `${item['given-names']} ${item['family-names']} - ${item['institution-name'].length > 0 ? item['institution-name'].join(', ') : 'No affiliation'}`,
					value: item['orcid-id'],
					name: item['given-names'],
					familyName: item['family-names'],
					emails: item['email'],
					institutions: item['institution-name']
				};
			});
			// console.log("ORCID results:", results);
			return results;
		} else {
			console.log('No ORCID results found');
			return [];
		}
	}

	function handleSelectORCID(selection: any) {
		onChange(selection);
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		{#if orcid}
			<div class="disabled input flex w-full items-center justify-between">
				<span>{orcid}</span>
				<button
					class="btn btn-outline btn-error btn-sm"
					onclick={() => {
						orcid = '';
					}}>Clear</button
				>
			</div>
		{:else}
			<Svelecte
				placeholder="ORCID"
				bind:value={orcid}
				valueAsObject={false}
				fetch="https://pub.orcid.org/v3.0/expanded-search/?q=[query]"
				fetchProps={{
					headers: { 'Content-Type': 'application/vnd.orcid+json' }
				}}
				fetchCallback={handleOrcidFetch}
				onChange={(selection: any) => handleSelectORCID(selection)}
			/>
		{/if}
		<p class="label">{explanation}</p>
	</fieldset>
</section>
