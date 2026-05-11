<script lang="ts">
	import OntologyAnnotation from '../singleton/OntologyAnnotation.svelte';
	import String from '../singleton/String.svelte';

	let {
		label = 'Publication',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	const displayLabel = $derived(label || attr);
	let editMode = $state(false);
	let loadingOpenAlex = false;

	async function fetchOpenAlex(doi: string) {
		if (!doi) return;
		const trimmed = doi.trim();
		if (!trimmed) return;
		loadingOpenAlex = true;
		try {
			const resp = await fetch(`https://api.openalex.org/works/doi:${encodeURIComponent(trimmed)}`);
			if (!resp.ok) {
				console.warn('OpenAlex lookup failed', resp.status);
				return;
			}
			const data = await resp.json();
			if (!data) return;

			if (!value) value = {} as any;

			if (data.display_name) value.title = data.display_name;

			if (Array.isArray(data.authorships)) {
				const authors = data.authorships.map((a: any) => a?.author?.display_name).filter(Boolean);
				if (authors.length) value.authorList = authors.join(', ');
			}

			// Try to extract PubMed ID from a few known locations
			const pmid =
				data.ids?.pmid || data.pmid || (data.external_ids && data.external_ids.pmid) || undefined;
			pmid ? (value.pubMedID = pmid.split('/').pop()) : '';
		} catch (err) {
			console.error('Error fetching OpenAlex', err);
		} finally {
			loadingOpenAlex = false;
		}
	}
</script>

<div class="space-y-4 rounded-lg border border-neutral bg-base-200 p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			{#if !editMode}
				<div class="flex flex-col">
					<span class="text-sm text-neutral/90">
						{#if value?.title}
							{value.title}
						{:else}
							<span class="text-neutral/75 italic">No title provided</span>
						{/if}
					</span>
					<span class="label text-xs">
						{#if value?.doi}
							{value.doi}
						{:else}
							<span class="text-neutral/75 italic">No authors provided</span>
						{/if}
					</span>
				</div>
			{/if}
			{#if showLabel}
				<h3 class="text-lg font-semibold">{displayLabel}</h3>
			{/if}
		</div>
		<div>
			<button
				type="button"
				class="btn mr-2 btn-sm btn-secondary"
				onclick={() => (editMode = !editMode)}
				title={editMode ? 'Switch to view mode' : 'Switch to edit mode'}
			>
				{editMode ? 'View' : 'Edit'}
			</button>
			{#if onRemove}
				<button
					type="button"
					class="btn btn-sm btn-error"
					onclick={onRemove}
					title="Remove publication"
				>
					Remove
				</button>
			{/if}
		</div>
	</div>

	{#if explanation}
		<p class="label text-sm">{explanation}</p>
	{/if}

	{#if editMode}
		<div class="space-y-4">
			<String
				label="DOI"
				attr="doi"
				explanation="Digital Object Identifier without 'https://doi.org/' prefix"
				bind:value={value.doi}
				onChange={(v: string) => fetchOpenAlex(v)}
				showLabel={true}
			/>

			<String
				label="Title"
				attr="title"
				explanation="The title of the publication (automatically fetched from OpenAlex if DOI is provided)"
				bind:value={value.title}
				showLabel={true}
			/>

			<String
				label="Authors"
				attr="authorList"
				explanation="List of authors as a comma-separated string (automatically fetched from OpenAlex if DOI is provided)"
				bind:value={value.authorList}
				showLabel={true}
			/>

			<String
				label="PubMed ID"
				attr="pubMedID"
				explanation="PubMed identifier (automatically fetched from OpenAlex if DOI is provided)"
				bind:value={value.pubMedID}
				showLabel={true}
			/>

			<OntologyAnnotation
				label="Publication Status"
				attr="status"
				explanation="The current status of the publication (e.g., published, in review, etc.)"
				bind:value={value.status}
				showLabel={true}
				parameter="collection=DataPLANT&allChildrenOf=http://www.ebi.ac.uk/efo/EFO_0001742"
			/>
		</div>
	{/if}
</div>
