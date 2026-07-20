<script lang="ts">
	import Schema from '../../../lib/schemas';
	import MaterialUpload from '../../util/MaterialUpload.svelte';

	let {
		label = 'Sources',
		attr,
		explanation = '',
		value = $bindable(),
		showLabel = true
	} = $props();

	const displayLabel = $derived(label || attr);

	function addSource() {
		const newSource = Schema.getObjectFromSchema('source');
		value = [...(value || []), newSource];
	}

	function removeSource(index: number) {
		value = value?.filter((_: unknown, i: number) => i !== index);
	}

	function importSources(list: any[]) {
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
			<MaterialUpload type="source" onapprove={importSources} />
		</div>

		{#if value && value.length > 0}
			<table class="table">
				<thead>
					<tr>
						<th>Source Name</th>
						{#each value[0].characteristics as characteristic}
							<th>Characteristic [{characteristic.category.characteristicType.annotationValue}]</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each value as source, index (index)}
						<tr>
							<td>{source.name}</td>
							{#each source.characteristics as characteristic, i (i)}
								<td>{characteristic.value.annotationValue ?? characteristic.value}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</fieldset>
</section>
