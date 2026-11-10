<script lang="ts">
	import { isNumberish, parseAltitude } from '$lib/util/coordinates';

	let {
		label = '',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true,
		onChange = undefined
	} = $props();

	const displayLabel = $derived(label || attr);

	// The unit is a fixed suffix: the input shows the number only, the stored value is `<number> m`
	const UNIT = /\s*(m|meters?|metres?)$/i;

	function show(v: unknown): string {
		return v == null ? '' : String(v).replace(UNIT, '');
	}

	function store(text: string): string {
		const t = text.trim();
		if (t === '') return '';
		// Numbers (also half typed ones like `12.`) get the unit, anything else is kept as typed
		return isNumberish(t) ? `${t} m` : t;
	}

	// Hint only, nothing is blocked
	const problem = $derived.by(() => {
		if (value == null || String(value).trim() === '') return '';
		const parsed = parseAltitude(String(value));
		return parsed.ok ? '' : parsed.error;
	});

	function normalize() {
		if (value != null && String(value).trim() !== '') {
			const parsed = parseAltitude(String(value));
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
		<label class="input w-full {problem ? 'input-error' : ''}">
			<input
				type="text"
				inputmode="decimal"
				class="grow"
				placeholder="e.g. 120"
				bind:value={() => show(value), (text) => (value = store(text))}
				onchange={normalize}
				onblur={normalize}
				onkeydown={handleKeydown}
			/>
			<span class="label">m</span>
		</label>
		<p class="label {problem ? 'text-error' : ''}">{problem || explanation}</p>
	</fieldset>
</section>
