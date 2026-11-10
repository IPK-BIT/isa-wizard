<script lang="ts">
	import { parseDegrees } from '$lib/util/coordinates';

	let {
		label = '',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onChange = undefined
	} = $props();

	const displayLabel = $derived(label || attr);

	// Hint only, nothing is blocked: the typed text is kept and flagged until it is a valid value
	const problem = $derived.by(() => {
		if (value == null || String(value).trim() === '') return '';
		const parsed = parseDegrees(String(value), 'latitude');
		return parsed.ok ? '' : parsed.error;
	});

	// Rewrites loose input (decimal comma, `+`, hemisphere letter) to canonical decimal degrees
	function normalize() {
		if (value != null && String(value).trim() !== '') {
			const parsed = parseDegrees(String(value), 'latitude');
			if (parsed.ok) value = parsed.value;
		}
		if (typeof onChange === 'function') onChange(value);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') normalize();
	}
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		<input
			type="text"
			inputmode="decimal"
			class="input w-full {problem ? 'input-error' : ''}"
			placeholder="e.g. 48.8584"
			bind:value
			onchange={normalize}
			onblur={normalize}
			onkeydown={handleKeydown}
		/>
		<p class="label {problem ? 'text-error' : ''}">{problem || explanation}</p>
	</fieldset>
</section>
