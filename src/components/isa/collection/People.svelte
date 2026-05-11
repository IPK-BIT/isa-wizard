<script lang="ts">
	import Person from '../composed/Person.svelte';
	import Schema from '../../../lib/schemas';

	let {
		label = 'Publications',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addPerson() {
		const newPerson = Schema.getObjectFromSchema('person');
		const orcidComment = Schema.getObjectFromSchema('comment');
		orcidComment.name = 'Person ID';
		newPerson.comments.push(orcidComment);
		value = [...(value || []), newPerson];
	}

	function removePerson(index: number) {
		value = value?.filter((_: unknown, i: number) => i !== index);
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
			{#if value && value.length > 0}
				{#each value as person, index (index)}
					<Person
						label={`Person ${index + 1}`}
						attr={`person[${index}]`}
						bind:value={value[index]}
						showLabel={false}
						onRemove={() => removePerson(index)}
					/>
				{/each}
			{:else}
				<p class="label text-neutral/75 italic">No people added yet</p>
			{/if}
		</div>

		<button type="button" class="btn btn-sm btn-accent" onclick={addPerson}> + Add Person </button>
	</fieldset>
</section>
