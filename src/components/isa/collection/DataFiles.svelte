<script lang="ts">
	import Schema from "../../../lib/schemas";
	import Data from "../composed/Data.svelte";


	let {
		label = 'Data Files',
		attr,
		explanation = '',
		value: files = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

    function addDataFile() {
        let emptyData = Schema.getObjectFromSchema('data');
		files = [...(files || []), emptyData];
    }

	function removeDataFile(index: number) {
		files = files?.filter((_: unknown, i: number) => i !== index);
	}
</script>


<section>
	<fieldset class="fieldset space-y-4">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}

		{#if explanation}
			<p class="label">{explanation}</p>
		{/if}

		<div class="space-y-4">
			{#if files && files.length > 0}
				{#each files as _, i (i)}
					<Data
						label="Data"
						attr=""
						bind:value={files[i]}
						onRemove={()=>removeDataFile(i)}
					/>
				{/each}
			{:else}
				<p class="label text-neutral/75 italic">No files added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addDataFile}> + Add Data File </button>
	</fieldset>
</section>
