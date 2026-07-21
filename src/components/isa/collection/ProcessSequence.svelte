<script lang="ts">
	import Schema from '../../../lib/schemas';
	import Process from '../composed/Process.svelte';

	let {
		label = 'Process Sequence',
		attr,
		explanation = '',
		value: processes = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addProcess() {
		const newProcess = Schema.getObjectFromSchema('process');
		processes = [...(processes || []), newProcess];
	}

	function removeProcess(i: number) {
		console.log(processes[i]);
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
			{#if processes && processes.length > 0}
				{#each processes as _, index (index)}
					<Process
						label={`pprocess ${index + 1}`}
						attr={`processSequence[${index}]`}
						bind:value={processes[index]}
						showLabel={false}
						onRemove={() => removeProcess(index)}
					/>
				{/each}
			{:else}
				<p class="label text-gray-500 italic">No processes added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-accent btn-sm" onclick={addProcess}>
			+ Add Process
		</button>
	</fieldset>
</section>
