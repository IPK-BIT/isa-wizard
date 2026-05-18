<script lang="ts">
	import { getAppstate } from "../../../lib/appstate.svelte";
	import Materials from "../collection/Materials.svelte";
	import Samples from "../collection/Samples.svelte";
	import Sources from "../collection/Sources.svelte";

    
	let {
		label = 'Protocol Parameter',
		attr,
		explanation = '',
		value: materials = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

</script>

{#if !getAppstate().isaLvl.includes('assay')}
<Sources
    label="Material Sources"
    attr="sources"
    explanation="The origin of the biological material (e.g. gene bank accession, in situ material like an orchard, tree material provenance including forest wild site, laboratory-specific populations)."
    bind:value={materials.sources}
    showLabel={showLabel}
/>
{/if}

<Materials
    label="Biological Materials"
    attr="materials"
    explanation="Biological materials identify and describe the plant materials used in the studies."
    bind:value={materials.otherMaterials}
    showLabel={showLabel}
/>

<Samples
    label="Observation Units"
    attr="samples"
    explanation="The experimentation object on which phenotypic and environmental parameters are measured and to which experimental factors are applied."
    bind:value={materials.samples}
    showLabel={showLabel}
/>