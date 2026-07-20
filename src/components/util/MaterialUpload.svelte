<script lang="ts">
	import { DataFrame } from 'dataframe-js';
	import Modal from '../layout/Modal.svelte';
	import OntologyAnnotation from '../isa/singleton/OntologyAnnotation.svelte';
	import Schema from '../../lib/schemas';

	let { type = 'material', onapprove } = $props();

	let files: FileList | null = $state(null);
	let dataframe: DataFrame | null = $state(null);

	let mappings: {
		[key: string]: {
			type: string;
			mapping: string;
			header: string;
			idx: number;
			annotation: any;
			values: any;
		};
	} = $state({});

	function getUniqueColumnValues(column: string) {
		return Array.from(new Set(dataframe!.toArray(column)));
	}

	async function handleSelect() {
		if (!files || files.length === 0) return;
		const file = files[0];

		// DataFrame.fromCSV can accept CSV content; pass the text and let it parse headers
		const df = await DataFrame.fromCSV(file, true);
		dataframe = df;
		mappings = {};
		for (let column of dataframe.listColumns()) {
			mappings[column] = {
				type: 'string',
				mapping: 'ignore',
				header: '',
				idx: 0,
				annotation: {},
				values: {}
			};
		}
	}

	function next() {
		page = page + 1;
	}

	function prev() {
		page = page - 1;
	}

	function approve() {
		let list: any[] = [];

		for (let row of dataframe!.toCollection()) {
			let emptyObj = Schema.getObjectFromSchema(type);
			let columns = dataframe!.listColumns();
			for (let column of columns) {
				if (mappings[column].mapping === 'name') {
					emptyObj.name = row[column];
				} else if (mappings[column].mapping === 'characteristic') {
					let emptyChar = Schema.getObjectFromSchema('material_attribute_value');
					emptyChar.category = Schema.getObjectFromSchema('material_attribute');
					emptyChar.category.characteristicType = $state.snapshot(mappings[column].annotation);

					if (mappings[column].type === 'ontologyAnnotation') {
						emptyChar.value = $state.snapshot(mappings[column].values[row[column]]);
					} else {
						emptyChar.value = row[column];
					}
					emptyObj.characteristics.push(emptyChar);
				} else if (mappings[column].mapping === 'factor') {
					let emptyFac = Schema.getObjectFromSchema('factor_value');
					emptyFac.category = Schema.getObjectFromSchema('factor');
					emptyFac.category.factorName = column;
					emptyFac.category.factorType = $state.snapshot(mappings[column].annotation);

					if (mappings[column].type === 'ontologyAnnotation') {
						emptyFac.value = $state.snapshot(mappings[column].values[row[column]]);
					} else {
						emptyFac.value = row[column];
					}

					emptyObj.factorValues.push(emptyFac);
				}
			}
			list.push(emptyObj);
		}
		files = null;
		dataframe = null;
		mappings = {};
		onapprove(list);
	}

	function prevOntologyIndex(column: string) {
		if (mappings[column].idx > 0) {
			mappings[column].idx -= 1;
		}
	}

	function nextOntologyIndex(column: string, total: number) {
		if (mappings[column].idx < total - 1) {
			mappings[column].idx += 1;
		}
	}

	let pageSize = 5;
	let page = $state(0);
</script>

{#if !dataframe}
	<fieldset class="fieldset">
		<legend class="fieldset-legend">Select a CSV file</legend>
		<input
			id="file-input"
			accept=".csv,text/csv"
			type="file"
			class="file-input w-full"
			bind:files
			onchange={handleSelect}
		/>
		<label for="file-input" class="label">Allowed file formats: text/csv</label>
	</fieldset>
{:else}
	<div class="flex w-full justify-end">
		<button
			class="btn btn-outline btn-xs btn-error"
			onclick={() => {
				dataframe = null;
				files = null;
				mappings = {};
			}}>Reset</button
		>
	</div>
	<div class="overflow-auto">
		<table class="table">
			<thead>
				<tr>
					<th>Column Header</th>
					<th>Example Value</th>
					<th>Mapping</th>
					<th>Column Type</th>
				</tr>
			</thead>
			<tbody>
				{#each dataframe.listColumns() as column}
					<tr>
						<th>{column}</th>
						<td>{dataframe.toArray(column).at(0)}</td>
						<td class="align-top">
							<select
								class="select w-full"
								bind:value={mappings[column].mapping}
								onchange={() => {
									mappings[column].type = 'string';
								}}
							>
								<option value="ignore">Ignore</option>
								<option
									disabled={Object.values(mappings).some((mapping) => mapping.mapping === 'name') &&
										mappings[column].mapping !== 'name'}
									value="name"
								>
									Entity Name
								</option>
								<option value="characteristic">Characteristic</option>
								{#if type === 'sample'}
									<option value="factor">Factor</option>
								{/if}
							</select>
							{#if ['characteristic', 'factor'].includes(mappings[column].mapping)}
								<OntologyAnnotation bind:value={mappings[column].annotation} attr="" />
							{/if}
						</td>
						<td class="space-y-2 align-top">
							{#if mappings[column].mapping != 'ignore'}
								<select
									class="select w-full"
									bind:value={mappings[column].type}
									onchange={() => {
										mappings[column].values = Object.fromEntries(
											getUniqueColumnValues(column).map((v) => [v, ''])
										);
									}}
								>
									<option value="string">Text</option>
									{#if mappings[column].mapping != 'name'}
										<option value="ontologyAnnotation">Ontology Term</option>
										<option value="number">Numeric Measurement</option>
									{/if}
								</select>
								{#if mappings[column].type === 'ontologyAnnotation'}
									{@const rows = Array.from(new Set(dataframe.toArray(column)))}
									<div class="relative flex items-center">
										<button
											class="btn absolute top-1/2 left-0 z-20 btn-circle -translate-x-1/2 -translate-y-1/2 btn-xs btn-accent"
											onclick={() => prevOntologyIndex(column)}
											disabled={mappings[column].idx === 0}>{'<'}</button
										>
										{#if rows[mappings[column].idx] !== undefined}
											<div
												class="card z-10 mx-0 my-2 w-full max-w-md rounded-xl border bg-base-100 shadow-lg"
												style="border-color: color-mix(in oklab, var(--color-base-content) 20%, #0000);"
											>
												<div class="card-body px-8 py-3">
													<div>
														<span class="label">Column Value</span>
														<span>{rows[mappings[column].idx]}</span>
													</div>
													<div>
														<span class="label">Value Mapping</span>
														<OntologyAnnotation
															bind:value={mappings[column].values[rows[mappings[column].idx]]}
															attr=""
														/>
													</div>
												</div>
											</div>
										{/if}
										<button
											class="btn absolute top-1/2 right-0 z-20 btn-circle translate-x-1/2 -translate-y-1/2 btn-xs btn-accent"
											onclick={() => nextOntologyIndex(column, rows.length)}
											disabled={mappings[column].idx >= rows.length - 1}>{'>'}</button
										>
									</div>
								{/if}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4">
						<button
							disabled={!Object.values(mappings).some((mapping) => mapping.mapping === 'name')}
							class="btn w-full btn-sm btn-accent"
							onclick={approve}
						>
							Approve Mapping
						</button>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
{/if}
