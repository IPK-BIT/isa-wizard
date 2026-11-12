<script lang="ts">
	import BreadcrumbWidget from '$components/ts4nfdi/BreadcrumbWidget.svelte';

	let { protocols, config } = $props();
</script>

<div class="overflow-x-auto">
	<table class="table">
		<thead>
			<tr>
				<th>Protocol Name</th>
				<th>Protocol Type</th>
				<th>Protocol Parameters</th>
			</tr>
		</thead>
		<tbody>
			{#each protocols as protocol}
				<tr>
					<td class="align-top">{protocol.name}</td>
					<td class="align-top">
						{#if protocol.protocolType?.annotationValue}
							<p>{protocol.protocolType.annotationValue}</p>
							<BreadcrumbWidget
								api={config['integrations'].ts.api}
								iri={protocol.protocolType.termAccession}
								ontologyId={protocol.protocolType.termSource}
							/>
						{/if}
					</td>
					<td class="align-top">
						<table class="table">
							<tbody>
								{#each protocol.parameters as parameter}
									<tr>
										<td>
											{#if parameter.parameterName?.annotationValue}
												<p>{parameter.parameterName.annotationValue}</p>
												<BreadcrumbWidget
													api={config['integrations'].ts.api}
													iri={parameter.parameterName.termAccession}
													ontologyId={parameter.parameterName.termSource}
												/>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
