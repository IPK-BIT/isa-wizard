<script lang="ts">
	import Select from "../singleton/Select.svelte";
	import String from "../singleton/String.svelte";

    let {
		label = 'Sample',
		attr,
		explanation = '',
		value: data = $bindable(),
		showLabel = true,
		onRemove
	} = $props();
</script>

<div class="space-y-4 rounded-lg border border-neutral bg-base-200 p-4">
		<div class="flex justify-end w-full">
        {#if onRemove}
            <button type="button" class="btn btn-sm btn-error" onclick={onRemove} title="Remove person">
                Remove
            </button>
        {/if}
		</div>
	<div class="flex items-center justify-between">
		<div class="space-y-4 w-full">
            <String
              label="File Name"
              attr="name"
              bind:value={data.name}
            />

            <Select
              label="File Type"
              attr="type"
              options={[
                { label: "Raw Data File", value: "Raw Data File" },
                { label: "Derived Data File", value: "Derived Data File" },
                { label: "Image File", value: "Image File" },
                { label: "Acquisition Parameter Data File", value: "Acquisition Parameter Data File" },
                { label: "Derived Spectral Data File", value: "Derived Spectral Data File" },
                { label: "Protein Assignment File", value: "Protein Assignment File" },
                { label: "Raw Spectral Data File", value: "Raw Spectral Data File" },
                { label: "Peptide Assignment File", value: "Peptide Assignment File" },
                { label: "Array Data File", value: "Array Data File" },
                { label: "Derived Array Data File", value: "Derived Array Data File" },
                { label: "Post Translational Modification Assignment File", value: "Post Translational Modification Assignment File" },
                { label: "Derived Array Data Matrix File", value: "Derived Array Data Matrix File" },
                { label: "Free Induction Decay Data File", value: "Free Induction Decay Data File" },
                { label: "Metabolite Assignment File", value: "Metabolite Assignment File" },
                { label: "Array Data Matrix File", value: "Array Data Matrix File" }
              ]}
              bind:value={data.type}
            />
        </div>
    </div>
</div>