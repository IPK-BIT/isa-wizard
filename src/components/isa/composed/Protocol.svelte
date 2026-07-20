<script lang="ts">
	import { getConfig } from '../../../lib/config.svelte';
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import Components from '../collection/Components.svelte';
	import Parameters from '../collection/Parameters.svelte';
	import OntologyAnnotation from '../singleton/OntologyAnnotation.svelte';
	import String from '../singleton/String.svelte';
	import Textarea from '../singleton/Textarea.svelte';

	let {
		label = 'Protocol',
		attr,
		explanation = '',
		value: protocol = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	const displayLabel = $derived(label || attr);
	let editMode = $state(false);
</script>

<div class="space-y-4 rounded-lg border border-neutral bg-base-200 p-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			{#if !editMode}
				<div class="flex flex-col">
					<span class="text-sm text-neutral/90">
						{#if protocol?.name}
							{protocol.name}
						{:else}
							<span class="text-neutral/75 italic">No name provided</span>
						{/if}
					</span>
					<div class="italic">
						{#if protocol?.protocolType?.annotationValue}
							<span>{protocol.protocolType.annotationValue}</span>
							<BreadcrumbWidget
								api={(getConfig() as { 'lookup-services': { ts: { api: any } } })['lookup-services']
									.ts.api}
								iri={protocol.protocolType.termAccession}
								ontologyId={protocol.protocolType.termSource}
							/>
						{:else}
							<span>No protocol type provided</span>
						{/if}
					</div>
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
				label="Name"
				attr="name"
				explanation="The title of the publication (automatically fetched from OpenAlex if DOI is provided)"
				bind:value={protocol.name}
				showLabel={true}
			/>

			<OntologyAnnotation
				label="Protocol Type"
				attr="protocolType"
				explanation="The type of the protocol (e.g., experimental, computational)"
				bind:value={protocol.protocolType}
				showLabel={true}
			/>

			<Textarea
				label="Protocol Description"
				attr="protocolDescription"
				explanation="A detailed description of the protocol used in the assay."
				bind:value={protocol.description}
				showLabel={true}
			/>

			<String
				label="Protocol URI"
				attr="protocolURI"
				explanation="A URI linking to more information about the protocol (e.g., a publication or a protocol repository entry)."
				bind:value={protocol.uri}
				showLabel={true}
			/>

			<String
				label="Protocol Version"
				attr="protocolVersion"
				explanation="The version of the protocol."
				bind:value={protocol.version}
				showLabel={true}
			/>

			<Parameters
				label="Protocol Parameters"
				attr="parameters"
				explanation="A list of parameters used in the protocol."
				bind:value={protocol.parameters}
				showLabel={true}
			/>

			<Components
				label="Protocol Components"
				attr="components"
				explanation="A list of components used in the protocol."
				bind:value={protocol.components}
				showLabel={true}
			/>
		</div>
	{/if}
</div>
