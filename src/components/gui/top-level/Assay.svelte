<script lang="ts">
	import { getAppstate, updateAppstate } from '../../../lib/appstate.svelte';
	import { isaObj } from '../../../stores/isa';
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import { parseIsaLvl, constructStudyPath } from '../../../lib/util/breadcrumbUtils';

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

	// Derive the current study based on isaLvl
	const study = $derived.by(() => {
		const hierarchy = parseIsaLvl(getAppstate().isaLvl);
		if (hierarchy.studyIndex !== undefined) {
			return $isaObj.studies?.[hierarchy.studyIndex];
		}
		return undefined;
	});
</script>

<div class="breadcrumbs text-sm">
	<ul>
		<li><button onclick={openInvestigation}>{$isaObj.title || 'Untitled Investigation'}</button></li>
		<li><button onclick={openStudy}>{study?.title || 'Untitled Study'}</button></li>
		<li>{assay.filename || 'Untitled Assay'}</li>
	</ul>
</div>

<table class="table w-full">
	<tbody>
		<tr>
			<th class="w-1/4 align-top">Filename</th>
			<td>{assay.filename}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Measurement Type</th>
			<td>
				<div>
					{#if assay.measurementType.annotationValue}
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
			<th class="w-1/4 align-top">Comments</th>
			<td>
				{#if assay.comments && assay.comments.length > 0}
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
				{/if}
			</td>
		</tr>
	</tbody>
</table>
