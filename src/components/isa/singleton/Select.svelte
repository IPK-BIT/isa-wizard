<script lang="ts">
	let {
		label = '',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onChange = undefined,
		options = []
	} = $props();

	const displayLabel = $derived(label || attr);

	function handleChange() {
		if (typeof onChange === 'function') onChange(value);
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		<select class="select w-full" bind:value onchange={handleChange}>
			<option value="">-- Select an option --</option>
			{#each options as option (option.value)}
				<option value={option.value}>
					{option.label}
				</option>
			{/each}
		</select>
		{#if explanation}
			<p class="label">{explanation}</p>
		{/if}
	</fieldset>
</section>
