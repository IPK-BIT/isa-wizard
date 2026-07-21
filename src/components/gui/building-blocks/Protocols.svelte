<script lang="ts">
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';

	let { protocols, config } = $props();
</script>

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
					<p>{protocol.protocolType.annotationValue}</p>
					<BreadcrumbWidget
						api={config['lookup-services'].ts.api}
						iri={protocol.protocolType.termAccession}
						ontologyId={protocol.protocolType.termSource}
					/>
				</td>
				<td class="align-top">
					<table class="table">
						<tbody>
							{#each protocol.parameters as parameter}
								<tr>
									<td>
										<p>{parameter.parameterName.annotationValue}</p>
										<BreadcrumbWidget
											api={config['lookup-services'].ts.api}
											iri={parameter.parameterName.termAccession}
											ontologyId={parameter.parameterName.termSource}
										/>
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
