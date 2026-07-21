<script lang="ts">
	import type { ISASourceSchema } from '../../lib/types/isa.generated';
	import Modal from '../layout/Modal.svelte';

	export type EntityType = 'Source' | 'Material' | 'Sample' | 'Data';
	export type TypedEntity = { item: ISASourceSchema; type: EntityType };

	let {
		label = 'Select Items',
		availableItems = [],
		allowedTypes = ['Source', 'Material', 'Sample', 'Data'] as EntityType[],
		onapprove
	}: {
		label?: string;
		availableItems: TypedEntity[];
		allowedTypes?: EntityType[];
		onapprove?: (selected: ISASourceSchema[]) => void;
	} = $props();

	let selectedItems = $state<ISASourceSchema[]>([]);
	let searchFilter = $state('');
	let selectedTypes = $state<EntityType[]>([]);
	let currentPage = $state(1);

	const pageSize = 10;
	const badgeClasses: Record<EntityType, string> = {
		Source: 'badge-primary',
		Material: 'badge-secondary',
		Sample: 'badge-accent',
		Data: 'badge-info'
	};

	function isSelected(list: ISASourceSchema[], target: ISASourceSchema): boolean {
		return list.some((item) => item === target || (item.name && item.name === target.name));
	}

	function toggleItemSelection(item: ISASourceSchema) {
		if (isSelected(selectedItems, item)) {
			selectedItems = selectedItems.filter((i) => i !== item && i.name !== item.name);
		} else {
			selectedItems = [...selectedItems, item];
		}
	}

	const filteredItems = $derived(
		availableItems.filter(
			({ item, type }) =>
				selectedTypes.includes(type) &&
				(item.name ?? '').toLowerCase().includes(searchFilter.toLowerCase().trim())
		)
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filteredItems.length / pageSize)));
	const paginatedItems = $derived(
		filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	const areAllFilteredSelected = $derived(
		filteredItems.length > 0 && filteredItems.every(({ item }) => isSelected(selectedItems, item))
	);

	function toggleSelectAll() {
		if (areAllFilteredSelected) {
			const filteredNames = new Set(filteredItems.map((f) => f.item.name));
			selectedItems = selectedItems.filter((item) => !filteredNames.has(item.name));
		} else {
			const newItems = filteredItems.map((f) => f.item);
			const remaining = selectedItems.filter((item) => !newItems.some((n) => n.name === item.name));
			selectedItems = [...remaining, ...newItems];
		}
	}

	function handleOpen() {
		selectedItems = [];
		searchFilter = '';
		selectedTypes = [...allowedTypes];
		currentPage = 1;
	}

	function handleApprove() {
		onapprove?.(selectedItems);
	}

	function toggleTypeFilter(type: EntityType) {
		currentPage = 1;
		if (selectedTypes.includes(type)) {
			selectedTypes = selectedTypes.filter((t) => t !== type);
		} else {
			selectedTypes = [...selectedTypes, type];
		}
	}

	function handleSearchInput() {
		currentPage = 1;
	}
</script>

<Modal {label} class="w-11/12 max-w-5xl" onopen={handleOpen} onapprove={handleApprove}>
	<div class="font-normal">
		<h3 class="mb-3 text-lg font-bold">Select {label}s</h3>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			<!-- Left Column: Faceted Search Controls -->
			<div class="space-y-4 rounded-md bg-base-200 p-4 md:col-span-1">
				<h4 class="text-sm font-semibold">Filter Options</h4>

				<div>
					<input
						type="text"
						placeholder="Search by name..."
						class="input-bordered input w-full input-sm"
						bind:value={searchFilter}
						oninput={handleSearchInput}
					/>
				</div>

				<div>
					<span class="mb-2 block text-xs font-semibold">Entity Type</span>
					<div class="flex flex-col space-y-1">
						{#each allowedTypes as type}
							<label class="label cursor-pointer justify-start space-x-2 py-1">
								<input
									type="checkbox"
									class="checkbox checkbox-xs"
									checked={selectedTypes.includes(type)}
									onchange={() => toggleTypeFilter(type)}
								/>
								<span class="label-text text-xs">{type}</span>
							</label>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right Column: Results Table & Pagination -->
			<div class="flex flex-col justify-between md:col-span-2">
				<div class="overflow-x-auto rounded-md border border-base-200 bg-base-100">
					<table class="table w-full table-sm">
						<thead>
							<tr>
								<th class="w-10">
									<input
										type="checkbox"
										class="checkbox checkbox-xs"
										checked={areAllFilteredSelected}
										onchange={toggleSelectAll}
									/>
								</th>
								<th>Name</th>
								<th class="text-right">Type</th>
							</tr>
						</thead>
						<tbody>
							{#each paginatedItems as { item, type }}
								<tr>
									<td>
										<input
											type="checkbox"
											class="checkbox checkbox-xs"
											checked={isSelected(selectedItems, item)}
											onchange={() => toggleItemSelection(item)}
										/>
									</td>
									<td class="font-medium">{item.name}</td>
									<td class="text-right">
										<div class="badge {badgeClasses[type]}">{type}</div>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="py-4 text-center text-base-content/60">
										No matching items found.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination Footer -->
				<div class="mt-3 flex items-center justify-between text-xs text-base-content/70">
					<span>
						Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
						to {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length}
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
		</div>
	</div>
</Modal>
