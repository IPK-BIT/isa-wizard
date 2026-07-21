<script lang="ts">
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import TitleWidget from '../../ts4nfdi/TitleWidget.svelte';

	let { collection, config, label } = $props();

	const pageSize = 5;
	let page = $state(0);
	const totalPages = $derived(Math.max(1, Math.ceil(collection.length / pageSize)));
	const characteristics = $derived(collection[0]?.characteristics ?? []);
	const pagedCollection = $derived(collection.slice(page * pageSize, page * pageSize + pageSize));

	$effect(() => {
		if (page > totalPages - 1) {
			page = totalPages - 1;
		}
	});

	function prevPage() {
		if (page > 0) {
			page -= 1;
		}
	}

	function nextPage() {
		if (page < totalPages - 1) {
			page += 1;
		}
	}
</script>

<table>
	<thead>
		<tr>
			<th>{label} Name</th>
			{#each characteristics as characteristic}
				<th>Characteristic [{characteristic.category.characteristicType.annotationValue}]</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each pagedCollection as item, i (page * pageSize + i)}
			<tr>
				<td>{item.name}</td>
				{#each item.characteristics as characteristic}
					<td>
						{#if characteristic.value.annotationValue}
							<div>
								<p>{characteristic.value.annotationValue}</p>
								<BreadcrumbWidget
									api={config['lookup-services'].ts.api}
									iri={characteristic.value.termAccession}
									ontologyId={characteristic.value.termSource}
								/>
							</div>
						{:else}
							{characteristic.value}
						{/if}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
	<tfoot>
		<tr>
			<td colspan={characteristics.length + 1}>
				<div class="flex items-center justify-between gap-3">
					<span class="italic">
						Showing {Math.min(page * pageSize + 1, collection.length)}-{Math.min(
							(page + 1) * pageSize,
							collection.length
						)} of {collection.length}
						{label}s
					</span>
					{#if collection.length > pageSize}
						<div class="join">
							<button class="btn join-item btn-xs" onclick={prevPage} disabled={page === 0}>
								Prev
							</button>
							<button class="btn pointer-events-none btn-active join-item btn-xs">
								Page {page + 1} of {totalPages}
							</button>
							<button
								class="btn join-item btn-xs"
								onclick={nextPage}
								disabled={page >= totalPages - 1}
							>
								Next
							</button>
						</div>
					{/if}
				</div>
			</td>
		</tr>
	</tfoot>
</table>
