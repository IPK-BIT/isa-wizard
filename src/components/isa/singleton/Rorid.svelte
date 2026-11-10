<script lang="ts">
	import Svelecte from 'svelecte';

	let {
		label = '',
		attr,
		explanation = '',
		value: rorid = $bindable(),
		showLabel = true,
		onChange = undefined
	} = $props();

	const displayLabel = $derived(label || attr);

	// ROR API v2: https://ror.readme.io/v2/docs/rest-api
	function handleRorFetch(data: any) {
		if (!data || !Array.isArray(data.items) || data.items.length === 0) return [];

		return data.items.map((item: any) => {
			const names: { value: string; types: string[] }[] = item.names ?? [];
			const name =
				names.find((n) => n.types?.includes('ror_display'))?.value ?? names[0]?.value ?? item.id;
			const acronym = names.find((n) => n.types?.includes('acronym'))?.value;
			const geo = item.locations?.[0]?.geonames_details;
			const place = [geo?.name, geo?.country_name].filter(Boolean).join(', ');
			const website = item.links?.find((l: any) => l.type === 'website')?.value;

			return {
				text: place ? `${name} - ${place}` : name,
				value: item.id, // full ROR URL, e.g. https://ror.org/02r2q1d96
				name,
				acronym,
				city: geo?.name,
				country: geo?.country_name,
				website
			};
		});
	}

	const ROR_URL = /^https:\/\/ror\.org\//;
	const isRor = $derived(typeof rorid === 'string' && ROR_URL.test(rorid));

	// Free text fallback: used when the institution has no ROR ID. The typed text is stored as-is.
	function handleCreate({ inputValue }: { inputValue: string }) {
		const text = inputValue.trim();
		return { text, value: text, name: text, $created: true };
	}

	function handleSelectRor(selection: any) {
		if (typeof onChange === 'function') onChange(selection);
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		{#if rorid}
			<div class="disabled input flex w-full items-center justify-between">
				{#if isRor}
					<a class="link" href={rorid} target="_blank" rel="noopener noreferrer">{rorid}</a>
				{:else}
					<span>{rorid} <span class="text-xs italic opacity-60">(free text)</span></span>
				{/if}
				<button
					class="btn btn-outline btn-error btn-sm"
					onclick={() => {
						rorid = null;
					}}>Clear</button
				>
			</div>
		{:else}
			<Svelecte
				placeholder="Search institution (ROR) or type free text"
				creatable
				creatablePrefix=""
				createHandler={handleCreate}
				i18n={{
					createRowLabel: (v: string) => `Use '${v}' as free text`,
					emptyCreatable: 'No ROR match - type to use free text'
				}}
				bind:value={rorid}
				valueAsObject={false}
				fetch="https://api.ror.org/v2/organizations?query=[query]"
				fetchCallback={handleRorFetch}
				onChange={(selection: any) => handleSelectRor(selection)}
			/>
		{/if}
		<p class="label">{explanation}</p>
	</fieldset>
</section>
