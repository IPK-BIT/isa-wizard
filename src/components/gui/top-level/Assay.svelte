<script lang="ts">
	import { getAppstate, updateAppstate } from '../../../lib/appstate.svelte';
	import { isaObj } from '../../../stores/isa';
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import { parseIsaLvl, constructStudyPath } from '../../../lib/util/breadcrumbUtils';
	import Materials from '../building-blocks/Materials.svelte';
	import ProcessSequence from '../building-blocks/ProcessSequence.svelte';

	let { value: assay = $bindable(), config } = $props();

	function openInvestigation() {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: 'investigation',
			guiType: 'investigation'
		});
	}

	function openStudy() {
		const hierarchy = parseIsaLvl(getAppstate().isaLvl);
		if (hierarchy.studyIndex !== undefined) {
			updateAppstate({
				currentStepIndex: 0,
				mode: 'gui',
				isaLvl: constructStudyPath(hierarchy.studyIndex),
				guiType: 'study'
			});
		}
	}

	function openAssay(template: any) {
		updateAppstate({
			template: template.metadata.code,
			isaLvl: getAppstate().isaLvl,
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	// Derive the current study based on isaLvl
	const study = $derived.by(() => {
		const hierarchy = parseIsaLvl(getAppstate().isaLvl);
		if (hierarchy.studyIndex !== undefined) {
			return $isaObj.studies?.[hierarchy.studyIndex];
		}
		return undefined;
	});
</script>

<div class="flex justify-between">
	<div class="breadcrumbs text-sm">
		<ul>
			<li>
				<button onclick={openInvestigation}>{$isaObj.title || 'Untitled Investigation'}</button>
			</li>
			<li><button onclick={openStudy}>{study?.title || 'Untitled Study'}</button></li>
			<li>
				{assay.filename ||
					assay.comments?.find((c: { name: String; value: string }) => c.name === 'title')?.value ||
					`Assay ${Number((typeof getAppstate === 'function' && getAppstate()?.isaLvl?.match(/assays\[(\d+)\]/)?.[1]) ?? 0) + 1}`}
			</li>
		</ul>
	</div>
	<div>
		{#await Object.values(config.templates).filter((t: any) => t.metadata.type === 'assay')}
			<p>Loading...</p>
		{:then assayTemplates}
			{#if assayTemplates.length === 0}
				<p>No assay templates available</p>
			{:else}
				<ul>
					{#each assayTemplates as template}
						<li>
							<button class="btn btn-primary btn-sm" onclick={() => openAssay(template)}
								>Edit as {(template as any).metadata.label}</button
							>
						</li>
					{/each}
				</ul>
			{/if}
		{:catch error}
			<p>Error loading assay templates: {error.message}</p>
		{/await}
	</div>
</div>

<table class="table w-full table-fixed">
	<tbody>
		<tr>
			<th class="w-1/4 align-top">Filename</th>
			<td>{assay.filename}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Measurement Type</th>
			<td>
				<div>
					{#if assay.measurementType && assay.measurementType.annotationValue}
						<span>{assay.measurementType.annotationValue}</span>
						<BreadcrumbWidget
							api={config['lookup-services'].ts.api}
							iri={assay.measurementType.termAccession}
							ontologyId={assay.measurementType.termSource}
						/>
					{/if}
				</div>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Technology Type</th>
			<td>
				<div>
					{#if assay.technologyType.annotationValue}
						<span>{assay.technologyType.annotationValue}</span>
						<BreadcrumbWidget
							api={config['lookup-services'].ts.api}
							iri={assay.technologyType.termAccession}
							ontologyId={assay.technologyType.termSource}
						/>
					{/if}
				</div>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Technology Platform</th>
			<td>{assay.technologyPlatform}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Materials</th>
			<td>
				<div>
					<Materials materials={assay.materials} {config} />
				</div>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Data Files</th>
			<td>
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Filename</th>
								<th>File Type</th>
							</tr>
						</thead>
						<tbody>
							{#each assay.dataFiles as dataFile}
								<tr>
									<td>{dataFile.name}</td>
									<td><span class="badge badge-sm badge-secondary">{dataFile.type}</span></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Process Sequence</th>
			<td>
				<ProcessSequence processes={assay.processSequence} {config} />
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Comments</th>
			<td>
				{#if assay.comments && assay.comments.length > 0}
					<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Name</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{#each assay.comments as comment}
								<tr>
									<td>{comment.name}</td>
									<td>{comment.value}</td>
								</tr>
							{/each}
						</tbody>
					</table>
					</div>
				{/if}
			</td>
		</tr>
	</tbody>
</table>
