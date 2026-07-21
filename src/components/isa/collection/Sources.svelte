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

	// Pagination State
	const pageSize = 10;
	let currentPage = $state(1);

	// Pagination Derivations
	const totalItems = $derived(value?.length ?? 0);
	const totalPages = $derived(Math.max(1, Math.ceil(totalItems / pageSize)));

	const paginatedItems = $derived.by(() => {
		if (!value || value.length === 0) return [];
		const start = (currentPage - 1) * pageSize;
		return value.slice(start, start + pageSize);
	});

	function addSource() {
		const newSource = Schema.getObjectFromSchema('source');
		value = [...(value || []), newSource];
		// Jump to the last page where the new item was added
		currentPage = Math.ceil(value.length / pageSize);
	}

	function removeSource(index: number) {
		value = value?.filter((_: unknown, i: number) => i !== index);
		// Adjust current page if removing the last item on the last page
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
	}

	function importSources(list: any[]) {
		value = list;
		currentPage = 1;
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
			<div class="overflow-x-auto rounded-lg border border-base-200 bg-base-100 p-2">
				<table class="table w-full table-sm">
					<thead>
						<tr>
							<th>Source Name</th>
							{#each value[0].characteristics as characteristic}
								<th
									>Characteristic [{characteristic.category.characteristicType.annotationValue}]</th
								>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each paginatedItems as source, pageIdx (pageIdx)}
							<tr>
								<td>{source.name}</td>
								{#each source.characteristics as characteristic, i (i)}
									<td>{characteristic.value.annotationValue ?? characteristic.value}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Pagination Controls -->
				<div
					class="mt-3 flex items-center justify-between border-t border-base-200 px-2 pt-2 text-xs text-base-content/70"
				>
					<span>
						Showing {(currentPage - 1) * pageSize + 1} to {Math.min(
							currentPage * pageSize,
							totalItems
						)} of {totalItems} sources
					</span>
					<div class="join">
						<button
							class="btn join-item btn-xs"
							disabled={currentPage <= 1}
							onclick={() => currentPage--}
						>
							« Prev
						</button>
						<button class="no-animation btn pointer-events-none join-item btn-xs">
							{currentPage} / {totalPages}
						</button>
						<button
							class="btn join-item btn-xs"
							disabled={currentPage >= totalPages}
							onclick={() => currentPage++}
						>
							Next »
						</button>
					</div>
				</div>
			</div>
		{/if}
	</fieldset>
</section>
