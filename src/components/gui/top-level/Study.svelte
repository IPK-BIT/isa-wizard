<script lang="ts">
	import { getAppstate, updateAppstate } from '../../../lib/appstate.svelte';
	import Schema from '../../../lib/schemas';
	import { isaObj } from '../../../stores/isa';
	import BreadcrumbWidget from '../../ts4nfdi/BreadcrumbWidget.svelte';
	import Materials from '../building-blocks/Materials.svelte';
	import Person from '../building-blocks/Person.svelte';
	import ProcessSequence from '../building-blocks/ProcessSequence.svelte';
	import Protocols from '../building-blocks/Protocols.svelte';
	import Publication from '../building-blocks/Publication.svelte';

	let { value: study = $bindable(), config } = $props();

	function switchToTemplate(template: any) {
		let emptyObj = Schema.getObjectFromSchema('assay');
		study.assays = [...(study.assays ?? []), emptyObj];
		study = study; // trigger reactivity

		updateAppstate({
			template: template.metadata.code,
			isaLvl:
				getAppstate().isaLvl + '.assays[' + (study.assays ? study.assays.length - 1 : 0) + ']',
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	function openAssay(index: number) {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: getAppstate().isaLvl + '.assays[' + index + ']',
			guiType: 'assay'
		});
	}

	function openStudy(template: any) {
		updateAppstate({
			template: template.metadata.code,
			isaLvl: getAppstate().isaLvl,
			currentStepIndex: 0,
			mode: 'wizard',
			guiType: 'investigation'
		});
	}

	function openInvestigation() {
		updateAppstate({
			currentStepIndex: 0,
			mode: 'gui',
			isaLvl: 'investigation',
			guiType: 'investigation'
		});
	}
</script>

<div class="flex justify-between">
	<div class="breadcrumbs text-sm">
		<ul>
			<li>
				<button onclick={openInvestigation}>{$isaObj.title || 'Untitled Investigation'}</button>
			</li>
			<li>{study.title || 'Untitled Study'}</li>
		</ul>
	</div>
	<div>
		{#await Object.values(config.templates).filter((t: any) => t.metadata.type === 'study')}
			<p>Loading...</p>
		{:then studyTemplates}
			{#if studyTemplates.length === 0}
				<p>No study templates available</p>
			{:else}
				<ul>
					{#each studyTemplates as template}
						<li>
							<button class="btn btn-primary btn-sm" onclick={() => openStudy(template)}
								>Edit as {(template as any).metadata.label}</button
							>
						</li>
					{/each}
				</ul>
			{/if}
		{:catch error}
			<p>Error loading study templates: {error.message}</p>
		{/await}
	</div>
</div>

<table class="table w-full">
	<tbody>
		<tr>
			<th class="w-1/4 align-top">Filename</th>
			<td>{study.filename}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Identifier</th>
			<td>{study.identifier}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Title</th>
			<td>{study.title}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Description</th>
			<td>{study.description}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Submission Date</th>
			<td>{study.submissionDate ? new Date(study.submissionDate!).toLocaleDateString() : ''}</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Public Release Date</th>
			<td
				>{study.publicReleaseDate
					? new Date(study.publicReleaseDate!).toLocaleDateString()
					: ''}</td
			>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Publications</th>
			<td>
				<ul>
					{#each study.publications as publication}
						<li><Publication {publication} /></li>
					{/each}
				</ul>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">People</th>
			<td>
				<ul>
					{#each study.people as person}
						<li><Person {person} /></li>
					{/each}
				</ul>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Study Design Descriptors</th>
			<td>
				<table class="table w-full">
					<thead>
						<tr>
							<th>Annotation Value</th>
							<th>Term Accession</th>
						</tr>
					</thead>
					<tbody>
						{#each study.studyDesignDescriptors as studyDesignDescriptor (studyDesignDescriptor)}
							<tr>
								<td>{studyDesignDescriptor.annotationValue}</td>
								<td
									><BreadcrumbWidget
										api={config['lookup-services'].ts.api}
										iri={studyDesignDescriptor.termAccession}
										ontologyId={studyDesignDescriptor.termSource}
									/></td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Protocols</th>
			<td>
				<Protocols protocols={study.protocols} {config} />
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Materials</th>
			<td>
				<Materials materials={study.materials} {config} />
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Process Sequence</th>
			<td>
				<ProcessSequence processes={study.processSequence} {config} />
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Assays</th>
			<td>
				<div>
					{#if study.assays && study.assays.length === 0}
						<span class="text-sm text-neutral/75 italic">No assays defined</span>
					{/if}
					<table class="table">
						<tbody>
							{#each study.assays as assay, i (assay)}
								<tr class="hover:cursor-pointer hover:bg-primary/10" onclick={() => openAssay(i)}>
									<td>
										<span>{assay.filename || assay.comments?.find((c: {name: string, value: string}) => c.name==='title')?.value || `Assay ${i+1}`}</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="mt-2">
					{#await Object.values(config.templates).filter((t: any) => t.metadata.type === 'assay')}
						<p>Loading...</p>
					{:then assayTemplates}
						{#if assayTemplates.length === 0}
							<p>No assay templates available</p>
						{:else}
							<h2 class="font-semibold">Add a new assay</h2>
							<ul>
								{#each assayTemplates as template}
									<li>
										<button
											class="btn btn-outline btn-primary btn-sm"
											onclick={() => switchToTemplate(template)}
											>{(template as any).metadata.label}</button
										>
									</li>
								{/each}
							</ul>
						{/if}
					{:catch error}
						<p>Error loading assay templates: {error.message}</p>
					{/await}
				</div>
			</td>
		</tr>
		<tr>
			<th class="w-1/4 align-top">Comments</th>
			<td>
				{#if study.comments && study.comments.length > 0}
					<table class="table w-full">
						<thead>
							<tr>
								<th>Name</th>
								<th>Value</th>
							</tr>
						</thead>
						<tbody>
							{#each study.comments as comment}
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
