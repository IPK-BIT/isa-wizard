<script lang="ts">
	import { getAppstate } from '$lib/appstate.svelte';
	import Materials from '$components/isa/collection/Materials.svelte';
	import Samples from '$components/isa/collection/Samples.svelte';
	import { isaObj } from '$stores/isa';
	import { parseIsaLvl } from '$lib/util/breadcrumbUtils';
	import Sources from '$components/isa/collection/Sources.svelte';

	let {
		label = 'Protocol Parameter',
		attr,
		explanation = '',
		value: materials = $bindable(),
		showLabel = true,
		templateHeaders = undefined,
		entityLabels = undefined,
		onRemove
	} = $props();

	const parsed = $derived(parseIsaLvl(getAppstate().isaLvl));
	const isAssay = $derived(parsed.level === 'assay');
	const studyMaterials = $derived(
		isAssay && parsed.studyIndex !== undefined
			? ($isaObj.studies?.[parsed.studyIndex]?.materials as any)
			: undefined
	);
</script>

{#if !getAppstate().isaLvl.includes('assay')}
	<Sources
		label={entityLabels?.sources ?? 'Material Sources'}
		attr={`${getAppstate().isaLvl}.${attr}.sources`}
		explanation="The origin of the biological material (e.g. gene bank accession, in situ material like an orchard, tree material provenance including forest wild site, laboratory-specific populations)."
		bind:value={materials.sources}
		templateHeaders={templateHeaders?.sources}
		{showLabel}
	/>
{/if}

<Samples
	label={entityLabels?.samples ?? 'Observation Units'}
	attr="samples"
	explanation="The experimentation object on which phenotypic and environmental parameters are measured and to which experimental factors are applied."
	bind:value={materials.samples}
	templateHeaders={templateHeaders?.samples}
	{showLabel}
	studyItems={isAssay ? (studyMaterials?.samples ?? []) : undefined}
/>


<Materials
	label={entityLabels?.materials ?? 'Biological Materials'}
	attr="materials"
	explanation="Biological materials identify and describe the plant materials used in the studies."
	bind:value={materials.otherMaterials}
	templateHeaders={templateHeaders?.materials}
	{showLabel}
	studyItems={isAssay ? (studyMaterials?.otherMaterials ?? []) : undefined}
/>