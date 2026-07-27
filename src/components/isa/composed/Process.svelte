<script lang="ts">
	import { getAppstate } from '../../../lib/appstate.svelte';
	import { isaObj } from '../../../stores/isa';
	import type {
		ISAProcessParameterValueSchema,
		ISASourceSchema
	} from '../../../lib/types/isa.generated';
	import Select from '../singleton/Select.svelte';
	import String from '../singleton/String.svelte';
	import Schema from '../../../lib/schemas';
	import ParameterValues from '../collection/ParameterValues.svelte';
	import EntitySelectModal, { type TypedEntity } from '../../util/EntitySelectModal.svelte';

	let {
		label = 'Process',
		attr,
		explanation = '',
		value: process = $bindable(),
		showLabel = true,
		onRemove
	} = $props();

	// crop isaLvl to remove assays part if present
	const rawIsaLvl = getAppstate().isaLvl;
	const isaLvl =
		typeof rawIsaLvl === 'string' && rawIsaLvl.includes('.assays')
			? rawIsaLvl.slice(0, rawIsaLvl.indexOf('.assays'))
			: rawIsaLvl;

	const materials = isaObj.keyed(getAppstate().isaLvl + '.materials');
	const dataFiles = isaObj.keyed(getAppstate().isaLvl + '.dataFiles');

	const protocols = isaObj.keyed(isaLvl + '.protocols');
	const protocolOptions = $derived.by(() => {
		const protoList = $protocols;
		return Array.isArray(protoList) ? protoList.map((p) => ({ label: p.name, value: p })) : [];
	});

	$effect(() => {
		const list = $protocols;
		const current = process.executesProtocol;
		if (!Array.isArray(list) || !current) return;

		const match = current['@id']
			? (list.find((p) => p['@id'] === current['@id']) ?? list.find((p) => p.name === current.name))
			: list.find((p) => p.name === current.name);

		if (match && match !== current) {
			process.executesProtocol = match;
		}
	});

	// Dynamic entities derived from state
	const availableSources = $derived.by((): ISASourceSchema[] =>
		Array.isArray($materials.sources) ? $materials.sources : []
	);
	const availableMaterials = $derived.by((): ISASourceSchema[] =>
		Array.isArray($materials.otherMaterials) ? $materials.otherMaterials : []
	);
	const availableSamples = $derived.by((): ISASourceSchema[] =>
		Array.isArray($materials.samples) ? $materials.samples : []
	);
	const availableDataFiles = $derived.by((): ISASourceSchema[] =>
		Array.isArray($dataFiles) ? $dataFiles : []
	);

	// Combine available entities into tagged arrays
	const allInputItems = $derived<TypedEntity[]>([
		...availableSources.map((item) => ({ item, type: 'Source' as const })),
		...availableMaterials.map((item) => ({ item, type: 'Material' as const })),
		...availableSamples.map((item) => ({ item, type: 'Sample' as const })),
		...availableDataFiles.map((item) => ({ item, type: 'Data' as const }))
	]);

	const allOutputItems = $derived<TypedEntity[]>([
		...availableMaterials.map((item) => ({ item, type: 'Material' as const })),
		...availableSamples.map((item) => ({ item, type: 'Sample' as const })),
		...availableDataFiles.map((item) => ({ item, type: 'Data' as const }))
	]);

	// Outer Table Pagination State & Config
	let outerPageSize = $state(10);
	let outerPage = $state(1);

	const maxOuterRows = $derived(
		Math.max(
			Array.isArray(process.inputs) ? process.inputs.length : 0,
			Array.isArray(process.outputs) ? process.outputs.length : 0
		)
	);

	const effectivePageSize = $derived(
		outerPageSize === -1 ? Math.max(maxOuterRows, 1) : outerPageSize
	);

	const totalOuterPages = $derived(Math.max(1, Math.ceil(maxOuterRows / effectivePageSize)));

	const paginatedOuterIndices = $derived.by(() => {
		const size = effectivePageSize;
		const startIdx = (outerPage - 1) * size;
		const count = Math.min(size, Math.max(0, maxOuterRows - startIdx));
		return Array.from({ length: count }, (_, i) => startIdx + i);
	});

	function handlePageSizeChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		outerPageSize = Number(target.value);
		outerPage = 1;
		clearSelection();
	}

	// Selection & Excel Drag-to-Fill State
	let selectedColumn = $state<'input' | 'output' | null>(null);
	let selectionStart = $state<number | null>(null);
	let selectionEnd = $state<number | null>(null);
	let isDraggingFill = $state(false);
	let dragTargetIndex = $state<number | null>(null);

	const selectedRange = $derived.by(() => {
		if (selectionStart === null) return [];
		const end = selectionEnd ?? selectionStart;
		const min = Math.min(selectionStart, end);
		const max = Math.max(selectionStart, end);
		return Array.from({ length: max - min + 1 }, (_, i) => min + i);
	});

	function clearSelection() {
		selectedColumn = null;
		selectionStart = null;
		selectionEnd = null;
		isDraggingFill = false;
		dragTargetIndex = null;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			clearSelection();
		}
	}

	function addInputs(selected: ISASourceSchema[]) {
		const existing = Array.isArray(process.inputs) ? process.inputs : [];
		process.inputs = [...existing, ...selected];
	}

	function addOutputs(selected: ISASourceSchema[]) {
		const existing = Array.isArray(process.outputs) ? process.outputs : [];
		process.outputs = [...existing, ...selected];
	}

	function fillColumnInput(index: number) {
		if (!process.inputs || !process.inputs[index]) return;
		const sourceItem = process.inputs[index];
		const targetLength = Math.max(maxOuterRows, 1);
		process.inputs = Array.from({ length: targetLength }, () => sourceItem);
		closeDropdowns();
		clearSelection();
	}

	function fillColumnOutput(index: number) {
		if (!process.outputs || !process.outputs[index]) return;
		const sourceItem = process.outputs[index];
		const targetLength = Math.max(maxOuterRows, 1);
		process.outputs = Array.from({ length: targetLength }, () => sourceItem);
		closeDropdowns();
		clearSelection();
	}

	function handleCellMouseDown(col: 'input' | 'output', globalIndex: number, event: MouseEvent) {
		if (isDraggingFill) return;

		if (
			selectedColumn === col &&
			selectionStart === globalIndex &&
			selectionEnd === globalIndex &&
			!event.shiftKey
		) {
			clearSelection();
			return;
		}

		if (event.shiftKey && selectedColumn === col && selectionStart !== null) {
			selectionEnd = globalIndex;
		} else {
			selectedColumn = col;
			selectionStart = globalIndex;
			selectionEnd = globalIndex;
		}
	}

	function startFillDrag(col: 'input' | 'output', event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		isDraggingFill = true;
		selectedColumn = col;
	}

	function handleCellMouseEnter(globalIndex: number) {
		if (isDraggingFill) {
			dragTargetIndex = globalIndex;
		}
	}

	function handleGlobalMouseUp() {
		if (!isDraggingFill || selectedColumn === null || selectedRange.length === 0) {
			isDraggingFill = false;
			dragTargetIndex = null;
			return;
		}

		const startIdx = selectedRange[0];
		const endPatternIdx = selectedRange[selectedRange.length - 1];
		const targetIdx = dragTargetIndex ?? endPatternIdx;

		if (targetIdx > endPatternIdx) {
			// Fill downward: extend the pattern below the selection
			if (selectedColumn === 'input') {
				const existing = Array.isArray(process.inputs) ? [...process.inputs] : [];
				const pattern = existing.slice(startIdx, endPatternIdx + 1);

				if (pattern.length > 0) {
					for (let i = endPatternIdx + 1; i <= targetIdx; i++) {
						const offset = (i - (endPatternIdx + 1)) % pattern.length;
						existing[i] = pattern[offset];
					}
					process.inputs = existing;
				}
			} else if (selectedColumn === 'output') {
				const existing = Array.isArray(process.outputs) ? [...process.outputs] : [];
				const pattern = existing.slice(startIdx, endPatternIdx + 1);

				if (pattern.length > 0) {
					for (let i = endPatternIdx + 1; i <= targetIdx; i++) {
						const offset = (i - (endPatternIdx + 1)) % pattern.length;
						existing[i] = pattern[offset];
					}
					process.outputs = existing;
				}
			}
		} else if (targetIdx < startIdx) {
			if (selectedColumn === 'input') {
				const existing = Array.isArray(process.inputs) ? [...process.inputs] : [];
				const pattern = existing.slice(startIdx, endPatternIdx + 1);

				if (pattern.length > 0) {
					for (let i = startIdx - 1; i >= targetIdx; i--) {
						const offset = (startIdx - 1 - i) % pattern.length;
						existing[i] = pattern[pattern.length - 1 - offset];
					}
					process.inputs = existing;
				}
			} else if (selectedColumn === 'output') {
				const existing = Array.isArray(process.outputs) ? [...process.outputs] : [];
				const pattern = existing.slice(startIdx, endPatternIdx + 1);

				if (pattern.length > 0) {
					for (let i = startIdx - 1; i >= targetIdx; i--) {
						const offset = (startIdx - 1 - i) % pattern.length;
						existing[i] = pattern[pattern.length - 1 - offset];
					}
					process.outputs = existing;
				}
			}
		}

		isDraggingFill = false;
		dragTargetIndex = null;
	}

	function deleteRow(index: number) {
		if (Array.isArray(process.inputs) && index < process.inputs.length) {
			process.inputs = process.inputs.filter((_: unknown, i: number) => i !== index);
		}
		if (Array.isArray(process.outputs) && index < process.outputs.length) {
			process.outputs = process.outputs.filter((_: unknown, i: number) => i !== index);
		}

		if (outerPage > totalOuterPages) {
			outerPage = totalOuterPages;
		}
		clearSelection();
		closeDropdowns();
	}

	function closeDropdowns() {
		if (typeof document !== 'undefined') {
			const activeElement = document.activeElement as HTMLElement | null;
			if (activeElement) {
				activeElement.blur();
			}
		}
	}

	function updateParameters() {
		const protocolParameters = process.executesProtocol?.parameters;
		if (!Array.isArray(protocolParameters)) {
			process.parameterValues = [];
			return;
		}

		process.parameterValues = protocolParameters.map((parameter) => {
			let emptyParameterValue = Schema.getObjectFromSchema('process_parameter_value');
			emptyParameterValue!.category = parameter;
			return emptyParameterValue;
		});
	}
</script>

<svelte:window onmouseup={handleGlobalMouseUp} onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="space-y-4 rounded-lg border border-neutral bg-base-200 p-4 select-none"
	onclick={(e) => {
		if (e.target === e.currentTarget) clearSelection();
	}}
>
	<String
		label="Name"
		attr="name"
		explanation="The name of the Process"
		bind:value={process.name}
		showLabel={true}
	/>

	<Select
		label="Protocol"
		attr="executesProtocol"
		explanation="The name of the executed Protocol"
		options={protocolOptions}
		bind:value={process.executesProtocol}
		onChange={updateParameters}
		showLabel={true}
	/>

	<ParameterValues
		label="Parameter Values"
		attr="parameterValues"
		explanation="Values of the Protocol Parameters"
		bind:value={process.parameterValues}
		showLabel={true}
	/>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Materials</legend>
		<div
			class="rounded-lg border bg-base-100 p-2 {process.inputs.length === process.outputs.length
				? 'border-base-300'
				: 'border-error'}"
		>
			<table class="table w-full overflow-visible table-sm">
				<thead>
					<tr>
						<th class="border-r border-base-200 pr-4">
							<EntitySelectModal
								label="Input"
								availableItems={allInputItems}
								allowedTypes={['Source', 'Material', 'Sample', 'Data']}
								onapprove={addInputs}
							/>
						</th>
						<th class="pl-4">
							<EntitySelectModal
								label="Output"
								availableItems={allOutputItems}
								allowedTypes={['Material', 'Sample', 'Data']}
								onapprove={addOutputs}
							/>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each paginatedOuterIndices as i}
						{@const isInputSelected = selectedColumn === 'input' && selectedRange.includes(i)}
						{@const isOutputSelected = selectedColumn === 'output' && selectedRange.includes(i)}
						{@const isInputLastSelected =
							selectedColumn === 'input' && selectedRange[selectedRange.length - 1] === i}
						{@const isOutputLastSelected =
							selectedColumn === 'output' && selectedRange[selectedRange.length - 1] === i}
						{@const isInputDraggedOver =
							isDraggingFill &&
							selectedColumn === 'input' &&
							dragTargetIndex !== null &&
							((i > selectedRange[selectedRange.length - 1] && i <= dragTargetIndex) ||
								(i < selectedRange[0] && i >= dragTargetIndex))}
						{@const isOutputDraggedOver =
							isDraggingFill &&
							selectedColumn === 'output' &&
							dragTargetIndex !== null &&
							((i > selectedRange[selectedRange.length - 1] && i <= dragTargetIndex) ||
								(i < selectedRange[0] && i >= dragTargetIndex))}

						<tr>
							<!-- INPUT CELL -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<td
								class="relative cursor-pointer border-r border-base-200 pr-4 transition-colors
									{isInputSelected ? 'bg-primary/10 ring-1 ring-primary ring-inset' : ''}
									{isInputDraggedOver ? 'border-b border-dashed border-primary bg-primary/20' : ''}"
								onmousedown={(e) => handleCellMouseDown('input', i, e)}
								onmouseenter={() => handleCellMouseEnter(i)}
							>
								{#if process.inputs.length > i}
									<div class="flex items-center justify-between gap-2">
										<span>{process.inputs[i].name}</span>

										<div class="dropdown dropdown-end">
											<div
												tabindex="0"
												role="button"
												class="btn btn-circle btn-ghost btn-xs"
												onclick={(e) => e.stopPropagation()}
											>
												<span class="text-base font-bold">⋮</span>
											</div>
											<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-30 w-44 rounded-box border border-base-200 bg-base-100 p-1 text-xs shadow"
											>
												<li>
													<button type="button" onclick={() => fillColumnInput(i)}>
														Fill entire column
													</button>
												</li>
												<li>
													<button
														type="button"
														class="text-error hover:bg-error/10"
														onclick={() => deleteRow(i)}
													>
														Delete Row
													</button>
												</li>
											</ul>
										</div>
									</div>

									<!-- Excel Fill Handle -->
									{#if isInputLastSelected}
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											class="absolute right-0 bottom-0 z-20 h-3 w-3 cursor-crosshair bg-primary transition-transform hover:scale-125"
											title="Drag to fill sequence"
											onmousedown={(e) => startFillDrag('input', e)}
										></div>
									{/if}
								{:else}
									<div class="flex items-center justify-between gap-2">
										<span class="font-medium text-error">Missing Input</span>
										<div class="dropdown dropdown-end">
											<div
												tabindex="0"
												role="button"
												class="btn btn-circle btn-ghost btn-xs"
												onclick={(e) => e.stopPropagation()}
											>
												<span class="text-base font-bold">⋮</span>
											</div>
											<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-30 w-44 rounded-box border border-base-200 bg-base-100 p-1 text-xs shadow"
											>
												<li>
													<button
														type="button"
														class="text-error hover:bg-error/10"
														onclick={() => deleteRow(i)}
													>
														Delete Row
													</button>
												</li>
											</ul>
										</div>
									</div>
								{/if}
							</td>

							<!-- OUTPUT CELL -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<td
								class="relative cursor-pointer pl-4 transition-colors
									{isOutputSelected ? 'bg-primary/10 ring-1 ring-primary ring-inset' : ''}
									{isOutputDraggedOver ? 'border-b border-dashed border-primary bg-primary/20' : ''}"
								onmousedown={(e) => handleCellMouseDown('output', i, e)}
								onmouseenter={() => handleCellMouseEnter(i)}
							>
								{#if process.outputs.length > i}
									<div class="flex items-center justify-between gap-2">
										<span>{process.outputs[i].name}</span>

										<div class="dropdown dropdown-end">
											<div
												tabindex="0"
												role="button"
												class="btn btn-circle btn-ghost btn-xs"
												onclick={(e) => e.stopPropagation()}
											>
												<span class="text-base font-bold">⋮</span>
											</div>
											<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-30 w-44 rounded-box border border-base-200 bg-base-100 p-1 text-xs shadow"
											>
												<li>
													<button type="button" onclick={() => fillColumnOutput(i)}>
														Fill entire column
													</button>
												</li>
												<li>
													<button
														type="button"
														class="text-error hover:bg-error/10"
														onclick={() => deleteRow(i)}
													>
														Delete Row
													</button>
												</li>
											</ul>
										</div>
									</div>

									<!-- Excel Fill Handle -->
									{#if isOutputLastSelected}
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											class="absolute right-0 bottom-0 z-20 h-3 w-3 cursor-crosshair bg-primary transition-transform hover:scale-125"
											title="Drag to fill sequence"
											onmousedown={(e) => startFillDrag('output', e)}
										></div>
									{/if}
								{:else}
									<div class="flex items-center justify-between gap-2">
										<span class="font-medium text-error">Missing Output</span>
										<div class="dropdown dropdown-end">
											<div
												tabindex="0"
												role="button"
												class="btn btn-circle btn-ghost btn-xs"
												onclick={(e) => e.stopPropagation()}
											>
												<span class="text-base font-bold">⋮</span>
											</div>
											<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
											<ul
												tabindex="0"
												class="dropdown-content menu z-30 w-44 rounded-box border border-base-200 bg-base-100 p-1 text-xs shadow"
											>
												<li>
													<button
														type="button"
														class="text-error hover:bg-error/10"
														onclick={() => deleteRow(i)}
													>
														Delete Row
													</button>
												</li>
											</ul>
										</div>
									</div>
								{/if}
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="2" class="py-4 text-center text-xs text-base-content/60">
								No materials added yet.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<!-- Outer Table Pagination Footer with Size Selector -->
			{#if maxOuterRows > 0}
				<div
					class="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-base-200 px-2 pt-2 text-xs text-base-content/70"
				>
					<div class="flex items-center gap-3">
						<span class="whitespace-nowrap">
							Showing {(outerPage - 1) * effectivePageSize + 1} to {Math.min(
								outerPage * effectivePageSize,
								maxOuterRows
							)} of {maxOuterRows} entries
						</span>
						<p>|</p>
						<label class="flex items-center gap-1.5 whitespace-nowrap">
							<span>Per page:</span>
							<select
								class="select-bordered select select-xs"
								value={outerPageSize}
								onchange={handlePageSizeChange}
							>
								<option value={5}>5</option>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
								<option value={-1}>All</option>
							</select>
						</label>
					</div>

					<div class="join">
						<button
							class="btn join-item btn-xs"
							disabled={outerPage <= 1}
							onclick={() => {
								outerPage--;
								clearSelection();
							}}
						>
							« Prev
						</button>
						<button class="no-animation btn pointer-events-none join-item btn-xs">
							{outerPage} / {totalOuterPages}
						</button>
						<button
							class="btn join-item btn-xs"
							disabled={outerPage >= totalOuterPages}
							onclick={() => {
								outerPage++;
								clearSelection();
							}}
						>
							Next »
						</button>
					</div>
				</div>
			{/if}
		</div>
	</fieldset>
</div>