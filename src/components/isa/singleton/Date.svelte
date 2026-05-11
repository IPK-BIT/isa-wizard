<script lang="ts">
	let { label = '', attr, explanation = '', value = $bindable(), showLabel = true } = $props();

	const displayLabel = $derived(label || attr);
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		<input type="date" class="input w-full" bind:value />
		<p class="label">{explanation}</p>
	</fieldset>
</section>
