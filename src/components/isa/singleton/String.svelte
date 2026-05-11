<script lang="ts">
	let {
		label = '',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onChange = undefined
	} = $props();

	const displayLabel = $derived(label || attr);

	function handleChange() {
		if (typeof onChange === 'function') onChange(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleChange();
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		<input
			type="text"
			class="input w-full"
			bind:value
			onchange={handleChange}
			onblur={handleChange}
			onkeydown={handleKeydown}
		/>
		<p class="label">{explanation}</p>
	</fieldset>
</section>
