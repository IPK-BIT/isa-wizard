<script lang="ts">
	let { label = '', attr, explanation = '', value = $bindable(), showLabel = true } = $props();

	const displayLabel = $derived(label || attr);
</script>

<section>
	<fieldset class="fieldset">
		{#if showLabel}
			<legend class="fieldset-legend">{displayLabel}</legend>
		{/if}
		<textarea class="textarea w-full" bind:value></textarea>
		<p class="label">{explanation}</p>
	</fieldset>
</section>
