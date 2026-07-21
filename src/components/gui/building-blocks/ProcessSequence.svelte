<script lang="ts">
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';

	let { processes, config } = $props();
</script>

<table class="table">
	<thead>
		<tr>
			<th>Protocol</th>
			<th>Parameter Values</th>
		</tr>
	</thead>
	<tbody>
		{#each processes as process}
			<tr>
				<td class="align-top">{process.executesProtocol.name}</td>
				<td>
					{#if process.parameterValues.length > 0}
						<table class="table">
							<thead>
								<tr>
									<th>Paramter</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>
								{#each process.parameterValues as parameterValue}
									<tr>
										<td>
											<p>{parameterValue.category.parameterName.annotationValue}</p>
											<BreadcrumbWidget
												api={config['lookup-services'].ts.api}
												iri={parameterValue.category.parameterName.termAccession}
												ontologyId={parameterValue.category.parameterName.termSource}
											/>
										</td>
										<td>
											{#if parameterValue.value.annotationValue}
												<p>{parameterValue.value.annotationValue}</p>
												<BreadcrumbWidget
													api={config['lookup-services'].ts.api}
													iri={parameterValue.value.termAccession}
													ontologyId={parameterValue.value.termSource}
												/>
											{:else if typeof parameterValue.value === 'number'}
												{parameterValue.value} {parameterValue.unit.annotationValue}
											{:else}
												{parameterValue.value}
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<span class="text-neutral italic">No Parameter Values available.</span>
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
