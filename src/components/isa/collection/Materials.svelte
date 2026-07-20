<script lang="ts">
	import Schema from '../../../lib/schemas';
	import MaterialUpload from '../../util/MaterialUpload.svelte';

	let {
		label = 'Other Materials',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function importMaterials(list: any[]) {
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
			<MaterialUpload type="material" onapprove={importMaterials} />
		</div>

		{#if value && value.length > 0}
			<table class="table">
				<thead>
					<tr>
						<th>Material Name</th>
						{#each value[0].characteristics as characteristic}
							<th>Characteristic [{characteristic.category.characteristicType.annotationValue}]</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each value as material, index (index)}
						<tr>
							<td>{material.name}</td>
							{#each material.characteristics as characteristic, i (i)}
								<td>{characteristic.value.annotationValue ?? characteristic.value}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</fieldset>
</section>
