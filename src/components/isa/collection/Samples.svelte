<script lang="ts">
	import Schema from '../../../lib/schemas';
	import MaterialUpload from '../../util/MaterialUpload.svelte';

	let {
		label = 'Samples',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function importSamples(list: any[]) {
		value = list;
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

		<div
			class="rounded-md border p-4"
			style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
		>
			<MaterialUpload type="sample" onapprove={importSamples} />
		</div>

		{#if value && value.length > 0}
			<table class="table">
				<thead>
					<tr>
						<th>Sample Name</th>
						{#each value[0].characteristics as characteristic}
							<th>Characteristic [{characteristic.category.characteristicType.annotationValue}]</th>
						{/each}
						{#each value[0].factorValues as factor}
							<th>Factor [{factor.category.factorType.annotationValue}]</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each value as sample, index (index)}
						<tr>
							<td>{sample.name}</td>
							{#each sample.characteristics as characteristic, i (i)}
								<td>{characteristic.value.annotationValue ?? characteristic.value}</td>
							{/each}
							{#each sample.factorValues as factor, i (i)}
								<td>{factor.value.annotationValue ?? factor.value}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</fieldset>
</section>
